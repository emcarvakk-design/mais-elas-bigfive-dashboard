export interface DimensaoInfo {
  key: string;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  definicao: string;
  perguntas: string[];
  sinaisSaude: string[];
  sinaisAlerta: string[];
}

export const DIMENSOES: DimensaoInfo[] = [
  {
    key: "carreira",
    label: "Carreira",
    emoji: "🌿",
    color: "#2d6a4f",
    bgColor: "#d8f3dc",
    definicao:
      "Avalia o grau de satisfação e alinhamento com a trajetória de carreira — cargos, projetos, posicionamento e perspectiva de crescimento.",
    perguntas: [
      "Estou no lugar certo para o que quero construir?",
      "Minha carreira reflete meu potencial real?",
      "Tenho clareza sobre onde quero chegar nos próximos anos?",
    ],
    sinaisSaude: [
      "Satisfação com a trajetória atual",
      "Clareza sobre o próximo passo",
      "Sensação de crescimento contínuo",
      "Alinhamento entre cargo e potencial",
    ],
    sinaisAlerta: [
      "Estagnação ou insatisfação crônica",
      "Sensação de estar no lugar errado",
      "Falta de clareza sobre o futuro",
      "Desalinhamento entre entrega e reconhecimento",
    ],
  },
  {
    key: "financeiro",
    label: "Financeiro",
    emoji: "💛",
    color: "#b5830a",
    bgColor: "#fff3cd",
    definicao:
      "Avalia a relação com dinheiro — não apenas a quantidade que ganha, mas se sente segurança, autonomia e liberdade financeira.",
    perguntas: [
      "Minha remuneração reflete o valor do meu trabalho?",
      "Tenho segurança financeira suficiente para fazer escolhas livres?",
      "Consigo planejar financeiramente meu futuro com tranquilidade?",
    ],
    sinaisSaude: [
      "Remuneração adequada ao nível de entrega",
      "Reserva de emergência e planejamento",
      "Liberdade para tomar decisões financeiras",
      "Relação saudável e consciente com o dinheiro",
    ],
    sinaisAlerta: [
      "Sensação constante de insuficiência financeira",
      "Trabalhar muito e ganhar pouco",
      "Ansiedade financeira que paralisa decisões",
      "Ausência de planejamento ou reservas",
    ],
  },
  {
    key: "proposito",
    label: "Propósito",
    emoji: "✨",
    color: "#1b4332",
    bgColor: "#d8f3dc",
    definicao:
      "Avalia o quanto sente que sua vida e trabalho têm um sentido maior — uma razão de ser que transcende o cotidiano.",
    perguntas: [
      "Sei por que faço o que faço — além do dinheiro?",
      "Meu trabalho contribui para algo que considero importante?",
      "Sinto que estou construindo um legado com o que faço?",
    ],
    sinaisSaude: [
      "Clareza do propósito pessoal e profissional",
      "Motivação que vem de dentro, não só de fora",
      "Sensação de contribuição ao mundo",
      "Ações alinhadas com o que acredita",
    ],
    sinaisAlerta: [
      "Sensação de vazio apesar do sucesso externo",
      "Motivação exclusivamente financeira",
      "Não saber responder 'por que faço isso'",
      "Desconexão entre valores e ações diárias",
    ],
  },
  {
    key: "lideranca",
    label: "Liderança",
    emoji: "⚡",
    color: "#52b788",
    bgColor: "#d8f3dc",
    definicao:
      "Avalia o quanto se percebe como líder de si mesma e das situações ao seu redor — autoconhecimento, presença e capacidade de influenciar com autenticidade.",
    perguntas: [
      "Confio na minha capacidade de liderar pessoas e situações?",
      "Consigo tomar decisões difíceis com clareza e coragem?",
      "Me percebo como líder — não apenas como executora?",
    ],
    sinaisSaude: [
      "Autoconfiança na tomada de decisão",
      "Liderança autêntica sem máscaras",
      "Capacidade de inspirar e desenvolver outros",
      "Presença reconhecida e respeitada",
    ],
    sinaisAlerta: [
      "Síndrome da impostora recorrente",
      "Dificuldade de se posicionar como líder",
      "Liderança por controle, não por influência",
      "Medo constante de errar na liderança",
    ],
  },
  {
    key: "relacionamentos",
    label: "Relacionamentos",
    emoji: "💚",
    color: "#40916c",
    bgColor: "#d8f3dc",
    definicao:
      "Avalia a qualidade das conexões — com parceiro(a), família, amigos e rede profissional.",
    perguntas: [
      "Tenho relações profundas e nutritivas em minha vida?",
      "Estou presente para quem amo ou apenas fisicamente disponível?",
      "Tenho uma rede de apoio que me sustenta nos momentos difíceis?",
    ],
    sinaisSaude: [
      "Relações afetivas profundas e nutritivas",
      "Presença real — não apenas física",
      "Rede de apoio sólida e confiável",
      "Capacidade de pedir e oferecer apoio",
    ],
    sinaisAlerta: [
      "Isolamento progressivo por excesso de trabalho",
      "Relações superficiais ou conflituosas",
      "Sentir-se só apesar de estar cercada de pessoas",
      "Falta de tempo para quem realmente importa",
    ],
  },
  {
    key: "desenvolvimento",
    label: "Desenvolvimento",
    emoji: "🌱",
    color: "#74c69d",
    bgColor: "#d8f3dc",
    definicao:
      "Avalia o quanto investe em seu próprio crescimento — intelectual, emocional e profissional. Inclui aprendizado contínuo, autoconhecimento, formações, leituras, mentorias.",
    perguntas: [
      "Estou investindo ativamente no meu crescimento pessoal e profissional?",
      "Busco feedback e mentoria com regularidade?",
      "Me desafio a aprender coisas novas e sair da zona de conforto?",
    ],
    sinaisSaude: [
      "Aprendizado contínuo e consistente",
      "Investimento em mentoria e formação",
      "Abertura genuína para feedback",
      "Sensação de evolução ao longo do tempo",
    ],
    sinaisAlerta: [
      "Estagnação intelectual e profissional",
      "Resistência a feedback ou críticas",
      "Ausência de investimento em si mesma",
      "Sensação de que 'já sabe o suficiente'",
    ],
  },
  {
    key: "saude",
    label: "Saúde e Energia",
    emoji: "🌊",
    color: "#2d6a4f",
    bgColor: "#d8f3dc",
    definicao:
      "Avalia o estado físico, mental e emocional. É a base de sustentação de todas as outras dimensões.",
    perguntas: [
      "Cuido ativamente da minha saúde física, mental e emocional?",
      "Tenho energia suficiente para o que importa na minha vida?",
      "Reconheço os sinais do meu corpo e mente e respondo a eles?",
    ],
    sinaisSaude: [
      "Energia física e mental consistentes",
      "Práticas regulares de autocuidado",
      "Saúde emocional equilibrada",
      "Sono e alimentação como prioridade",
    ],
    sinaisAlerta: [
      "Exaustão crônica normalizada",
      "Ignorar sinais do corpo por excesso de demandas",
      "Ausência total de práticas de autocuidado",
      "Sintomas de burnout presentes",
    ],
  },
  {
    key: "equilibrio",
    label: "Equilíbrio",
    emoji: "☀️",
    color: "#b5830a",
    bgColor: "#fff3cd",
    definicao:
      "Avalia a percepção de harmonia entre as diferentes áreas da vida — trabalho, família, saúde, lazer, descanso.",
    perguntas: [
      "Consigo equilibrar trabalho e vida pessoal de forma sustentável?",
      "Tenho espaço para descanso, lazer e momentos só meus?",
      "Quando estou fora do trabalho, consigo realmente desconectar?",
    ],
    sinaisSaude: [
      "Capacidade de desconectar com tranquilidade",
      "Presença de lazer e descanso na rotina",
      "Sensação de harmonia entre as áreas",
      "Limites claros entre trabalho e vida pessoal",
    ],
    sinaisAlerta: [
      "Trabalhar em momentos que deveriam ser pessoais",
      "Sensação de que não há tempo para nada além do trabalho",
      "Culpa ao descansar ou se divertir",
      "Limites inexistentes ou constantemente violados",
    ],
  },
  {
    key: "reconhecimento",
    label: "Reconhecimento",
    emoji: "🏆",
    color: "#d4a017",
    bgColor: "#fff3cd",
    definicao:
      "Avalia o quanto se sente valorizada — por si mesma e pelo ambiente ao seu redor. Inclui o autorreconhecimento e o reconhecimento externo.",
    perguntas: [
      "Reconheço e valorizo o que construí e o que entrego?",
      "Sou vista e valorizada de forma justa no meu ambiente profissional?",
      "Sei comunicar meu valor sem minimizar minhas conquistas?",
    ],
    sinaisSaude: [
      "Clareza e orgulho do próprio valor",
      "Reconhecimento externo proporcional",
      "Comunicação clara do que entrega",
      "Visibilidade conquistada com autenticidade",
    ],
    sinaisAlerta: [
      "Subestimar constantemente o próprio trabalho",
      "Dificuldade de cobrar o que merece",
      "Síndrome da impostora frequente e intensa",
      "Invisibilidade no ambiente de trabalho",
    ],
  },
  {
    key: "autonomia",
    label: "Autonomia",
    emoji: "🦋",
    color: "#52b788",
    bgColor: "#d8f3dc",
    definicao:
      "Avalia o quanto se sente autora da própria vida e das próprias escolhas — capacidade de tomar decisões alinhadas com os próprios valores e de não depender exclusivamente da validação externa.",
    perguntas: [
      "Me sinto livre para fazer escolhas alinhadas com o que quero?",
      "Consigo estabelecer limites sem culpa e sem medo de desagradar?",
      "Tomo decisões baseadas nos meus valores — ou no que os outros esperam?",
    ],
    sinaisSaude: [
      "Decisões próprias e alinhadas com valores",
      "Limites claros e respeitados",
      "Independência emocional e profissional",
      "Sensação de autoria da própria vida",
    ],
    sinaisAlerta: [
      "Decisões pautadas pelo medo de desagradar",
      "Dificuldade crônica de estabelecer limites",
      "Dependência excessiva de aprovação",
      "Sensação de não ter escolha ou controle",
    ],
  },
];

export const DIMENSAO_KEYS = [
  "carreira",
  "financeiro",
  "proposito",
  "lideranca",
  "relacionamentos",
  "desenvolvimento",
  "saude",
  "equilibrio",
  "reconhecimento",
  "autonomia",
] as const;

export type DimensaoKey = (typeof DIMENSAO_KEYS)[number];

export function getDimensaoInfo(key: string): DimensaoInfo | undefined {
  return DIMENSOES.find((d) => d.key === key);
}

export function getScoreClass(score: number | null | undefined): string {
  if (score === null || score === undefined) return "score-mid";
  if (score >= 7) return "score-high";
  if (score >= 4) return "score-mid";
  return "score-low";
}

export function getScoreLabel(score: number | null | undefined): string {
  if (score === null || score === undefined) return "—";
  if (score >= 7) return "Saudável";
  if (score >= 4) return "Atenção";
  return "Alerta";
}

export function getProfileScores(profile: Record<string, unknown>) {
  return DIMENSAO_KEYS.map((key) => {
    const scoreKey = `score${key.charAt(0).toUpperCase()}${key.slice(1)}`;
    // Handle special case for 'saude' -> 'scoreSaude'
    const val = profile[scoreKey] as number | null;
    return { key, label: DIMENSOES.find((d) => d.key === key)?.label ?? key, score: val };
  });
}
