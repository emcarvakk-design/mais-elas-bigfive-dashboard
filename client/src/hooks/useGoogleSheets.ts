import { useState, useCallback } from 'react';
import { BigFiveProfile } from '@/lib/bigfive';
import { parseCSVData } from '@/hooks/useFileUpload';
import { toast } from 'sonner';

// ID da planilha Google Sheets
const SHEET_ID = '1gStVG2NRfrQe7E2fGMU1RC2xwRd2ZGcX50oJHLeG-3U';
const SHEET_GID = '724087005'; // ID da aba "Respostas"

export function useGoogleSheets() {
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchSheetData = useCallback(async (): Promise<BigFiveProfile[]> => {
    try {
      setLoading(true);

      // URL para exportar a planilha como CSV
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.statusText}`);
      }

      const csvText = await response.text();
      if (!csvText.trim()) {
        throw new Error('Planilha vazia ou inacessível');
      }

      // Parsear o CSV
      const profiles = parseCSVData(csvText);
      
      if (profiles.length === 0) {
        throw new Error('Nenhuma resposta válida encontrada na planilha');
      }

      setLastUpdate(new Date());
      return profiles;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar dados do Google Sheets';
      console.error('Erro ao buscar Google Sheets:', error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    fetchSheetData,
    loading,
    lastUpdate,
  };
}
