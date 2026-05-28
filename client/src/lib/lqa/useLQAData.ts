import { useState, useEffect } from 'react';
import { LQAResultados } from './types';

const SUPABASE_URL = 'https://qhzlhomuhebknkcklagf.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoemxob211aGVia25rY2tsYWdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTEzMzE2MSwiZXhwIjoyMDk0NzA5MTYxfQ.748vWBPN3rRU_biV8S05GovPZFDwuS04LFuHPmgs-1I';

function supabaseRowsToLQAResultados(rows: any[]): LQAResultados {
  const result: LQAResultados = {};
  for (const row of rows) {
    result[row.id] = {
      respondente: {
        nome: row.nome,
        email: row.email,
        timestamp: row.timestamp,
      },
      classificacao: {
        perfil_codigo: row.perfil_codigo,
        macrogrupo: row.macrogrupo,
        macrogrupo_nome: row.macrogrupo_nome,
        perfil_nome: row.perfil_nome,
        confianca: row.confianca,
        perfil_secundario: row.perfil_secundario,
        evidencias_chave: row.evidencias_chave ?? [],
        blanchard: row.blanchard ?? {},
        dilts: row.dilts ?? {},
        meta_programas: row.meta_programas ?? {},
        fpc: row.fpc ?? {},
        lqa_consolidado: row.lqa_consolidado ?? {},
      },
    };
  }
  return result;
}

export function useLQAData() {
  const [data, setData] = useState<LQAResultados | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ novos: number; atualizados: number } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fonte primária: Supabase (atualizado pelo sync)
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/lqa_resultados?select=id,nome,email,timestamp,perfil_codigo,macrogrupo,macrogrupo_nome,perfil_nome,confianca,perfil_secundario,evidencias_chave,blanchard,dilts,meta_programas,fpc,lqa_consolidado&order=timestamp.desc`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          setData(supabaseRowsToLQAResultados(rows));
          setLastSync(new Date());
          setLoading(false);
          return;
        }
      }
    } catch (_) {
      // fallback para JSON estático
    }

    // Fallback: JSON estático (antes do primeiro sync)
    try {
      const res = await fetch('/lqa_resultados.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const contentType = res.headers.get('content-type') ?? '';
      if (!contentType.includes('json')) throw new Error('Não é JSON');
      const json: LQAResultados = await res.json();
      setData(json);
      setLastSync(new Date());
    } catch (e: any) {
      setError('Não foi possível carregar os dados. Verifique a conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  /** Sincroniza com a Google Sheets: detecta novos respondentes e classifica */
  const syncFromSheets = async () => {
    setSyncing(true);
    setSyncResult(null);
    setError(null);
    try {
      const res = await fetch('/api/lqa/sync', { method: 'POST' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `Erro ${res.status}`);
      }
      const result = await res.json();
      setSyncResult({ novos: result.novos ?? 0, atualizados: result.atualizados ?? 0 });
      if (result.respondentes?.length > 0) {
        setData(supabaseRowsToLQAResultados(result.respondentes));
        setLastSync(new Date());
      } else {
        await fetchData();
      }
    } catch (e: any) {
      setError(`Erro ao sincronizar: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, lastSync, refetch: fetchData, syncFromSheets, syncing, syncResult };
}
