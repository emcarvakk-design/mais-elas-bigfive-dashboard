import { BigFiveResponse, createProfile } from '@/lib/bigfive';
import { nanoid } from 'nanoid';

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

export function useFileUpload() {
  const processFile = async (file: File): Promise<any[]> => {
    const text = await file.text();
    
    // Dividir em linhas e filtrar vazias
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('Arquivo vazio ou inválido');
    }

    // Parsear header usando o parser robusto
    const headers = parseCSVLine(lines[0]);

    // Encontrar índices das colunas importantes
    const timestampIdx = headers.findIndex(h => 
      h.toLowerCase().includes('carimbo') || h.toLowerCase().includes('timestamp')
    );
    const emailIdx = headers.findIndex(h => 
      h.toLowerCase().includes('e-mail') || h.toLowerCase().includes('email')
    );
    const nameIdx = headers.findIndex(h => 
      h.toLowerCase().includes('nome') || h.toLowerCase().includes('name')
    );

    if (timestampIdx === -1 || emailIdx === -1 || nameIdx === -1) {
      throw new Error('Arquivo não contém as colunas esperadas (timestamp, email, nome)');
    }

    // Questões começam na coluna 4 (índice 3)
    const questionsStartIdx = 3;
    const responses: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Usar o parser robusto
      const cells = parseCSVLine(line);

      if (cells.length < questionsStartIdx + 30) {
        console.warn(`Linha ${i + 1} incompleta (${cells.length} colunas), pulando...`);
        continue;
      }

      // Extrair respostas numéricas (1-5) do formato "5 — Concordo totalmente"
      const responseValues: number[] = [];
      for (let j = questionsStartIdx; j < questionsStartIdx + 30; j++) {
        const responseText = cells[j] || '3';
        // Extrair o primeiro número (1-5)
        const match = responseText.match(/^(\d)/);
        const score = match ? parseInt(match[1], 10) : 3;
        responseValues.push(Math.max(1, Math.min(5, score))); // Garantir 1-5
      }

      try {
        const bigFiveResponse: BigFiveResponse = {
          timestamp: cells[timestampIdx],
          email: cells[emailIdx],
          name: cells[nameIdx],
          responses: responseValues,
        };

        const profile = createProfile(bigFiveResponse, nanoid());
        responses.push(profile);
      } catch (error) {
        console.warn(`Erro ao processar linha ${i + 1}:`, error);
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
