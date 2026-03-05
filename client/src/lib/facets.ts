/**
 * Subfacetas do Big Five
 *
 * IMPORTANTE: O formulário atual tem 30 perguntas (6 por dimensão) e não mapeia
 * perguntas individuais para subfacetas. Por isso, os escores numéricos por subfaceta
 * não podem ser calculados com precisão a partir dos dados disponíveis.
 *
 * Esta versão exibe as subfacetas com:
 * - Descrição qualitativa rica (o que a subfaceta significa)
 * - Indicador de tendência baseado no escore geral da dimensão
 * - Nota de contexto para a mentora
 *
 * Para escores precisos por subfaceta, seria necessário um formulário com
 * perguntas mapeadas individualmente para cada uma das 30 subfacetas.
 */

export type FacetTendency = 'elevada' | 'moderada' | 'baixa';

export interface Facet {
  name: string;
  description: string;
  highDescription: string;   // O que significa quando esta subfaceta é alta
  lowDescription: string;    // O que significa quando esta subfaceta é baixa
  mentorNote: string;        // Dica de uso no mentoring
  tendency: FacetTendency;   // Estimativa baseada no escore geral da dimensão
  score: number;             // Mantido para compatibilidade visual (baseado no escore geral)
}

/**
 * Retorna uma tendência qualitativa baseada no escore geral da dimensão.
 * Não representa um escore preciso da subfaceta — é uma estimativa contextual.
 */
function getTendency(score: number): FacetTendency {
  if (score >= 65) return 'elevada';
  if (score >= 40) return 'moderada';
  return 'baixa';
}

export function getOpennessFacets(score: number): Facet[] {
  const tendency = getTendency(score);
  return [
    {
      name: 'Imaginação',
      description: 'Capacidade de criar mundos internos ricos, fantasiar e explorar possibilidades além do concreto.',
      highDescription: 'Pensa de forma criativa, gosta de imaginar cenários e explorar o que poderia ser.',
      lowDescription: 'Prefere o concreto e o prático — menos interesse em especulação ou fantasia.',
      mentorNote: 'Alta imaginação sem estrutura pode gerar dispersão. Estimule projetos com entregáveis claros.',
      tendency,
      score,
    },
    {
      name: 'Interesse Artístico',
      description: 'Apreciação por arte, música, literatura e beleza. Sensibilidade estética e valorização da expressão criativa.',
      highDescription: 'Valoriza a estética, aprecia arte e busca beleza nas experiências cotidianas.',
      lowDescription: 'Menos orientada para arte e estética — prefere funcionalidade e objetividade.',
      mentorNote: 'Pessoas com alto interesse artístico se destacam em comunicação visual, branding e criação de conteúdo.',
      tendency,
      score,
    },
    {
      name: 'Emocionabilidade',
      description: 'Sensibilidade a emoções e experiências emocionais. Consciência dos próprios sentimentos e dos outros.',
      highDescription: 'Consciente dos próprios sentimentos, empática e sensível a nuances emocionais.',
      lowDescription: 'Menos orientada para o mundo emocional — mais racional e objetiva nas análises.',
      mentorNote: 'Alta emocionabilidade é um recurso de empatia e liderança — ajude a canalizá-la sem sobrecarregar.',
      tendency,
      score,
    },
    {
      name: 'Aventureirismo',
      description: 'Disposição para tentar coisas novas, buscar novidade e sair da zona de conforto.',
      highDescription: 'Gosta de variedade, experimenta novas abordagens e se adapta bem a mudanças.',
      lowDescription: 'Prefere o familiar e o testado — mudanças abruptas geram desconforto.',
      mentorNote: 'Estimule projetos-piloto e experimentos pequenos para desenvolver o aventureirismo com segurança.',
      tendency,
      score,
    },
    {
      name: 'Intelectualismo',
      description: 'Interesse por ideias abstratas, teorias e pensamento crítico. Curiosidade intelectual.',
      highDescription: 'Gosta de explorar conceitos complexos, questionar e aprender continuamente.',
      lowDescription: 'Prefere aplicações práticas — menos interesse em teoria e abstração.',
      mentorNote: 'Alto intelectualismo é um ativo em estratégia, pesquisa e inovação. Ofereça desafios cognitivos.',
      tendency,
      score,
    },
    {
      name: 'Liberalismo',
      description: 'Abertura para questionar normas, convenções e explorar perspectivas não-tradicionais.',
      highDescription: 'Questiona o status quo, valoriza diversidade de perspectivas e explora caminhos alternativos.',
      lowDescription: 'Valoriza tradições e convenções estabelecidas — prefere caminhos comprovados.',
      mentorNote: 'Alto liberalismo é um diferencial em ambientes de inovação, mas pode gerar conflitos em culturas conservadoras.',
      tendency,
      score,
    },
  ];
}

export function getConscientiousnessFacets(score: number): Facet[] {
  const tendency = getTendency(score);
  return [
    {
      name: 'Competência',
      description: 'Sensação de ser capaz e eficaz. Confiança na própria capacidade de lidar com desafios.',
      highDescription: 'Acredita em sua capacidade, enfrenta desafios com confiança e sente-se eficaz.',
      lowDescription: 'Pode duvidar de si mesma com frequência — síndrome da impostora pode ser um padrão.',
      mentorNote: 'Baixa competência percebida é um dos maiores bloqueadores de carreira. Trabalhe evidências de conquistas.',
      tendency,
      score,
    },
    {
      name: 'Ordem',
      description: 'Preferência por organização, estrutura e ambientes arrumados. Gosto por planejamento.',
      highDescription: 'Organizada, planeja com antecedência e mantém ambientes estruturados.',
      lowDescription: 'Mais espontânea e flexível — pode ter dificuldade com rotinas rígidas.',
      mentorNote: 'Baixa ordem não é falha — é um estilo. Ajude a criar sistemas mínimos que funcionem para ela.',
      tendency,
      score,
    },
    {
      name: 'Senso de Dever',
      description: 'Comprometimento com responsabilidades e obrigações. Ética de trabalho e confiabilidade.',
      highDescription: 'Leva compromissos a sério, é confiável e cumpre o que promete.',
      lowDescription: 'Mais flexível com compromissos — pode priorizar bem-estar sobre obrigações.',
      mentorNote: 'Alto senso de dever pode levar ao esgotamento. Trabalhe a diferença entre responsabilidade e autossacrifício.',
      tendency,
      score,
    },
    {
      name: 'Busca por Realização',
      description: 'Motivação para atingir objetivos, superar metas e alcançar sucesso.',
      highDescription: 'Estabelece metas ambiciosas, é orientada para resultados e busca crescimento constante.',
      lowDescription: 'Menos movida por ambição — pode priorizar equilíbrio e qualidade de vida.',
      mentorNote: 'Alta busca por realização é um motor poderoso — ajude a direcionar para objetivos alinhados aos valores.',
      tendency,
      score,
    },
    {
      name: 'Autodisciplina',
      description: 'Capacidade de manter foco, persistir diante de dificuldades e adiar gratificação imediata.',
      highDescription: 'Persiste em tarefas difíceis, mantém foco e resiste a distrações.',
      lowDescription: 'Pode se distrair com facilidade — prefere variedade a persistência em uma única tarefa.',
      mentorNote: 'Técnicas como Pomodoro, blocos de foco e ancoragens de rotina ajudam a desenvolver autodisciplina.',
      tendency,
      score,
    },
    {
      name: 'Cautela',
      description: 'Tendência a pensar antes de agir, considerar consequências e evitar riscos desnecessários.',
      highDescription: 'Reflexiva, avalia riscos antes de decidir e evita impulsividade.',
      lowDescription: 'Mais impulsiva e rápida nas decisões — pode agir antes de avaliar todas as consequências.',
      mentorNote: 'Alta cautela é um ativo em gestão de riscos, mas pode paralisar em decisões que exigem velocidade.',
      tendency,
      score,
    },
  ];
}

export function getExtraversionFacets(score: number): Facet[] {
  const tendency = getTendency(score);
  return [
    {
      name: 'Calidez',
      description: 'Amabilidade, simpatia e interesse genuíno nas pessoas. Facilidade de criar conexões.',
      highDescription: 'Amigável, acolhedora e genuinamente interessada nas pessoas ao redor.',
      lowDescription: 'Mais reservada no primeiro contato — as conexões se aprofundam com o tempo.',
      mentorNote: 'Alta calidez é um ativo de liderança — cria ambientes psicologicamente seguros.',
      tendency,
      score,
    },
    {
      name: 'Gregarismo',
      description: 'Preferência por estar com outras pessoas e em grupos. Energia renovada pelo convívio social.',
      highDescription: 'Gosta de grupos, eventos sociais e ambientes com muita interação.',
      lowDescription: 'Prefere grupos menores ou interações individuais — ambientes muito sociais drenam energia.',
      mentorNote: 'Introvertidas em cargos de alta exposição precisam de estratégias de gestão de energia.',
      tendency,
      score,
    },
    {
      name: 'Assertividade',
      description: 'Disposição para liderar, influenciar e expressar opiniões com clareza.',
      highDescription: 'Fala abertamente, assume posições e não tem medo de liderar.',
      lowDescription: 'Mais discreta e reflexiva — pode hesitar em se posicionar em grupos.',
      mentorNote: 'Assertividade pode ser desenvolvida — trabalhe posicionamento e comunicação de valor.',
      tendency,
      score,
    },
    {
      name: 'Atividade',
      description: 'Nível de energia, ritmo de vida e disposição para ação. Preferência por estar em movimento.',
      highDescription: 'Energética, gosta de manter-se ocupada e trabalha bem em ritmo acelerado.',
      lowDescription: 'Prefere ritmo mais tranquilo — pode se sentir sobrecarregada em ambientes de alta demanda.',
      mentorNote: 'Respeitar o ritmo natural é essencial para sustentabilidade de longo prazo.',
      tendency,
      score,
    },
    {
      name: 'Busca de Emoção',
      description: 'Desejo por estimulação, adrenalina e experiências emocionantes.',
      highDescription: 'Gosta de novidade, risco calculado e situações que geram adrenalina.',
      lowDescription: 'Prefere ambientes previsíveis e estáveis — evita riscos desnecessários.',
      mentorNote: 'Alta busca de emoção é um ativo empreendedor — ajude a canalizar para riscos estratégicos.',
      tendency,
      score,
    },
    {
      name: 'Otimismo',
      description: 'Tendência a ver o lado positivo, manter esperança e enxergar possibilidades em desafios.',
      highDescription: 'Esperançosa, vê oportunidades em dificuldades e mantém bom humor.',
      lowDescription: 'Mais realista ou cética — analisa riscos com mais peso que oportunidades.',
      mentorNote: 'Otimismo realista (não ingênuo) é um dos maiores ativos de liderança feminina.',
      tendency,
      score,
    },
  ];
}

export function getAgreeablenessFacets(score: number): Facet[] {
  const tendency = getTendency(score);
  return [
    {
      name: 'Confiança',
      description: 'Tendência a acreditar que as pessoas são bem-intencionadas. Abertura para confiar.',
      highDescription: 'Assume o melhor sobre os outros, é aberta e confia com facilidade.',
      lowDescription: 'Mais cautelosa e cética — confia após evidências, não por padrão.',
      mentorNote: 'Alta confiança pode torná-la vulnerável a manipulação. Trabalhe discernimento sem fechar o coração.',
      tendency,
      score,
    },
    {
      name: 'Moralidade',
      description: 'Preferência pela honestidade e autenticidade. Aversão à manipulação e desonestidade.',
      highDescription: 'Direta, honesta e não usa manipulação para atingir objetivos.',
      lowDescription: 'Mais pragmática — pode usar estratégia e negociação com mais flexibilidade.',
      mentorNote: 'Alta moralidade é um ativo de reputação — mas pode gerar conflito em ambientes políticos.',
      tendency,
      score,
    },
    {
      name: 'Altruísmo',
      description: 'Disposição para ajudar, ser generosa e encontrar satisfação no bem-estar dos outros.',
      highDescription: 'Generosa, encontra significado em ajudar e coloca as necessidades alheias em primeiro lugar.',
      lowDescription: 'Mais equilibrada entre necessidades próprias e alheias — menos propensa ao autossacrifício.',
      mentorNote: 'Alto altruísmo é lindo, mas pode levar à síndrome da boa moça. Trabalhe reciprocidade saudável.',
      tendency,
      score,
    },
    {
      name: 'Cooperação',
      description: 'Disposição para trabalhar em conjunto, ceder e evitar conflitos.',
      highDescription: 'Flexível, evita conflitos e busca soluções que funcionem para todos.',
      lowDescription: 'Mais assertiva em conflitos — defende sua posição com firmeza.',
      mentorNote: 'Baixa cooperação não é problema — é um estilo de liderança por resultados. Trabalhe a percepção.',
      tendency,
      score,
    },
    {
      name: 'Modéstia',
      description: 'Humildade e ausência de arrogância. Reconhecimento de limitações e conquistas alheias.',
      highDescription: 'Humilde, não exagera qualidades e reconhece contribuições dos outros.',
      lowDescription: 'Mais confiante na autopromoção — confortável em destacar suas conquistas.',
      mentorNote: 'Alta modéstia pode invisibilizar talentos. Trabalhe a diferença entre humildade e apagamento.',
      tendency,
      score,
    },
    {
      name: 'Simpatia',
      description: 'Preocupação com o bem-estar dos outros. Sensibilidade aos sentimentos alheios.',
      highDescription: 'Sensível ao que os outros sentem, empática e preocupada com o bem-estar coletivo.',
      lowDescription: 'Mais focada em objetivos — menos impactada pelo estado emocional dos outros.',
      mentorNote: 'Alta simpatia é um ativo de liderança humanizada — mas pode dificultar decisões difíceis.',
      tendency,
      score,
    },
  ];
}

export function getEmotionalStabilityFacets(score: number): Facet[] {
  const tendency = getTendency(score);
  return [
    {
      name: 'Calma sob Pressão',
      description: 'Capacidade de manter equilíbrio emocional em situações de estresse e alta demanda.',
      highDescription: 'Mantém a calma em crises, não se deixa levar pelo pânico e pensa com clareza.',
      lowDescription: 'Tende a sentir ansiedade e tensão em situações de pressão — reage intensamente ao estresse.',
      mentorNote: 'Desenvolver práticas de regulação emocional (respiração, mindfulness) é essencial para quem tem baixa calma sob pressão.',
      tendency,
      score,
    },
    {
      name: 'Estabilidade de Humor',
      description: 'Consistência emocional ao longo do tempo. Ausência de oscilações intensas de humor.',
      highDescription: 'Humor consistente e previsível — as pessoas ao redor sabem o que esperar.',
      lowDescription: 'Humor mais variável — pode oscilar entre estados emocionais com frequência.',
      mentorNote: 'Humor variável não é falha — é sensibilidade. Trabalhe a consciência dos gatilhos emocionais.',
      tendency,
      score,
    },
    {
      name: 'Resiliência',
      description: 'Capacidade de se recuperar de adversidades, fracassos e situações difíceis.',
      highDescription: 'Recupera-se rapidamente de dificuldades e mantém perspectiva positiva.',
      lowDescription: 'Pode levar mais tempo para se recuperar de adversidades — precisa de mais suporte.',
      mentorNote: 'Resiliência é desenvolvível. Trabalhe narrativas de superação e recursos de apoio.',
      tendency,
      score,
    },
    {
      name: 'Autoconfiança Emocional',
      description: 'Segurança interna e ausência de autocrítica excessiva ou medo de julgamento.',
      highDescription: 'Confiante, não se preocupa excessivamente com o julgamento alheio.',
      lowDescription: 'Mais sensível a críticas e ao que os outros pensam — pode se sentir insegura.',
      mentorNote: 'Baixa autoconfiança emocional é um dos maiores bloqueadores de posicionamento e visibilidade.',
      tendency,
      score,
    },
    {
      name: 'Controle de Impulsos',
      description: 'Capacidade de pausar antes de reagir, especialmente em situações de frustração ou conflito.',
      highDescription: 'Reflexiva antes de reagir — raramente age por impulso emocional.',
      lowDescription: 'Pode reagir de forma impulsiva em situações de frustração ou conflito.',
      mentorNote: 'Técnicas de pausa (contar até 10, respirar, escrever antes de enviar) são ferramentas simples e eficazes.',
      tendency,
      score,
    },
    {
      name: 'Tolerância ao Estresse',
      description: 'Capacidade de funcionar bem sob pressão crônica sem entrar em colapso ou burnout.',
      highDescription: 'Funciona bem mesmo sob pressão prolongada — alta tolerância ao estresse.',
      lowDescription: 'Mais propensa ao esgotamento em ambientes de alta pressão crônica.',
      mentorNote: 'Baixa tolerância ao estresse é um sinal de alerta para burnout. Trabalhe limites, recuperação e prevenção.',
      tendency,
      score,
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
