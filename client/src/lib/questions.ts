export interface Question {
  index: number;
  text: string;
  dimension: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'emotionalStability';
  reversed: boolean;
}

export const QUESTIONS: Question[] = [
  // Parte 1 — Abertura à Experiência (0-5)
  { index: 0, text: 'Tenho uma imaginação viva e criativa.', dimension: 'openness', reversed: false },
  { index: 1, text: 'Aprecio a arte, a música e a literatura.', dimension: 'openness', reversed: false },
  { index: 2, text: 'Tenho dificuldade em entender ideias abstratas.', dimension: 'openness', reversed: true },
  { index: 3, text: 'Sou curioso(a) sobre muitas coisas diferentes.', dimension: 'openness', reversed: false },
  { index: 4, text: 'Prefiro rotinas conhecidas a novas experiências.', dimension: 'openness', reversed: true },
  { index: 5, text: 'Gosto de refletir e brincar com ideias.', dimension: 'openness', reversed: false },

  // Parte 2 — Conscienciosidade (6-11)
  { index: 6, text: 'Sou sempre preparado(a) e organizado(a).', dimension: 'conscientiousness', reversed: false },
  { index: 7, text: 'Presto atenção aos detalhes.', dimension: 'conscientiousness', reversed: false },
  { index: 8, text: 'Costumo deixar as coisas bagunçadas.', dimension: 'conscientiousness', reversed: true },
  { index: 9, text: 'Cumpro minhas tarefas imediatamente.', dimension: 'conscientiousness', reversed: false },
  { index: 10, text: 'Frequentemente esqueço de guardar as coisas no lugar certo.', dimension: 'conscientiousness', reversed: true },
  { index: 11, text: 'Sigo um cronograma e me mantenho focado(a).', dimension: 'conscientiousness', reversed: false },

  // Parte 3 — Extroversão (12-17)
  { index: 12, text: 'Sou a vida e a alma das festas.', dimension: 'extraversion', reversed: false },
  { index: 13, text: 'Me sinto confortável ao redor de pessoas.', dimension: 'extraversion', reversed: false },
  { index: 14, text: 'Prefiro ficar em segundo plano nas situações sociais.', dimension: 'extraversion', reversed: true },
  { index: 15, text: 'Inicio conversas com facilidade.', dimension: 'extraversion', reversed: false },
  { index: 16, text: 'Tenho pouco a dizer em situações sociais.', dimension: 'extraversion', reversed: true },
  { index: 17, text: 'Falo muito e com entusiasmo.', dimension: 'extraversion', reversed: false },

  // Parte 4 — Agradabilidade (18-23)
  { index: 18, text: 'Me importo com os outros e suas necessidades.', dimension: 'agreeableness', reversed: false },
  { index: 19, text: 'Às vezes sou grosseiro(a) com as pessoas.', dimension: 'agreeableness', reversed: true },
  { index: 20, text: 'Tenho um coração gentil e bondoso.', dimension: 'agreeableness', reversed: false },
  { index: 21, text: 'Às vezes sou frio(a) e distante.', dimension: 'agreeableness', reversed: true },
  { index: 22, text: 'Faço as pessoas se sentirem bem-vindas.', dimension: 'agreeableness', reversed: false },
  { index: 23, text: 'Sou indiferente aos sentimentos dos outros.', dimension: 'agreeableness', reversed: true },

  // Parte 5 — Estabilidade Emocional (24-29)
  { index: 24, text: 'Fico estressado(a) facilmente.', dimension: 'emotionalStability', reversed: true },
  { index: 25, text: 'Me preocupo bastante com as coisas.', dimension: 'emotionalStability', reversed: true },
  { index: 26, text: 'Raramente me sinto triste ou deprimido(a).', dimension: 'emotionalStability', reversed: false },
  { index: 27, text: 'Meu humor muda com facilidade.', dimension: 'emotionalStability', reversed: true },
  { index: 28, text: 'Sou relaxado(a) e lido bem com o estresse.', dimension: 'emotionalStability', reversed: false },
  { index: 29, text: 'Me irrito facilmente.', dimension: 'emotionalStability', reversed: true },
];

export const DIMENSION_LABELS: Record<Question['dimension'], { label: string; emoji: string; color: string }> = {
  openness: { label: 'Abertura à Experiência', emoji: '🌿', color: '#16a34a' },
  conscientiousness: { label: 'Conscienciosidade', emoji: '⚡', color: '#7c3aed' },
  extraversion: { label: 'Extroversão', emoji: '☀️', color: '#d97706' },
  agreeableness: { label: 'Agradabilidade', emoji: '💚', color: '#0891b2' },
  emotionalStability: { label: 'Estabilidade Emocional', emoji: '🌊', color: '#2563eb' },
};

export const DIMENSION_ORDER: Question['dimension'][] = [
  'openness',
  'conscientiousness',
  'extraversion',
  'agreeableness',
  'emotionalStability',
];

export const SCALE_LABELS = [
  { value: 1, label: 'Discordo totalmente' },
  { value: 2, label: 'Discordo' },
  { value: 3, label: 'Neutro' },
  { value: 4, label: 'Concordo' },
  { value: 5, label: 'Concordo totalmente' },
];
