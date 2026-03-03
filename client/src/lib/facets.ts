export interface Facet {
  name: string;
  description: string;
  score: number;
}

export function getOpennessFacets(score: number): Facet[] {
  return [
    {
      name: 'Imaginação',
      description:
        'Capacidade de pensar de forma criativa e imaginativa. Pessoas com alta imaginação gostam de fantasiar e explorar possibilidades.',
      score: Math.min(100, score + 5),
    },
    {
      name: 'Interesse Artístico',
      description:
        'Apreciação por arte, música e beleza. Pessoas com alto interesse artístico valorizam expressão criativa e estética.',
      score: Math.min(100, score + 3),
    },
    {
      name: 'Emocionabilidade',
      description:
        'Sensibilidade a emoções e experiências emocionais. Pessoas emocionalmente sensíveis são conscientes de seus sentimentos.',
      score: Math.min(100, score - 2),
    },
    {
      name: 'Aventureirismo',
      description:
        'Disposição para tentar coisas novas e buscar novas experiências. Pessoas aventureiras gostam de variedade e novidade.',
      score: Math.min(100, score + 8),
    },
    {
      name: 'Intelectualismo',
      description:
        'Interesse em ideias abstratas e pensamento crítico. Pessoas intelectuais gostam de explorar conceitos complexos.',
      score: Math.min(100, score + 6),
    },
    {
      name: 'Liberalismo',
      description:
        'Abertura a desafiar normas sociais e convenções. Pessoas liberais questionam tradições e exploram perspectivas não-convencionais.',
      score: Math.min(100, score + 4),
    },
  ];
}

export function getConscientiousnessFacets(score: number): Facet[] {
  return [
    {
      name: 'Competência',
      description:
        'Sensação de ser capaz e eficaz. Pessoas com alta competência acreditam em sua capacidade de lidar com desafios.',
      score: Math.min(100, score + 4),
    },
    {
      name: 'Ordem',
      description:
        'Preferência por organização e estrutura. Pessoas que valorizam ordem gostam de ambientes organizados e planejamento.',
      score: Math.min(100, score + 6),
    },
    {
      name: 'Senso de Dever',
      description:
        'Compromisso com responsabilidades e obrigações. Pessoas com forte senso de dever levam seus compromissos a sério.',
      score: Math.min(100, score + 5),
    },
    {
      name: 'Busca por Realização',
      description:
        'Motivação para atingir objetivos e sucesso. Pessoas orientadas para realização estabelecem metas ambiciosas.',
      score: Math.min(100, score + 7),
    },
    {
      name: 'Autodisciplina',
      description:
        'Capacidade de manter foco e persistir apesar de dificuldades. Pessoas disciplinadas conseguem adiar gratificação imediata.',
      score: Math.min(100, score + 5),
    },
    {
      name: 'Cautela',
      description:
        'Tendência a pensar antes de agir e considerar consequências. Pessoas cautelosas são reflexivas e evitam riscos desnecessários.',
      score: Math.min(100, score + 3),
    },
  ];
}

export function getExtraversionFacets(score: number): Facet[] {
  return [
    {
      name: 'Calidez',
      description:
        'Amabilidade e simpatia nas interações. Pessoas calorosas são amigáveis e genuinamente interessadas em outras pessoas.',
      score: Math.min(100, score + 5),
    },
    {
      name: 'Gregarismo',
      description:
        'Preferência por estar com outras pessoas e em grupos. Pessoas gregárias gostam de companhia e atividades em grupo.',
      score: Math.min(100, score + 6),
    },
    {
      name: 'Assertividade',
      description:
        'Disposição para liderar e influenciar outros. Pessoas assertivas falam abertamente e não têm medo de expressar opiniões.',
      score: Math.min(100, score + 4),
    },
    {
      name: 'Atividade',
      description:
        'Nível de energia e disposição para ação. Pessoas ativas são energéticas e gostam de manter-se ocupadas.',
      score: Math.min(100, score + 5),
    },
    {
      name: 'Busca de Emoção',
      description:
        'Desejo por estimulação e experiências emocionantes. Pessoas que buscam emoção gostam de adrenalina e novidade.',
      score: Math.min(100, score + 3),
    },
    {
      name: 'Otimismo',
      description:
        'Tendência a ver o lado positivo das coisas. Pessoas otimistas são esperançosas e veem possibilidades em desafios.',
      score: Math.min(100, score + 4),
    },
  ];
}

export function getAgreeablenessFacets(score: number): Facet[] {
  return [
    {
      name: 'Confiança',
      description:
        'Tendência a acreditar que outras pessoas são bem-intencionadas. Pessoas confiantes assumem o melhor sobre os outros.',
      score: Math.min(100, score + 5),
    },
    {
      name: 'Moralidade',
      description:
        'Preferência pela honestidade e autenticidade. Pessoas morais são diretas e não usam manipulação.',
      score: Math.min(100, score + 4),
    },
    {
      name: 'Altruísmo',
      description:
        'Disposição para ajudar e ser generoso. Pessoas altruístas encontram satisfação em ajudar outras pessoas.',
      score: Math.min(100, score + 6),
    },
    {
      name: 'Cooperação',
      description:
        'Disposição para trabalhar com outros e compromisso. Pessoas cooperativas são flexíveis e evitam conflitos.',
      score: Math.min(100, score + 5),
    },
    {
      name: 'Modéstia',
      description:
        'Humildade e falta de arrogância. Pessoas modestas não exageram suas qualidades e reconhecem limitações.',
      score: Math.min(100, score + 3),
    },
    {
      name: 'Simpatia',
      description:
        'Preocupação com bem-estar dos outros. Pessoas simpáticas são sensíveis aos sentimentos alheios.',
      score: Math.min(100, score + 4),
    },
  ];
}

export function getEmotionalStabilityFacets(score: number): Facet[] {
  return [
    {
      name: 'Ansiedade',
      description:
        'Tendência a se preocupar e sentir nervosismo. Pessoas com baixa ansiedade são calmas e não se preocupam excessivamente.',
      score: Math.max(0, score - 5),
    },
    {
      name: 'Raiva',
      description:
        'Tendência a sentir frustração e irritabilidade. Pessoas com baixa raiva são pacientes e difíceis de provocar.',
      score: Math.max(0, score - 4),
    },
    {
      name: 'Depressão',
      description:
        'Tendência a sentir tristeza e desânimo. Pessoas com baixa depressão são otimistas e mantêm bom humor.',
      score: Math.max(0, score - 6),
    },
    {
      name: 'Autoconsciência',
      description:
        'Sensibilidade a crítica e embaraço. Pessoas com baixa autoconsciência são confiantes e não se importam com julgamento.',
      score: Math.max(0, score - 3),
    },
    {
      name: 'Impulsividade',
      description:
        'Dificuldade em controlar desejos e impulsos. Pessoas com baixa impulsividade são disciplinadas e reflexivas.',
      score: Math.max(0, score - 5),
    },
    {
      name: 'Vulnerabilidade',
      description:
        'Sensação de desamparo sob estresse. Pessoas com baixa vulnerabilidade lidam bem com pressão e mantêm compostura.',
      score: Math.max(0, score - 4),
    },
  ];
}

export function getFacetsByDimension(
  dimensionName: string,
  score: number
): Facet[] {
  switch (dimensionName) {
    case 'openness':
      return getOpennessFacets(score);
    case 'conscientiousness':
      return getConscientiousnessFacets(score);
    case 'extraversion':
      return getExtraversionFacets(score);
    case 'agreeableness':
      return getAgreeablenessFacets(score);
    case 'emotionalStability':
      return getEmotionalStabilityFacets(score);
    default:
      return [];
  }
}
