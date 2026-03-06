import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { parseCSVLine } from '@/hooks/useFileUpload';
import { calculateIPIP120Profile, reorderResponsesFromSheet } from '@/lib/ipip120';
import { createProfile } from '@/lib/bigfive';

/** Gera um ID estável baseado no email (mesmo padrão do formulário de 30 questões) */
function emailToId(email: string): string {
  const normalized = email.trim().toLowerCase();
  try {
    return 'ipip_' + btoa(normalized).replace(/[+/=]/g, c => ({ '+': '-', '/': '_', '=': '' }[c] ?? c));
  } catch {
    return 'ipip_' + normalized.replace(/[^a-z0-9]/g, '_').slice(0, 40);
  }
}

/**
 * Parseia o CSV da planilha IPIP-NEO-120 (120 questões)
 * Estrutura esperada: Timestamp | Email | Nome | Q1 | Q2 | ... | Q120
 */
export function parseIPIP120CSV(csvText: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    // Planilha só tem cabeçalho (sem respostas ainda) — retorna array vazio
    return [];
  }

  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map(line => parseCSVLine(line));

  // Encontrar índices das colunas de metadados
  let timestampIdx = -1;
  let emailIdx = -1;
  let nameIdx = -1;

  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].toLowerCase();
    if (h.includes('carimbo') || h.includes('timestamp') || h.includes('data')) {
      timestampIdx = i;
    } else if (h.includes('e-mail') || h.includes('email') || h.includes('endereço')) {
      emailIdx = i;
    } else if (h.includes('nome') || h.includes('name')) {
      nameIdx = i;
    }
  }

  if (timestampIdx === -1 || emailIdx === -1 || nameIdx === -1) {
    throw new Error(
      `Planilha IPIP-120 não contém as colunas esperadas.\n` +
      `Colunas encontradas: ${headers.slice(0, 5).join(', ')}...`
    );
  }

  // Questões começam na coluna 4 (índice 3)
  const questionsStartIdx = 3;
  const profiles: any[] = [];

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i];

    if (!cells || cells.length === 0 || !cells[nameIdx]) continue;

    if (cells.length < questionsStartIdx + 120) {
      console.warn(`Linha ${i + 2} incompleta para IPIP-120 (${cells.length} colunas), pulando...`);
      continue;
    }

    // Extrair as 120 respostas numéricas na ordem da planilha
    const sheetValues: number[] = [];
    for (let j = questionsStartIdx; j < questionsStartIdx + 120; j++) {
      const responseText = String(cells[j] || '3');
      const match = responseText.match(/^(\d)/);
      const score = match ? parseInt(match[1], 10) : 3;
      sheetValues.push(Math.max(1, Math.min(5, score)));
    }
    
    // Reordenar para a ordem sequencial Q1-Q120 (a planilha usa ordem por subfaceta)
    const responseValues = reorderResponsesFromSheet(sheetValues);

    try {
      const email = String(cells[emailIdx] || '');
      const name = String(cells[nameIdx] || '');
      const timestamp = String(cells[timestampIdx] || '');

      // Calcular perfil IPIP-120 com escores reais de subfacetas
      const ipip120 = calculateIPIP120Profile(responseValues);

      // Criar perfil Big Five padrão usando os escores das 5 dimensões do IPIP-120
      // Convertemos os escores 0-100 para escala 1-5 para compatibilidade com createProfile
      const scaledResponses = [
        // 6 respostas sintéticas por dimensão (escala 1-5 baseada no escore 0-100)
        ...Array(6).fill(Math.round(ipip120.openness / 25) + 1),
        ...Array(6).fill(Math.round(ipip120.conscientiousness / 25) + 1),
        ...Array(6).fill(Math.round(ipip120.extraversion / 25) + 1),
        ...Array(6).fill(Math.round(ipip120.agreeableness / 25) + 1),
        ...Array(6).fill(Math.round(ipip120.emotionalStability / 25) + 1),
      ].map(v => Math.max(1, Math.min(5, v)));

      const stableId = emailToId(email);
      const profile = createProfile({ timestamp, email, name, responses: scaledResponses }, stableId);

      // Enriquecer o perfil com os dados reais do IPIP-120
      (profile as any).rawResponses = responseValues;
      (profile as any).ipip120Data = ipip120;  // Será salvo no banco
      (profile as any).testVersion = 'ipip120';

      profiles.push(profile);
    } catch (error) {
      console.warn(`Erro ao processar linha ${i + 2} do IPIP-120:`, error);
      continue;
    }
  }

  return profiles;
}

export function useIPIP120Sheets() {
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const utils = trpc.useUtils();

  const fetchIPIP120Data = useCallback(async () => {
    try {
      setLoading(true);
      const result = await utils.sheets.fetchResponsesIPIP120.fetch();

      if (!result?.csv) {
        throw new Error('Nenhum dado retornado da planilha IPIP-120');
      }

      const profiles = parseIPIP120CSV(result.csv);

      setLastUpdate(new Date());
      return profiles;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao buscar planilha IPIP-120';
      console.error('Erro IPIP-120:', error);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [utils]);

  return { fetchIPIP120Data, loading, lastUpdate };
}
