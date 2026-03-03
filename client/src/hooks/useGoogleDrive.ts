import { useState, useCallback } from 'react';
import { BigFiveProfile, createProfile } from '@/lib/bigfive';
import { nanoid } from 'nanoid';

// ID da planilha no Google Drive (exportada do Google Forms)
const SPREADSHEET_ID = '1SKZ2nUlCF61Oe6eS1-kEynwlbJRc7E3vKCxZqejnHA0';

// Parsear CSV - lida com aspas e vírgulas dentro de campos
function parseCSVLine(line: string): string[] {
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

export function useGoogleDrive() {
  const [loading, setLoading] = useState(false);

  const fetchFromGoogleSheets = useCallback(async (): Promise<BigFiveProfile[]> => {
    setLoading(true);
    try {
      // Buscar CSV do Google Sheets
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar dados do Google Sheets');
      }

      const csv = await response.text();
      const lines = csv.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        throw new Error('Planilha vazia ou sem dados');
      }

      const headers = parseCSVLine(lines[0]);

      // Encontrar índices das colunas
      const timestampIdx = headers.findIndex(h => h.toLowerCase().includes('carimbo'));
      const emailIdx = headers.findIndex(h => h.toLowerCase().includes('e-mail'));
      const nameIdx = headers.findIndex(h => h.toLowerCase().includes('nome'));

      if (timestampIdx === -1 || emailIdx === -1 || nameIdx === -1) {
        throw new Error('Colunas esperadas não encontradas');
      }

      const profiles: BigFiveProfile[] = [];
      const questionsStartIdx = 3; // Colunas 4-33 (índices 3-32)

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const cells = parseCSVLine(line);

        // Verificar se tem todas as 30 respostas
        if (cells.length < questionsStartIdx + 30) {
          console.warn(`Linha ${i + 1} incompleta, pulando...`);
          continue;
        }

        // Extrair respostas numéricas (1-5) do formato "5 — Concordo totalmente"
        const responseValues: number[] = [];
        for (let j = questionsStartIdx; j < questionsStartIdx + 30; j++) {
          const responseText = cells[j] || '3';
          // Extrair o primeiro número (1-5)
          const match = responseText.match(/^(\d)/);
          const score = match ? parseInt(match[1], 10) : 3;
          responseValues.push(Math.max(1, Math.min(5, score)));
        }

        try {
          const profile = createProfile(
            {
              timestamp: cells[timestampIdx],
              email: cells[emailIdx],
              name: cells[nameIdx],
              responses: responseValues,
            },
            nanoid()
          );

          profiles.push(profile);
        } catch (error) {
          console.warn(`Erro ao processar linha ${i + 1}:`, error);
          continue;
        }
      }

      if (profiles.length === 0) {
        throw new Error('Nenhum perfil válido encontrado');
      }

      return profiles;
    } catch (error) {
      console.error('Erro ao buscar dados do Google Drive:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchFromGoogleSheets, loading };
}
