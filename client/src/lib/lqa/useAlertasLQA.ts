import { useState, useEffect, useCallback } from 'react';

const SUPABASE_URL = 'https://qhzlhomuhebknkcklagf.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoemxob211aGVia25rY2tsYWdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTEzMzE2MSwiZXhwIjoyMDk0NzA5MTYxfQ.748vWBPN3rRU_biV8S05GovPZFDwuS04LFuHPmgs-1I';

export type TipoAlerta = 'padrao_recorrente' | 'revisao_perfil' | 'divergencia_comportamental' | 'sem_resposta';

export interface AlertaLQA {
  id: string;
  tipo: TipoAlerta;
  descricao: string;
  semanas_consecutivas: number;
  perfil_atual: string;
  comportamento_observado: string | null;
  prioridades_abertas: Array<{ ordem: number; descricao: string; semanas: number }> | null;
  status: 'novo' | 'visto' | 'em_analise' | 'resolvido';
  created_at: string;
  nome_gestor: string;
  macrogrupo: string;
  perfil: string;
  whatsapp: string;
}

const TIPO_LABEL: Record<TipoAlerta, string> = {
  padrao_recorrente: 'Padrão Recorrente',
  revisao_perfil: 'Revisão de Perfil',
  divergencia_comportamental: 'Divergência Comportamental',
  sem_resposta: 'Sem Resposta',
};

const TIPO_COR: Record<TipoAlerta, string> = {
  padrao_recorrente: 'amber',
  revisao_perfil: 'red',
  divergencia_comportamental: 'orange',
  sem_resposta: 'gray',
};

export { TIPO_LABEL, TIPO_COR };

async function supabaseFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase ${path}: ${res.status} — ${err}`);
  }
  return res.json();
}

export function useAlertasLQA() {
  const [alertas, setAlertas] = useState<AlertaLQA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlertas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await supabaseFetch(
        'vw_alertas_ativos?select=id,tipo,descricao,semanas_consecutivas,perfil_atual,comportamento_observado,prioridades_abertas,status,created_at,nome_gestor,macrogrupo,perfil,whatsapp'
      );
      setAlertas(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const marcarVisto = async (id: string) => {
    try {
      await supabaseFetch(`lqa_alertas?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'visto', visto_em: new Date().toISOString() }),
      });
      setAlertas(prev => prev.map(a => (a.id === id ? { ...a, status: 'visto' } : a)));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const marcarEmAnalise = async (id: string) => {
    try {
      await supabaseFetch(`lqa_alertas?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'em_analise' }),
      });
      setAlertas(prev => prev.map(a => (a.id === id ? { ...a, status: 'em_analise' } : a)));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const marcarResolvido = async (id: string, notas?: string) => {
    try {
      await supabaseFetch(`lqa_alertas?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'resolvido',
          resolvido_em: new Date().toISOString(),
          notas_erica: notas ?? null,
        }),
      });
      setAlertas(prev => prev.filter(a => a.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchAlertas();
    // Atualiza a cada 5 minutos
    const interval = setInterval(fetchAlertas, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAlertas]);

  const totalNovos = alertas.filter(a => a.status === 'novo').length;

  return { alertas, loading, error, refetch: fetchAlertas, marcarVisto, marcarEmAnalise, marcarResolvido, totalNovos };
}
