import { useState, useEffect } from 'react';
import { LQAResultados } from './types';

export function useLQAData() {
  const [data, setData] = useState<LQAResultados | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    // Estratégia: tenta JSON estático primeiro (sempre disponível no Netlify)
    // Se estiver rodando localmente com servidor Node, a API também funciona
    try {
      const res = await fetch('/lqa_resultados.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const contentType = res.headers.get('content-type') ?? '';
      if (!contentType.includes('json')) {
        throw new Error('Resposta não é JSON — arquivo não encontrado');
      }
      const json: LQAResultados = await res.json();
      setData(json);
      setLastSync(new Date());
    } catch (e: any) {
      // Fallback: tenta a API do servidor Node.js (ambiente local)
      try {
        const res2 = await fetch('/api/lqa/profiles');
        if (!res2.ok) throw new Error(`API HTTP ${res2.status}`);
        const apiData = await res2.json();
        const json: LQAResultados = apiData.data ?? apiData;
        setData(json);
        setLastSync(new Date());
      } catch (e2: any) {
        setError('Não foi possível carregar os dados. Verifique a conexão e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, lastSync, refetch: fetchData };
}
