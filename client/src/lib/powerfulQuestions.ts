/**
 * Perguntas Poderosas para Sessão de Mentoring
 *
 * Extraídas do Guia de Interpretação Big Five da Erica — Mentoring de Liderança Feminina.
 * Use como ponto de partida para conversas reflexivas durante a sessão.
 */

export interface PowerfulQuestion {
  question: string;
}

export interface DimensionQuestions {
  dimensionKey: string;
  label: string;
  emoji: string;
  intro: string;
  questions: PowerfulQuestion[];
}

export const POWERFUL_QUESTIONS: Record<string, DimensionQuestions> = {
  openness: {
    dimensionKey: 'openness',
    label: 'Abertura à Experiência',
    emoji: '🌿',
    intro: 'Use estas perguntas para explorar a relação da mentorada com novidade, criatividade e mudança.',
    questions: [
      { question: 'Quando foi a última vez que você fez algo pela primeira vez no trabalho?' },
      { question: 'O que te impede de explorar caminhos diferentes do que já funciona?' },
      { question: 'Como você equilibra inovação com a necessidade de entregar consistência?' },
    ],
  },
  conscientiousness: {
    dimensionKey: 'conscientiousness',
    label: 'Conscienciosidade',
    emoji: '⚡',
    intro: 'Use estas perguntas para explorar a relação da mentorada com organização, metas e perfeccionismo.',
    questions: [
      { question: 'Você sente que sua organização te serve ou te limita?' },
      { question: 'Onde o perfeccionismo já custou caro para você?' },
      { question: 'O que acontece quando você não consegue cumprir com o que planejou?' },
    ],
  },
  extraversion: {
    dimensionKey: 'extraversion',
    label: 'Extroversão',
    emoji: '☀️',
    intro: 'Use estas perguntas para explorar a relação da mentorada com energia social, comunicação e visibilidade.',
    questions: [
      { question: 'Como você recarrega suas energias depois de um dia intenso de interações?' },
      { question: 'Existe algum ambiente profissional onde você se sente especialmente à vontade?' },
      { question: 'O que você gostaria que as pessoas enxergassem melhor em você?' },
    ],
  },
  agreeableness: {
    dimensionKey: 'agreeableness',
    label: 'Agradabilidade',
    emoji: '💚',
    intro: 'Use estas perguntas para explorar a relação da mentorada com limites, colaboração e assertividade.',
    questions: [
      { question: 'Quando foi a última vez que você disse não sem se sentir culpada?' },
      { question: 'Você percebe que sua gentileza já foi usada contra você?' },
      { question: 'Como você distingue colaboração saudável de excesso de doação?' },
    ],
  },
  emotionalStability: {
    dimensionKey: 'emotionalStability',
    label: 'Estabilidade Emocional',
    emoji: '🌊',
    intro: 'Use estas perguntas para explorar a relação da mentorada com estresse, equilíbrio e regulação emocional.',
    questions: [
      { question: 'O que costuma te tirar do equilíbrio mais rapidamente?' },
      { question: 'Quais são seus sinais de alerta de que você está chegando no limite?' },
      { question: 'Que práticas te ajudam a retomar o centro quando você se sente sobrecarregada?' },
    ],
  },
};

export function getQuestionsForDimension(dimensionKey: string): DimensionQuestions | null {
  return POWERFUL_QUESTIONS[dimensionKey] ?? null;
}
