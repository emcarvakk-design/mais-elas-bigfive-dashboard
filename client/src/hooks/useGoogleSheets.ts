import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { parseCSVData } from '@/hooks/useFileUpload';

export function useGoogleSheets() {
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Usar o utilitário tRPC para chamar a rota backend
  const utils = trpc.useUtils();

  const fetchSheetData = useCallback(async () => {
    try {
      setLoading(true);

      // Chamar o backend proxy (evita CORS)
      const result = await utils.sheets.fetchResponses.fetch();

      if (!result?.csv) {
        throw new Error('Nenhum dado retornado da planilha');
      }

      // Parsear o CSV retornado pelo backend
      const profiles = parseCSVData(result.csv);

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
  }, [utils]);

  return {
    fetchSheetData,
    loading,
    lastUpdate,
  };
}
