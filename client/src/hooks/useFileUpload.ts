import { BigFiveResponse, createProfile } from '@/lib/bigfive';
import { nanoid } from 'nanoid';

export function useFileUpload() {
  const processFile = async (file: File): Promise<any[]> => {
    const text = await file.text();
    
    // Detectar se é CSV ou TSV
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('Arquivo vazio ou inválido');
    }

    // Parsear header
    const headerLine = lines[0];
    const delimiter = headerLine.includes('\t') ? '\t' : ',';
    const headers = headerLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));

    // Encontrar índices das colunas importantes
    const timestampIdx = headers.findIndex(h => h.includes('Carimbo') || h.includes('timestamp'));
    const emailIdx = headers.findIndex(h => h.includes('e-mail') || h.includes('Email'));
    const nameIdx = headers.findIndex(h => h.includes('nome') || h.includes('Name'));

    if (timestampIdx === -1 || emailIdx === -1 || nameIdx === -1) {
      throw new Error('Arquivo não contém as colunas esperadas (timestamp, email, nome)');
    }

    // Questões começam na coluna 4 (índice 3)
    const questionsStartIdx = 3;
    const responses: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const cells = line.split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));

      if (cells.length < questionsStartIdx + 30) {
        continue; // Pular linhas incompletas
      }

      // Extrair respostas (converter "5 — Concordo totalmente" para 5)
      const responseValues: number[] = [];
      for (let j = questionsStartIdx; j < questionsStartIdx + 30; j++) {
        const response = cells[j];
        const match = response.match(/^(\d)/);
        const score = match ? parseInt(match[1]) : 3;
        responseValues.push(score);
      }

      const bigFiveResponse: BigFiveResponse = {
        timestamp: cells[timestampIdx],
        email: cells[emailIdx],
        name: cells[nameIdx],
        responses: responseValues,
      };

      const profile = createProfile(bigFiveResponse, nanoid());
      responses.push(profile);
    }

    return responses;
  };

  return { processFile };
}
