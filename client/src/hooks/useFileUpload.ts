import { BigFiveResponse, createProfile } from '@/lib/bigfive';
import * as XLSX from 'xlsx';

/** Gera um ID estável e único baseado no email do respondente.
 * Isso garante que o upsert no banco funcione corretamente:
 * a mesma pessoa sempre terá o mesmo ID, independente de quantas
 * vezes a planilha for sincronizada. */
function emailToId(email: string): string {
  // Simples hash determinístico: base64url do email normalizado
  const normalized = email.trim().toLowerCase();
  // Usar btoa com prefixo para garantir compatibilidade
  try {
    return 'bf_' + btoa(normalized).replace(/[+/=]/g, c => ({ '+': '-', '/': '_', '=': '' }[c] ?? c));
  } catch {
    // Fallback: remover caracteres especiais
    return 'bf_' + normalized.replace(/[^a-z0-9]/g, '_').slice(0, 40);
  }
}

// Parsear CSV - lida com aspas e vírgulas dentro de campos
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

// Função exportada para parsear dados CSV (usada também pelo Google Sheets)
export function parseCSVData(csvText: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('Arquivo vazio ou inválido');
  }

  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map(line => parseCSVLine(line));

  console.log('Headers encontrados:', headers);

  // Encontrar índices das colunas com busca mais flexível
  let timestampIdx = -1;
  let emailIdx = -1;
  let nameIdx = -1;

  // Procurar timestamp/carimbo
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].toLowerCase();
    if (h.includes('carimbo') || h.includes('timestamp') || h.includes('data')) {
      timestampIdx = i;
      break;
    }
  }

  // Procurar email
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].toLowerCase();
    if (h.includes('e-mail') || h.includes('email') || h.includes('endereço')) {
      emailIdx = i;
      break;
    }
  }

  // Procurar nome
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].toLowerCase();
    if (h.includes('nome') || h.includes('name') || h.includes('respondent')) {
      nameIdx = i;
      break;
    }
  }

  console.log(`Índices encontrados: timestamp=${timestampIdx}, email=${emailIdx}, nome=${nameIdx}`);

  if (timestampIdx === -1 || emailIdx === -1 || nameIdx === -1) {
    console.error('Colunas não encontradas. Headers:', headers);
    throw new Error(
      `Arquivo não contém as colunas esperadas.\n\n` +
      `Procurando por: Timestamp/Carimbo, Email, Nome\n` +
      `Colunas encontradas: ${headers.join(', ')}\n\n` +
      `Certifique-se de que o arquivo foi exportado corretamente do Google Forms.`
    );
  }

  // Questões começam na coluna 4 (índice 3)
  const questionsStartIdx = 3;
  const responses: any[] = [];

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i];

    // Pular linhas vazias
    if (!cells || cells.length === 0 || !cells[nameIdx]) continue;

    if (cells.length < questionsStartIdx + 30) {
      console.warn(`Linha ${i + 2} incompleta (${cells.length} colunas), pulando...`);
      continue;
    }

    // Extrair respostas numéricas (1-5) do formato "5 — Concordo totalmente" ou apenas "5"
    const responseValues: number[] = [];
    for (let j = questionsStartIdx; j < questionsStartIdx + 30; j++) {
      const responseText = String(cells[j] || '3');
      // Extrair o primeiro número (1-5)
      const match = responseText.match(/^(\d)/);
      const score = match ? parseInt(match[1], 10) : 3;
      responseValues.push(Math.max(1, Math.min(5, score))); // Garantir 1-5
    }

    try {
      const bigFiveResponse: BigFiveResponse = {
        timestamp: String(cells[timestampIdx] || ''),
        email: String(cells[emailIdx] || ''),
        name: String(cells[nameIdx] || ''),
        responses: responseValues,
      };

      const stableId = emailToId(bigFiveResponse.email);
      const profile = createProfile(bigFiveResponse, stableId);
      // Preservar rawResponses para salvar no banco
      (profile as any).rawResponses = responseValues;
      responses.push(profile);
    } catch (error) {
      console.warn(`Erro ao processar linha ${i + 2}:`, error);
      continue;
    }
  }

  if (responses.length === 0) {
    throw new Error('Nenhum perfil válido encontrado no arquivo');
  }

  return responses;
}

export function useFileUpload() {
  const processFile = async (file: File): Promise<any[]> => {
    let headers: string[] = [];
    let rows: any[][] = [];

    // Detectar formato do arquivo
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      // Processar arquivo Excel
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Converter para array de arrays
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (data.length < 2) {
        throw new Error('Arquivo vazio ou inválido');
      }

      // Primeira linha são os headers
      headers = (data[0] || []).map(h => String(h || '').trim());
      rows = data.slice(1);
    } else {
      // Processar arquivo CSV/TSV
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('Arquivo vazio ou inválido');
      }

      headers = parseCSVLine(lines[0]);
      rows = lines.slice(1).map(line => parseCSVLine(line));
    }

    console.log('Headers encontrados:', headers);

    // Encontrar índices das colunas com busca mais flexível
    let timestampIdx = -1;
    let emailIdx = -1;
    let nameIdx = -1;

    // Procurar timestamp/carimbo
    for (let i = 0; i < headers.length; i++) {
      const h = headers[i].toLowerCase();
      if (h.includes('carimbo') || h.includes('timestamp') || h.includes('data')) {
        timestampIdx = i;
        break;
      }
    }

    // Procurar email
    for (let i = 0; i < headers.length; i++) {
      const h = headers[i].toLowerCase();
      if (h.includes('e-mail') || h.includes('email') || h.includes('endereço')) {
        emailIdx = i;
        break;
      }
    }

    // Procurar nome
    for (let i = 0; i < headers.length; i++) {
      const h = headers[i].toLowerCase();
      if (h.includes('nome') || h.includes('name') || h.includes('respondent')) {
        nameIdx = i;
        break;
      }
    }

    console.log(`Índices encontrados: timestamp=${timestampIdx}, email=${emailIdx}, nome=${nameIdx}`);

    if (timestampIdx === -1 || emailIdx === -1 || nameIdx === -1) {
      console.error('Colunas não encontradas. Headers:', headers);
      throw new Error(
        `Arquivo não contém as colunas esperadas.\n\n` +
        `Procurando por: Timestamp/Carimbo, Email, Nome\n` +
        `Colunas encontradas: ${headers.join(', ')}\n\n` +
        `Certifique-se de que o arquivo foi exportado corretamente do Google Forms.`
      );
    }

    // Questões começam na coluna 4 (índice 3)
    const questionsStartIdx = 3;
    const responses: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i];

      // Pular linhas vazias
      if (!cells || cells.length === 0 || !cells[nameIdx]) continue;

      if (cells.length < questionsStartIdx + 30) {
        console.warn(`Linha ${i + 2} incompleta (${cells.length} colunas), pulando...`);
        continue;
      }

      // Extrair respostas numéricas (1-5) do formato "5 — Concordo totalmente" ou apenas "5"
      const responseValues: number[] = [];
      for (let j = questionsStartIdx; j < questionsStartIdx + 30; j++) {
        const responseText = String(cells[j] || '3');
        // Extrair o primeiro número (1-5)
        const match = responseText.match(/^(\d)/);
        const score = match ? parseInt(match[1], 10) : 3;
        responseValues.push(Math.max(1, Math.min(5, score))); // Garantir 1-5
      }

      try {
        const bigFiveResponse: BigFiveResponse = {
          timestamp: String(cells[timestampIdx] || ''),
          email: String(cells[emailIdx] || ''),
          name: String(cells[nameIdx] || ''),
          responses: responseValues,
        };

        const stableId = emailToId(bigFiveResponse.email);
        const profile = createProfile(bigFiveResponse, stableId);
        (profile as any).rawResponses = responseValues;
        responses.push(profile);
      } catch (error) {
        console.warn(`Erro ao processar linha ${i + 2}:`, error);
        continue;
      }
    }

    if (responses.length === 0) {
      throw new Error('Nenhum perfil válido encontrado no arquivo');
    }

    return responses;
  };

  return { processFile };
}
