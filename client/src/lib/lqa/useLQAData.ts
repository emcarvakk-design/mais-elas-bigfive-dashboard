import { useState, useEffect } from 'react';
import { LQAResultados } from './types';

export function useLQAData() {
  const [data, setData] = useState<LQAResultados | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Tenta primeiro a API (ambiente local com servidor Node.js)
      // Se falhar, busca o JSON estático embutido no build
      let json: LQAResultados | null = null;

      try {
        const res = await fetch('/api/lqa/profiles');
        if (res.ok) {
          const apiData = await res.json();
          // Suporte a dois formatos: {data: {...}} ou diretamente o Record<id, LQAProfile>
          json = apiData.data ?? apiData;
        }
      } catch {
        // API não disponível — tenta JSON estático
      }

      if (!json) {
        const res = await fetch('/lqa_resultados.json');
        if (!res.ok) throw new Error(`Erro ao carregar dados: HTTP ${res.status}`);
        json = await res.json();
      }

      setData(json);
      setLastSync(new Date());
    } catch (e: any) {
      setError(e.message ?? 'Erro ao carregar dados LQA');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, lastSync, refetch: fetchData };
}
