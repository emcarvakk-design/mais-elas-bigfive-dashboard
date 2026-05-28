import { useState, useEffect, useCallback } from 'react';

const SUPABASE_URL = 'https://qhzlhomuhebknkcklagf.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoemxob211aGVia25rY2tsYWdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTEzMzE2MSwiZXhwIjoyMDk0NzA5MTYxfQ.748vWBPN3rRU_biV8S05GovPZFDwuS04LFuHPmgs-1I';

export interface MotorQueueItem {
  id: string;
  tipo: string;
  texto_gerado: string;
  texto_editado: string | null;
  status: 'pendente' | 'aprovado' | 'enviado' | 'descartado';
  semana_numero: number | null;
  angulo: string | null;
  whatsapp_destino: string | null;
  created_at: string;
  nome_gestor: string;
  macrogrupo: string;
  perfil: string;
}

const TIPO_LABELS: Record<string, string> = {
  abertura_semana: 'Abertura de Semana',
  qualificacao_q1: 'Qualificação Q1',
  qualificacao_q2: 'Qualificação Q2',
  qualificacao_q3: 'Qualificação Q3',
  qualificacao_q4: 'Qualificação Q4',
  sugestao_ranking: 'Sugestão de Ranking',
  mapa_semana: 'Mapa da Semana',
  microlearning: 'Microlearning',
  checkout_pergunta: 'Checkout — Pergunta',
  checkout_analise: 'Checkout — Análise',
  avaliacao_ml_q1: 'Avaliação ML Q1',
  avaliacao_ml_q2: 'Avaliação ML Q2',
  avaliacao_ml_q3: 'Avaliação ML Q3',
  encerramento: 'Encerramento',
};

export { TIPO_LABELS };

async function supabaseFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
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
    throw new Error(`Supabase error ${res.status}: ${err}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export function useMotorQueue() {
  const [items, setItems] = useState<MotorQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await supabaseFetch(
        '/rest/v1/vw_queue_pendente?select=*&order=created_at.asc'
      );
      setItems(data ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(fetchQueue, 30_000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const aprovar = useCallback(
    async (id: string, textoFinal: string, textoOriginal: string) => {
      const foiEditado = textoFinal.trim() !== textoOriginal.trim();
      await supabaseFetch(`/rest/v1/lqa_motor_queue?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'aprovado',
          texto_editado: foiEditado ? textoFinal : null,
          aprovado_at: new Date().toISOString(),
        }),
      });
      setItems((prev) => prev.filter((i) => i.id !== id));
    },
    []
  );

  const marcarEnviado = useCallback(async (id: string) => {
    await supabaseFetch(`/rest/v1/lqa_motor_queue?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'enviado',
        enviado_at: new Date().toISOString(),
      }),
    });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const descartar = useCallback(async (id: string) => {
    await supabaseFetch(`/rest/v1/lqa_motor_queue?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'descartado' }),
    });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return { items, loading, error, refetch: fetchQueue, aprovar, marcarEnviado, descartar };
}
