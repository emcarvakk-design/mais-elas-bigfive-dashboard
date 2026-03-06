/**
 * IPIP-NEO-120: Mapeamento completo das 120 questões para subfacetas
 * 
 * Estrutura: 5 dimensões × 6 subfacetas × 4 questões = 120 questões
 * Cada subfaceta tem 4 questões (diretas e reversas conforme chave de pontuação)
 * 
 * Fonte: IPIP-NEO-120 (Johnson, 2014) — https://ipip.ori.org/newNEO_FacetsTable.htm
 * Tradução PT: gecad.isep.ipp.pt
 * 
 * IMPORTANTE: Os índices no SUBFACET_MAP são baseados na posição da questão
 * APÓS a reordenação por reorderResponsesFromSheet (idx = Q_n - 1).
 * 
 * Ordem das questões na planilha Google Forms:
 * - Seção 1 (Estabilidade Emocional/N): Q1,Q6,Q11,...,Q116 (posições 0-23)
 * - Seção 2 (Extroversão/E): Q2,Q7,Q12,...,Q117 (posições 24-47)
 * - Seção 3 (Abertura/O): Q3,Q8,Q13,...,Q118 (posições 48-71)
 * - Seção 4 (Agradabilidade/A): Q4,Q9,Q14,...,Q119 (posições 72-95)
 * - Seção 5 (Conscienciosidade/C): Q5,Q10,Q15,...,Q120 (posições 96-119)
 */

export interface SubfacetScore {
  key: string;
  label: string;
  dimension: string;
  score: number;       // 0-100
  rawScore: number;    // soma bruta das 4 questões (4-20)
}

export interface IPIP120Profile {
  // Escores das 5 dimensões (0-100)
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  emotionalStability: number;
  // 30 subfacetas com escores reais
  subfacets: SubfacetScore[];
}

// ─── Mapeamento das subfacetas ────────────────────────────────────────────────
// Cada entrada: [índice_questão, é_reversa]
// Índices são 0-based: Q_n → idx = n-1
// Após reorderResponsesFromSheet, as respostas estão na ordem Q1-Q120

export const SUBFACET_MAP: {
  key: string;
  label: string;
  dimension: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'emotionalStability';
  questions: { idx: number; reversed: boolean }[];
}[] = [
  // ── ESTABILIDADE EMOCIONAL / NEUROTICISMO (N) ─────────────────────────────
  // Questões N: Q1,Q6,Q11,Q16,Q21,Q26,Q31,Q36,Q41,Q46,Q51,Q56,Q61,Q66,Q71,Q76,Q81,Q86,Q91,Q96,Q101,Q106,Q111,Q116
  {
    key: 'anxiety', label: 'Ansiedade', dimension: 'emotionalStability',
    questions: [
      { idx: 0, reversed: false },   // Q1:  Preocupo-me com as coisas.
      { idx: 30, reversed: false },  // Q31: Tenho medo do pior.
      { idx: 60, reversed: false },  // Q61: Tenho medo de muitas coisas.
      { idx: 90, reversed: false },  // Q91: Fico facilmente estressado(a).
    ],
  },
  {
    key: 'anger', label: 'Raiva', dimension: 'emotionalStability',
    questions: [
      { idx: 5, reversed: false },   // Q6:  Zango-me com facilidade.
      { idx: 35, reversed: false },  // Q36: Irrito-me com facilidade.
      { idx: 65, reversed: false },  // Q66: Perco a paciência.
      { idx: 95, reversed: true },   // Q96: Não me irrito facilmente. (reversa)
    ],
  },
  {
    key: 'depression', label: 'Depressão', dimension: 'emotionalStability',
    questions: [
      { idx: 10, reversed: false },  // Q11: Sinto-me triste frequentemente.
      { idx: 40, reversed: false },  // Q41: Não gosto de mim próprio(a).
      { idx: 70, reversed: false },  // Q71: Estou muitas vezes em baixo.
      { idx: 100, reversed: true },  // Q101: Sinto-me confortável comigo próprio(a). (reversa)
    ],
  },
  {
    key: 'selfConsciousness', label: 'Autoconsciência', dimension: 'emotionalStability',
    questions: [
      { idx: 15, reversed: false },  // Q16: Tenho dificuldade em abordar outras pessoas.
      { idx: 45, reversed: false },  // Q46: Tenho medo de chamar a atenção para mim mesmo(a).
      { idx: 75, reversed: false },  // Q76: Só me sinto confortável com amigos.
      { idx: 105, reversed: true },  // Q106: Não me incomodo com situações sociais difíceis. (reversa)
    ],
  },
  {
    key: 'immoderation', label: 'Impulsividade', dimension: 'emotionalStability',
    questions: [
      { idx: 20, reversed: false },  // Q21: Cometo excessos.
      { idx: 50, reversed: true },   // Q51: Raramente exagero. (reversa)
      { idx: 80, reversed: true },   // Q81: Resisto facilmente a tentações. (reversa)
      { idx: 110, reversed: true },  // Q111: Sou capaz de controlar os meus desejos. (reversa)
    ],
  },
  {
    key: 'vulnerability', label: 'Vulnerabilidade', dimension: 'emotionalStability',
    questions: [
      { idx: 25, reversed: false },  // Q26: Entro em pânico facilmente.
      { idx: 55, reversed: false },  // Q56: Os eventos fazem-me sentir oprimido(a).
      { idx: 85, reversed: false },  // Q86: Sinto que não consigo lidar com as coisas.
      { idx: 115, reversed: true },  // Q116: Permaneço calmo(a) sob pressão. (reversa)
    ],
  },

  // ── EXTROVERSÃO (E) ───────────────────────────────────────────────────────
  // Questões E: Q2,Q7,Q12,Q17,Q22,Q27,Q32,Q37,Q42,Q47,Q52,Q57,Q62,Q67,Q72,Q77,Q82,Q87,Q92,Q97,Q102,Q107,Q112,Q117
  {
    key: 'friendliness', label: 'Afabilidade', dimension: 'extraversion',
    questions: [
      { idx: 1, reversed: false },   // Q2:  Faço amizades facilmente.
      { idx: 31, reversed: false },  // Q32: Sinto-me confortável ao redor das pessoas.
      { idx: 61, reversed: true },   // Q62: Evito contacto com outras pessoas. (reversa)
      { idx: 91, reversed: true },   // Q92: Mantenho os outros à distância. (reversa)
    ],
  },
  {
    key: 'gregariousness', label: 'Gregarismo', dimension: 'extraversion',
    questions: [
      { idx: 6, reversed: false },   // Q7:  Adoro grandes festas.
      { idx: 36, reversed: false },  // Q37: Converso com muitas pessoas diferentes em festas.
      { idx: 66, reversed: true },   // Q67: Prefiro estar sozinho(a). (reversa)
      { idx: 96, reversed: true },   // Q97: Evito multidões. (reversa)
    ],
  },
  {
    key: 'assertiveness', label: 'Assertividade', dimension: 'extraversion',
    questions: [
      { idx: 11, reversed: false },  // Q12: Encarrego-me da situação.
      { idx: 41, reversed: false },  // Q42: Tento liderar os outros.
      { idx: 71, reversed: false },  // Q72: Assumo o controlo das coisas.
      { idx: 101, reversed: true },  // Q102: Espero que os outros liderem o caminho. (reversa)
    ],
  },
  {
    key: 'activityLevel', label: 'Nível de Atividade', dimension: 'extraversion',
    questions: [
      { idx: 16, reversed: false },  // Q17: Estou sempre ocupado(a).
      { idx: 46, reversed: false },  // Q47: Estou sempre em movimento.
      { idx: 76, reversed: false },  // Q77: Faço imensas coisas no meu tempo livre.
      { idx: 106, reversed: true },  // Q107: Gosto de ir com calma. (reversa)
    ],
  },
  {
    key: 'excitementSeeking', label: 'Busca por Emoções', dimension: 'extraversion',
    questions: [
      { idx: 21, reversed: false },  // Q22: Adoro sentir emoção.
      { idx: 51, reversed: false },  // Q52: Procuro aventura.
      { idx: 81, reversed: false },  // Q82: Gosto de correr riscos.
      { idx: 111, reversed: false }, // Q112: Ajo de forma selvagem e louca.
    ],
  },
  {
    key: 'cheerfulness', label: 'Alegria', dimension: 'extraversion',
    questions: [
      { idx: 26, reversed: false },  // Q27: Irradio alegria.
      { idx: 56, reversed: false },  // Q57: Divirto-me muito.
      { idx: 86, reversed: false },  // Q87: Amo a vida.
      { idx: 116, reversed: false }, // Q117: Vejo o lado bom da vida.
    ],
  },

  // ── ABERTURA À EXPERIÊNCIA (O) ────────────────────────────────────────────
  // Questões O: Q3,Q8,Q13,Q18,Q23,Q28,Q33,Q38,Q43,Q48,Q53,Q58,Q63,Q68,Q73,Q78,Q83,Q88,Q93,Q98,Q103,Q108,Q113,Q118
  {
    key: 'imagination', label: 'Imaginação', dimension: 'openness',
    questions: [
      { idx: 2, reversed: false },   // Q3:  Tenho uma imaginação vívida.
      { idx: 32, reversed: false },  // Q33: Gosto de viajar pelo reino da fantasia.
      { idx: 62, reversed: false },  // Q63: Adoro sonhar acordado(a).
      { idx: 92, reversed: false },  // Q93: Gosto de me perder em pensamentos.
    ],
  },
  {
    key: 'artisticInterests', label: 'Interesses Artísticos', dimension: 'openness',
    questions: [
      { idx: 7, reversed: false },   // Q8:  Acredito na importância da arte.
      { idx: 37, reversed: false },  // Q38: Vejo beleza em coisas que outros podem não notar.
      { idx: 67, reversed: true },   // Q68: Não gosto de poesia. (reversa)
      { idx: 97, reversed: true },   // Q98: Não gosto de ir a museus de arte. (reversa)
    ],
  },
  {
    key: 'emotionality', label: 'Emocionalidade', dimension: 'openness',
    questions: [
      { idx: 12, reversed: false },  // Q13: Vivo as minhas emoções intensamente.
      { idx: 42, reversed: false },  // Q43: Sinto as emoções dos outros.
      { idx: 72, reversed: true },   // Q73: Raramente reparo nas minhas reações emocionais. (reversa)
      { idx: 102, reversed: true },  // Q103: Não entendo as pessoas que se emocionam. (reversa)
    ],
  },
  {
    key: 'adventurousness', label: 'Aventureirismo', dimension: 'openness',
    questions: [
      { idx: 17, reversed: false },  // Q18: Prefiro a variedade à rotina.
      { idx: 47, reversed: true },   // Q48: Prefiro ficar-me pelas coisas que conheço. (reversa)
      { idx: 77, reversed: true },   // Q78: Não gosto de mudanças. (reversa)
      { idx: 107, reversed: true },  // Q108: Sou apegado(a) às formas convencionais. (reversa)
    ],
  },
  {
    key: 'intellect', label: 'Intelecto', dimension: 'openness',
    questions: [
      { idx: 22, reversed: false },  // Q23: Gosto de ler material desafiante.
      { idx: 52, reversed: false },  // Q53: Evito discussões filosóficas. — NOTA: reversa na versão PT
      { idx: 82, reversed: true },   // Q83: Tenho dificuldade em entender ideias abstratas. (reversa)
      { idx: 112, reversed: true },  // Q113: Não estou interessado(a) em discussões teóricas. (reversa)
    ],
  },
  {
    key: 'liberalism', label: 'Abertura a Valores', dimension: 'openness',
    questions: [
      { idx: 27, reversed: false },  // Q28: Tendo a questionar normas e convenções estabelecidas.
      { idx: 57, reversed: true },   // Q58: Acredito que não há certo ou errado absolutos. — NOTA: reversa
      { idx: 87, reversed: true },   // Q88: Prefiro seguir regras e estruturas estabelecidas. (reversa)
      { idx: 117, reversed: true },  // Q118: Prefiro certeza e clareza a ambiguidade e complexidade. (reversa)
    ],
  },

  // ── AGRADABILIDADE (A) ────────────────────────────────────────────────────
  // Questões A: Q4,Q9,Q14,Q19,Q24,Q29,Q34,Q39,Q44,Q49,Q54,Q59,Q64,Q69,Q74,Q79,Q84,Q89,Q94,Q99,Q104,Q109,Q114,Q119
  {
    key: 'trust', label: 'Confiança', dimension: 'agreeableness',
    questions: [
      { idx: 3, reversed: false },   // Q4:  Confio nos outros.
      { idx: 33, reversed: false },  // Q34: Acredito que os outros têm boas intenções.
      { idx: 63, reversed: false },  // Q64: Confio no que as pessoas dizem.
      { idx: 93, reversed: true },   // Q94: Desconfio das pessoas. (reversa)
    ],
  },
  {
    key: 'morality', label: 'Moralidade', dimension: 'agreeableness',
    questions: [
      { idx: 8, reversed: true },    // Q9:  Uso os outros para os meus próprios fins. (reversa)
      { idx: 38, reversed: true },   // Q39: Faço batota para ficar à frente dos outros. (reversa)
      { idx: 68, reversed: false },  // Q69: Aproveito-me dos outros. — NOTA: reversa na versão PT
      { idx: 98, reversed: true },   // Q99: Obstruo os planos dos outros. (reversa)
    ],
  },
  {
    key: 'altruism', label: 'Altruísmo', dimension: 'agreeableness',
    questions: [
      { idx: 13, reversed: false },  // Q14: Adoro ajudar os outros.
      { idx: 43, reversed: false },  // Q44: Preocupo-me com os outros.
      { idx: 73, reversed: false },  // Q74: Sinto simpatia pelos que estão em situações difíceis.
      { idx: 103, reversed: true },  // Q104: Não dedico tempo para os outros. (reversa)
    ],
  },
  {
    key: 'cooperation', label: 'Cooperação', dimension: 'agreeableness',
    questions: [
      { idx: 18, reversed: true },   // Q19: Gosto de uma boa discussão acalorada. (reversa)
      { idx: 48, reversed: true },   // Q49: Grito com as pessoas. (reversa)
      { idx: 78, reversed: true },   // Q79: Insulto as pessoas. (reversa)
      { idx: 108, reversed: true },  // Q109: Viro-me contra os outros. (reversa)
    ],
  },
  {
    key: 'modesty', label: 'Modéstia', dimension: 'agreeableness',
    questions: [
      { idx: 23, reversed: true },   // Q24: Acredito que sou melhor do que os outros. (reversa)
      { idx: 53, reversed: true },   // Q54: Tenho-me em grande consideração. (reversa)
      { idx: 83, reversed: true },   // Q84: Tenho uma opinião elevada sobre mim próprio(a). (reversa)
      { idx: 113, reversed: true },  // Q114: Gabo-me das minhas virtudes. (reversa)
    ],
  },
  {
    key: 'sympathy', label: 'Simpatia', dimension: 'agreeableness',
    questions: [
      { idx: 28, reversed: false },  // Q29: Sinto simpatia pelos que estão em situações difíceis.
      { idx: 58, reversed: false },  // Q59: Sinto simpatia por aqueles que estão em situações piores.
      { idx: 88, reversed: true },   // Q89: Não estou interessado(a) nos problemas dos outros. (reversa)
      { idx: 118, reversed: true },  // Q119: Tento não pensar nos necessitados. (reversa)
    ],
  },

  // ── CONSCIENCIOSIDADE (C) ─────────────────────────────────────────────────
  // Questões C: Q5,Q10,Q15,Q20,Q25,Q30,Q35,Q40,Q45,Q50,Q55,Q60,Q65,Q70,Q75,Q80,Q85,Q90,Q95,Q100,Q105,Q110,Q115,Q120
  {
    key: 'selfEfficacy', label: 'Autoeficácia', dimension: 'conscientiousness',
    questions: [
      { idx: 4, reversed: false },   // Q5:  Completo tarefas com sucesso.
      { idx: 34, reversed: false },  // Q35: Sou excelente no que faço.
      { idx: 64, reversed: false },  // Q65: Lido com tarefas sem problemas.
      { idx: 104, reversed: false }, // Q105: Realizo os meus planos até ao fim.
    ],
  },
  {
    key: 'orderliness', label: 'Organização', dimension: 'conscientiousness',
    questions: [
      { idx: 9, reversed: false },   // Q10: Gosto de arrumar.
      { idx: 39, reversed: true },   // Q40: Esqueço-me com frequência de colocar as coisas no seu devido lugar. (reversa)
      { idx: 69, reversed: true },   // Q70: Deixo uma confusão no meu quarto. (reversa)
      { idx: 109, reversed: true },  // Q110: Dedico pouco tempo e esforço ao meu trabalho. — NOTA: verificar
    ],
  },
  {
    key: 'dutifulness', label: 'Senso do Dever', dimension: 'conscientiousness',
    questions: [
      { idx: 14, reversed: false },  // Q15: Cumpro as minhas promessas.
      { idx: 44, reversed: false },  // Q45: Digo a verdade.
      { idx: 74, reversed: true },   // Q75: Infrinjo as regras. (reversa)
      { idx: 114, reversed: true },  // Q115: Tenho dificuldade em iniciar tarefas. — NOTA: verificar
    ],
  },
  {
    key: 'achievementStriving', label: 'Busca por Realização', dimension: 'conscientiousness',
    questions: [
      { idx: 19, reversed: false },  // Q20: Trabalho arduamente.
      { idx: 49, reversed: false },  // Q50: Faço mais do que é esperado de mim.
      { idx: 79, reversed: true },   // Q80: Faço apenas o trabalho necessário para sobreviver. (reversa)
      { idx: 109, reversed: true },  // Q110: Dedico pouco tempo e esforço ao meu trabalho. (reversa)
    ],
  },
  {
    key: 'selfDiscipline', label: 'Autodisciplina', dimension: 'conscientiousness',
    questions: [
      { idx: 24, reversed: false },  // Q25: Estou sempre preparado(a).
      { idx: 54, reversed: true },   // Q55: Realizo os meus planos até ao fim. — NOTA: verificar
      { idx: 84, reversed: true },   // Q85: Desperdiço o meu tempo. (reversa)
      { idx: 114, reversed: true },  // Q115: Tenho dificuldade em iniciar tarefas. (reversa)
    ],
  },
  {
    key: 'cautiousness', label: 'Cautela', dimension: 'conscientiousness',
    questions: [
      { idx: 29, reversed: true },   // Q30: Atiro-me às situações sem pensar. (reversa)
      { idx: 59, reversed: true },   // Q60: Tomo decisões impulsivas. (reversa)
      { idx: 89, reversed: true },   // Q90: Faço as coisas à pressa. (reversa)
      { idx: 119, reversed: true },  // Q120: Ajo sem pensar. (reversa)
    ],
  },
];

/**
 * Mapeamento da ordem das colunas na planilha Google Sheets.
 * 
 * O formulário Google Forms foi criado com as perguntas agrupadas por dimensão
 * (não em ordem sequencial 1-120). Este array indica, para cada questão Q1-Q120,
 * em qual índice (0-based) ela aparece na planilha.
 * 
 * Uso: para obter a resposta da questão Q_n, use: planilhaRespostas[COLUMN_ORDER[n-1]]
 * 
 * Estrutura da planilha:
 * - Posições 0-23:  Questões N (Estabilidade Emocional): Q1,Q6,Q11,...,Q116
 * - Posições 24-47: Questões E (Extroversão): Q2,Q7,Q12,...,Q117
 * - Posições 48-71: Questões O (Abertura): Q3,Q8,Q13,...,Q118
 * - Posições 72-95: Questões A (Agradabilidade): Q4,Q9,Q14,...,Q119
 * - Posições 96-119: Questões C (Conscienciosidade): Q5,Q10,Q15,...,Q120
 */
export const COLUMN_ORDER: number[] = [
  0,24,48,72,96,   // Q1-Q5
  1,25,49,73,97,   // Q6-Q10
  2,26,50,74,98,   // Q11-Q15
  3,27,51,75,99,   // Q16-Q20
  4,28,52,76,100,  // Q21-Q25
  5,29,53,77,101,  // Q26-Q30
  6,30,54,78,102,  // Q31-Q35
  7,31,55,79,103,  // Q36-Q40
  8,32,56,80,104,  // Q41-Q45
  9,33,57,81,105,  // Q46-Q50
  10,34,58,82,106, // Q51-Q55
  11,35,59,83,107, // Q56-Q60
  12,36,60,84,108, // Q61-Q65
  13,37,61,85,109, // Q66-Q70
  14,38,62,86,110, // Q71-Q75
  15,39,63,87,111, // Q76-Q80
  16,40,64,88,112, // Q81-Q85
  17,41,65,89,113, // Q86-Q90
  18,42,66,90,114, // Q91-Q95
  19,43,67,91,115, // Q96-Q100
  20,44,68,92,116, // Q101-Q105
  21,45,69,93,117, // Q106-Q110
  22,46,70,94,118, // Q111-Q115
  23,47,71,95,119, // Q116-Q120
];

/**
 * Reordena as respostas da planilha para a ordem sequencial Q1-Q120.
 * A planilha armazena as respostas na ordem das colunas do formulário,
 * que não é a ordem numérica das questões.
 * 
 * @param sheetResponses Array de 120 respostas na ordem da planilha
 * @returns Array de 120 respostas na ordem Q1-Q120
 */
export function reorderResponsesFromSheet(sheetResponses: number[]): number[] {
  if (sheetResponses.length !== 120) {
    throw new Error(`Esperado 120 respostas da planilha, recebido ${sheetResponses.length}`);
  }
  return COLUMN_ORDER.map(colIdx => sheetResponses[colIdx]);
}

/**
 * Calcula os escores das 30 subfacetas e das 5 dimensões a partir das 120 respostas do IPIP-NEO-120
 * @param responses Array de 120 respostas (1-5) na ordem Q1-Q120 (já reordenadas)
 * @returns IPIP120Profile com escores reais de subfacetas e dimensões
 */
export function calculateIPIP120Profile(responses: number[]): IPIP120Profile {
  if (responses.length !== 120) {
    throw new Error(`Esperado 120 respostas, recebido ${responses.length}`);
  }

  const subfacets: SubfacetScore[] = [];
  const dimensionScores: Record<string, number[]> = {
    openness: [],
    conscientiousness: [],
    extraversion: [],
    agreeableness: [],
    emotionalStability: [],
  };

  for (const subfacet of SUBFACET_MAP) {
    let rawScore = 0;
    for (const q of subfacet.questions) {
      const response = responses[q.idx];
      const value = q.reversed ? (6 - response) : response;
      rawScore += value;
    }

    // Normalizar para 0-100: rawScore vai de 4 (mínimo) a 20 (máximo)
    const score = Math.round(((rawScore - 4) / 16) * 100);

    subfacets.push({
      key: subfacet.key,
      label: subfacet.label,
      dimension: subfacet.dimension,
      score,
      rawScore,
    });

    dimensionScores[subfacet.dimension].push(score);
  }

  // Média das 6 subfacetas por dimensão
  const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

  return {
    openness: avg(dimensionScores.openness),
    conscientiousness: avg(dimensionScores.conscientiousness),
    extraversion: avg(dimensionScores.extraversion),
    agreeableness: avg(dimensionScores.agreeableness),
    emotionalStability: avg(dimensionScores.emotionalStability),
    subfacets,
  };
}
