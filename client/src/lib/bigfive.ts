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
}

const DIMENSION_QUESTIONS = {
  openness: [0, 1, 2, 3, 4, 5],
  conscientiousness: [6, 7, 8, 9, 10, 11],
  extraversion: [12, 13, 14, 15, 16, 17],
  agreeableness: [18, 19, 20, 21, 22, 23],
  emotionalStability: [24, 25, 26, 27, 28, 29],
};

const REVERSE_QUESTIONS = new Set([2, 4, 8, 10, 14, 16, 19, 21, 23]);

function getClassification(score: number): BigFiveDimension['classification'] {
  if (score <= 30) return 'very_low';
  if (score <= 59) return 'low';
  if (score <= 79) return 'moderate';
  if (score <= 89) return 'high';
  return 'very_high';
}

function getOpennessDescription(score: number): string {
  if (score >= 80) return 'Pensamento inovador e criativo.';
  if (score >= 60) return 'Boa abertura para novas ideias.';
  if (score >= 40) return 'Equilíbrio entre inovação e estabilidade.';
  if (score >= 20) return 'Preferência por estabilidade.';
  return 'Resistência a mudanças.';
}

function getConscientiousnessDescription(score: number): string {
  if (score >= 80) return 'Alta organização e foco.';
  if (score >= 60) return 'Boa organização.';
  if (score >= 40) return 'Equilíbrio entre organização e espontaneidade.';
  if (score >= 20) return 'Maior espontaneidade.';
  return 'Pode procrastinar.';
}

function getExtraversionDescription(score: number): string {
  if (score >= 80) return 'Energizada pelo contato social.';
  if (score >= 60) return 'Comunicativa e confortável socialmente.';
  if (score >= 40) return 'Ambivertida e flexível.';
  if (score >= 20) return 'Prefere conexões profundas.';
  return 'Recarrega na solidão.';
}

function getAgreeablenessDescription(score: number): string {
  if (score >= 80) return 'Alta empatia e colaboração.';
  if (score >= 60) return 'Colaborativa e empática.';
  if (score >= 40) return 'Equilíbrio entre colaboração e assertividade.';
  if (score >= 20) return 'Direta e objetiva.';
  return 'Altamente assertiva.';
}

function getEmotionalStabilityDescription(score: number): string {
  if (score >= 80) return 'Estabilidade emocional elevada.';
  if (score >= 60) return 'Boa resiliência.';
  if (score >= 40) return 'Equilíbrio emocional moderado.';
  if (score >= 20) return 'Maior sensibilidade emocional.';
  return 'Reatividade ao estresse elevada.';
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
      label: 'Openness',
      emoji: '🌿',
      score: openness,
      classification: getClassification(openness),
      description: getOpennessDescription(openness),
    },
    conscientiousness: {
      name: 'Conscienciosidade',
      label: 'Conscientiousness',
      emoji: '⚡',
      score: conscientiousness,
      classification: getClassification(conscientiousness),
      description: getConscientiousnessDescription(conscientiousness),
    },
    extraversion: {
      name: 'Extroversão',
      label: 'Extraversion',
      emoji: '☀️',
      score: extraversion,
      classification: getClassification(extraversion),
      description: getExtraversionDescription(extraversion),
    },
    agreeableness: {
      name: 'Agradabilidade',
      label: 'Agreeableness',
      emoji: '💚',
      score: agreeableness,
      classification: getClassification(agreeableness),
      description: getAgreeablenessDescription(agreeableness),
    },
    emotionalStability: {
      name: 'Estabilidade Emocional',
      label: 'Emotional Stability',
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

  if (conscientiousness.score >= 80 && emotionalStability.score <= 40) {
    insights.push('⚠️ Perfeccionismo crônico + risco de burnout.');
  }

  if (agreeableness.score >= 80 && extraversion.score <= 40) {
    insights.push('🤝 Liderança servidora e discreta.');
  }

  if (openness.score >= 80 && conscientiousness.score <= 40) {
    insights.push('💡 Criativa mas com dificuldade de execução.');
  }

  if (agreeableness.score <= 40 && extraversion.score >= 80) {
    insights.push('🎯 Liderança assertiva e direta.');
  }

  if (emotionalStability.score <= 40 && conscientiousness.score <= 40) {
    insights.push('🆘 Vulnerabilidade emocional + desorganização.');
  }

  if (extraversion.score >= 80 && openness.score >= 80) {
    insights.push('🚀 Perfil empreendedor forte.');
  }

  if (conscientiousness.score >= 80 && openness.score >= 80) {
    insights.push('✨ Inovadora Confiável.');
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
