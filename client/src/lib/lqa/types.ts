// ─── Tipos do sistema LQA ─────────────────────────────────────────────────────

export interface LQARespondente {
  resp_id: string;
  nome: string;
  email: string;
  timestamp: string;
}

export interface LQABlanchard {
  quadrante: 'S1' | 'S2' | 'S3' | 'S4';
  estilo_recomendado: 'Directing' | 'Coaching' | 'Supporting' | 'Delegating';
  nivel_competencia: 'baixo' | 'moderado' | 'alto';
  nivel_comprometimento: 'baixo' | 'moderado' | 'alto' | 'variável';
  justificativa: string;
}

export interface LQADilts {
  nivel_dominante: string;
  nivel_gap: string;
  descricao: string;
  impacto_lideranca: string;
}

export interface LQAMetaProgramas {
  aproximacao_evitacao: 'Aproximação' | 'Evitação' | 'Misto';
  interno_externo: 'Interno' | 'Externo' | 'Misto';
  opcoes_procedimentos: 'Opções' | 'Procedimentos' | 'Misto';
  global_detalhe: 'Global' | 'Detalhe' | 'Misto';
  proativo_reativo: 'Proativo' | 'Reativo' | 'Misto';
  padrao_dominante: string;
  implicacao_operacional: string;
}

export interface LQAFPC {
  dimensao_dominante: string;
  padrao_dominante: string;
  risco_operacional: string;
  forca_central: string;
}

export interface LQAConsolidado {
  gap_prioritario: string;
  forca_dominante: string;
  risco_ativado: string;
  acao_inicial: string;
  evidencia_esperada: string;
  nota_metodologica: string;
}

export interface LQAClassificacao {
  perfil_codigo: string;
  macrogrupo: string;
  macrogrupo_nome: string;
  perfil_nome: string;
  confianca: 'alta' | 'media' | 'baixa';
  evidencias_chave: string[];
  perfil_secundario: string | null;
  blanchard: LQABlanchard;
  dilts: LQADilts;
  meta_programas: LQAMetaProgramas;
  fpc: LQAFPC;
  lqa_consolidado: LQAConsolidado;
  _biblioteca?: {
    forcas: string;
    riscos: string;
    impacto_equipe: string;
    frases_tipicas: string;
    trilha_especifica: string;
  };
  _blanchard_biblioteca?: {
    quadrante: string;
    estilo: string;
    diretiva: string;
    apoio: string;
    codigo: string;
    nome: string;
    porque: string;
    padrao: string;
  };
}

export interface LQAProfile {
  respondente: LQARespondente;
  classificacao: LQAClassificacao;
}

export type LQAResultados = Record<string, LQAProfile>;

// Cores por macrogrupo
export const MG_COLORS: Record<string, string> = {
  A: '#6366f1', // indigo
  B: '#8b5cf6', // violet
  C: '#0ea5e9', // sky
  D: '#10b981', // emerald
  E: '#f59e0b', // amber
  F: '#ef4444', // red
  G: '#ec4899', // pink
  H: '#14b8a6', // teal
  I: '#f97316', // orange
  L: '#84cc16', // lime
};

// Labels dos quadrantes Blanchard
export const BLANCHARD_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  S1: { label: 'Directing', color: '#ef4444', desc: 'Alta direção, baixo apoio — gestor precisa de estrutura clara' },
  S2: { label: 'Coaching', color: '#f59e0b', desc: 'Alta direção + alto apoio — gestor em desenvolvimento' },
  S3: { label: 'Supporting', color: '#10b981', desc: 'Baixa direção, alto apoio — gestor competente mas inseguro' },
  S4: { label: 'Delegating', color: '#6366f1', desc: 'Baixa direção, baixo apoio — gestor autônomo e comprometido' },
};

// Níveis Dilts
export const DILTS_LEVELS = [
  'Ambiente',
  'Comportamento',
  'Capacidade',
  'Crença/Valor',
  'Identidade',
  'Propósito',
  'Espiritualidade',
];
