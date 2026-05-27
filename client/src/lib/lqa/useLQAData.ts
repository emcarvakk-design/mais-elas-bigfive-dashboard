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
      const res = await fetch('/api/lqa/profiles');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.data);
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
