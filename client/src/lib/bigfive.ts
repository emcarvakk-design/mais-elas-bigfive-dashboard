export interface BigFiveResponse {
  timestamp: string;
  email: string;
  name: string;
  responses: number[];
}

export interface BigFiveDimension {
  name: string;
  label: string;
  emoji: string;
  score: number;
  classification: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  description: string;
}

export interface IPIP120SubfacetScore {
  key: string;
  label: string;
  dimension: string;
  score: number;
  rawScore: number;
}

export interface IPIP120Data {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  emotionalStability: number;
  subfacets: IPIP120SubfacetScore[];
}

export interface BigFiveProfile {
  id: string;
  name: string;
  email: string;
  timestamp: string;
  dimensions: {
    openness: BigFiveDimension;
    conscientiousness: BigFiveDimension;
    extraversion: BigFiveDimension;
    agreeableness: BigFiveDimension;
    emotionalStability: BigFiveDimension;
  };
  combinationInsights: string[];
  recommendations: string[];
  ipip120Data?: IPIP120Data | null;
  testVersion?: string;
}

const DIMENSION_QUESTIONS = {
  openness: [0, 1, 2, 3, 4, 5],
  conscientiousness: [6, 7, 8, 9, 10, 11],
  extraversion: [12, 13, 14, 15, 16, 17],
  agreeableness: [18, 19, 20, 21, 22, 23],
  emotionalStability: [24, 25, 26, 27, 28, 29],
};

// Questões reversas: incluem as da Estabilidade Emocional (24, 25, 27, 29)
// que medem neuroticismo (instabilidade) — precisam ser invertidas para obter estabilidade
const REVERSE_QUESTIONS = new Set([2, 4, 8, 10, 14, 16, 19, 21, 23, 24, 25, 27, 29]);

function getClassification(score: number): BigFiveDimension['classification'] {
  if (score <= 30) return 'very_low';
  if (score <= 59) return 'low';
  if (score <= 79) return 'moderate';
  if (score <= 89) return 'high';
  return 'very_high';
}

// ─── Descrições alinhadas ao guia da Erica ───────────────────────────────────

function getOpennessDescription(score: number): string {
  if (score >= 80) return 'Pensamento inovador e criativo — facilidade para lidar com mudanças e visão sistêmica.';
  if (score >= 60) return 'Boa abertura para novas ideias e aprendizado contínuo.';
  if (score >= 40) return 'Equilíbrio entre inovação e estabilidade — adapta-se conforme o contexto.';
  if (score >= 20) return 'Preferência por estabilidade e rotina — valoriza o que já funciona.';
  return 'Foco no concreto e no prático — resistência a mudanças abruptas.';
}

function getConscientiousnessDescription(score: number): string {
  if (score >= 80) return 'Alta organização, foco e confiabilidade — atenção a detalhes e cumprimento de prazos.';
  if (score >= 60) return 'Boa organização e comprometimento com metas e responsabilidades.';
  if (score >= 40) return 'Equilíbrio entre organização e espontaneidade — adapta planejamento ao contexto.';
  if (score >= 20) return 'Maior espontaneidade e flexibilidade — pode procrastinar em rotinas rígidas.';
  return 'Preferência por liberdade e fluxo — dificuldade com estruturas muito rígidas.';
}

function getExtraversionDescription(score: number): string {
  if (score >= 80) return 'Energizada pelo contato social — comunicativa, assertiva e com presença marcante.';
  if (score >= 60) return 'Comunicativa e confortável socialmente — boa capacidade de networking.';
  if (score >= 40) return 'Ambivertida — confortável tanto em ambientes sociais quanto no trabalho focado.';
  if (score >= 20) return 'Prefere conexões profundas — processa antes de falar, comunicação reflexiva.';
  return 'Recarrega na solidão — liderança silenciosa, excelente escutadora e analítica.';
}

function getAgreeablenessDescription(score: number): string {
  if (score >= 80) return 'Alta empatia e colaboração — constrói vínculos de confiança com facilidade.';
  if (score >= 60) return 'Colaborativa e empática — valoriza harmonia e trabalho em equipe.';
  if (score >= 40) return 'Equilíbrio entre colaboração e assertividade — adapta-se ao contexto relacional.';
  if (score >= 20) return 'Direta e objetiva — menor tolerância a ineficiência, diz não com facilidade.';
  return 'Altamente assertiva e orientada a resultados — liderança direta e competitiva.';
}

/**
 * ATENÇÃO — Estabilidade Emocional (Neuroticismo invertido):
 * O formulário mede Estabilidade Emocional diretamente.
 * Pontuação ALTA = maior estabilidade, menor reatividade ao estresse.
 * Pontuação BAIXA = maior sensibilidade emocional, maior reatividade.
 * Isso está alinhado ao guia da Erica, que exibe o escore já invertido.
 */
function getEmotionalStabilityDescription(score: number): string {
  if (score >= 80) return 'Estabilidade emocional elevada — resiliente, difícil de desestabilizar sob pressão.';
  if (score >= 60) return 'Boa resiliência — lida bem com adversidades e mantém clareza em crises.';
  if (score >= 40) return 'Equilíbrio emocional moderado — experimenta variações de humor conforme o contexto.';
  if (score >= 20) return 'Maior sensibilidade emocional — tende a se preocupar e reagir intensamente ao estresse.';
  return 'Alta reatividade emocional — humor variável, mais propensa a burnout em ambientes de pressão.';
}

export function calculateBigFiveScore(responses: number[]): BigFiveProfile['dimensions'] {
  const normalizedResponses = responses.map((response, index) => {
    if (REVERSE_QUESTIONS.has(index)) {
      return 6 - response;
    }
    return response;
  });

  const calculateDimensionScore = (indices: number[]): number => {
    const sum = indices.reduce((acc, idx) => acc + normalizedResponses[idx], 0);
    const average = sum / indices.length;
    return Math.round((average / 5) * 100);
  };

  const openness = calculateDimensionScore(DIMENSION_QUESTIONS.openness);
  const conscientiousness = calculateDimensionScore(DIMENSION_QUESTIONS.conscientiousness);
  const extraversion = calculateDimensionScore(DIMENSION_QUESTIONS.extraversion);
  const agreeableness = calculateDimensionScore(DIMENSION_QUESTIONS.agreeableness);
  const emotionalStability = calculateDimensionScore(DIMENSION_QUESTIONS.emotionalStability);

  return {
    openness: {
      name: 'Abertura à Experiência',
      label: 'Abertura à Experiência',
      emoji: '🌿',
      score: openness,
      classification: getClassification(openness),
      description: getOpennessDescription(openness),
    },
    conscientiousness: {
      name: 'Conscienciosidade',
      label: 'Conscienciosidade',
      emoji: '⚡',
      score: conscientiousness,
      classification: getClassification(conscientiousness),
      description: getConscientiousnessDescription(conscientiousness),
    },
    extraversion: {
      name: 'Extroversão',
      label: 'Extroversão',
      emoji: '☀️',
      score: extraversion,
      classification: getClassification(extraversion),
      description: getExtraversionDescription(extraversion),
    },
    agreeableness: {
      name: 'Agradabilidade',
      label: 'Agradabilidade',
      emoji: '💚',
      score: agreeableness,
      classification: getClassification(agreeableness),
      description: getAgreeablenessDescription(agreeableness),
    },
    emotionalStability: {
      name: 'Estabilidade Emocional',
      label: 'Estabilidade Emocional',
      emoji: '🌊',
      score: emotionalStability,
      classification: getClassification(emotionalStability),
      description: getEmotionalStabilityDescription(emotionalStability),
    },
  };
}

export function generateCombinationInsights(dimensions: BigFiveProfile['dimensions']): string[] {
  const insights: string[] = [];
  const { openness, conscientiousness, extraversion, agreeableness, emotionalStability } = dimensions;

  // Alta C + Baixa Estabilidade = Perfeccionismo + risco de burnout
  if (conscientiousness.score >= 80 && emotionalStability.score <= 40) {
    insights.push('⚠️ Perfeccionismo crônico + risco de burnout. Trabalhe autocompaixão e limites saudáveis.');
  }

  // Alta A + Baixa E = Liderança servidora e discreta
  if (agreeableness.score >= 80 && extraversion.score <= 40) {
    insights.push('🤝 Liderança servidora e discreta. Pode ser invisível — trabalhe posicionamento e visibilidade.');
  }

  // Alta O + Baixa C = Criativa mas com dificuldade de execução
  if (openness.score >= 80 && conscientiousness.score <= 40) {
    insights.push('💡 Criativa mas com dificuldade de execução. Precisa de estrutura e método para transformar ideias em resultados.');
  }

  // Baixa A + Alta E = Liderança assertiva e direta
  if (agreeableness.score <= 40 && extraversion.score >= 80) {
    insights.push('🎯 Liderança assertiva e direta. Pode ser percebida como agressiva — trabalhe escuta ativa.');
  }

  // Baixa Estabilidade + Baixa C = Vulnerabilidade emocional + desorganização
  if (emotionalStability.score <= 40 && conscientiousness.score <= 40) {
    insights.push('🆘 Vulnerabilidade emocional + desorganização. Ponto crítico de atenção — priorize suporte e estrutura.');
  }

  // Alta E + Alta O = Perfil empreendedor forte
  if (extraversion.score >= 80 && openness.score >= 80) {
    insights.push('🚀 Perfil empreendedor forte — inovadora, comunicativa e aberta a riscos.');
  }

  // Alta C + Alta O = Inovadora Confiável
  if (conscientiousness.score >= 80 && openness.score >= 80) {
    insights.push('✨ Inovadora Confiável — combina criatividade com execução disciplinada.');
  }

  // Alta A = risco de síndrome da boa moça
  if (agreeableness.score >= 80) {
    insights.push('💛 Alta agradabilidade: atenção à dificuldade em estabelecer limites e dizer não — síndrome da boa moça é um ponto de trabalho importante.');
  }

  // Alta Estabilidade = ativo de liderança
  if (emotionalStability.score >= 80) {
    insights.push('🧘 Estabilidade emocional como ativo de liderança — fortaleza em ambientes voláteis e de alta pressão.');
  }

  return insights;
}

export function generateRecommendations(dimensions: BigFiveProfile['dimensions']): string[] {
  const recommendations: string[] = [];
  return recommendations;
}

export function createProfile(
  response: BigFiveResponse,
  id: string
): BigFiveProfile {
  const dimensions = calculateBigFiveScore(response.responses);
  const combinationInsights = generateCombinationInsights(dimensions);
  const recommendations = generateRecommendations(dimensions);

  return {
    id,
    name: response.name.trim(),
    email: response.email.trim(),
    timestamp: response.timestamp,
    dimensions,
    combinationInsights,
    recommendations,
  };
}
