import { type BigFiveProfile } from '@/lib/bigfive';

interface MentoringAnalysis {
  ajudas: string;
  oportunidades: string;
  riscos: string;
  sintese: string;
  createdAt: Date | string;
}

interface Props {
  profile: BigFiveProfile;
  analysis?: MentoringAnalysis | null;
}

// --- Dados completos por subfaceta ---

const MENTOR_GUIDE: Record<string, {
  label: string;
  emoji: string;
  color: string;
  subfacets: {
    name: string;
    description: string;
    questionsHigh: string[];   // Perguntas quando o escore é alto
    questionsLow: string[];    // Perguntas quando o escore é baixo
    watchFor: string;          // O que observar na sessão
    reframe: string;           // Possível reframe para a mentora usar
  }[];
}> = {
  emotionalStability: {
    label: 'Estabilidade Emocional',
    emoji: '🌊',
    color: '#0ea5e9',
    subfacets: [
      {
        name: 'Ansiedade',
        description: 'Tendência a sentir preocupação, tensão e nervosismo.',
        questionsHigh: [
          'Quando você percebe que está entrando em modo de ansiedade, o que acontece no seu corpo primeiro?',
          'Que tipo de situação profissional mais aciona sua ansiedade — e o que você faz com ela?',
          'Se a ansiedade fosse uma mensagem do seu sistema, o que ela estaria tentando te dizer?',
          'Você consegue distinguir ansiedade produtiva (que te prepara) de ansiedade paralisante?',
          'O que você já aprendeu sobre si mesmo nos momentos em que a ansiedade passou?',
        ],
        questionsLow: [
          'Em situações de alta pressão, como você sabe que chegou no limite?',
          'Já houve uma situação em que você deveria ter se preocupado mais e não se preocupou?',
          'Como as pessoas ao seu redor percebem sua calma — como recurso ou como distância?',
        ],
        watchFor: 'Observe se o mentorado minimiza emoções difíceis ou usa a "calma" como escudo.',
        reframe: '"Sua ansiedade pode ser um sensor de importância — o que ela está protegendo?"',
      },
      {
        name: 'Raiva / Hostilidade',
        description: 'Tendência a sentir frustração, irritação e raiva com facilidade.',
        questionsHigh: [
          'O que costuma estar por baixo da sua raiva — injustiça, falta de controle, decepção?',
          'Quando você sente raiva no trabalho, o que você faz com ela — expressa, engole, redireciona?',
          'Que situações fazem você perder a paciência mais rápido do que você gostaria?',
          'Como a raiva já te ajudou — e como ela já te atrapalhou?',
          'Se você pudesse escolher como expressar sua frustração de forma mais eficaz, como seria?',
        ],
        questionsLow: [
          'Você consegue identificar quando algo te incomoda, mesmo que não sinta raiva?',
          'Já houve uma situação em que você deveria ter reagido com mais firmeza e não reagiu?',
          'Como você comunica descontentamento sem usar a raiva como sinal?',
        ],
        watchFor: 'Raiva crônica pode mascarar mágoa ou sensação de injustiça não resolvida.',
        reframe: '"A raiva é energia — a questão é para onde você a direciona."',
      },
      {
        name: 'Depressão / Melancolia',
        description: 'Tendência a sentir tristeza, desânimo e falta de esperança.',
        questionsHigh: [
          'Quando você está num período de baixa energia emocional, o que te ajuda a sair?',
          'Que tipo de conquista ou reconhecimento te recarrega mais?',
          'Você consegue identificar os gatilhos que precedem seus períodos de desânimo?',
          'O que você diria ao seu eu de 5 anos atrás sobre os períodos difíceis que viveu?',
          'Quais recursos internos você já usou para atravessar momentos de tristeza profunda?',
        ],
        questionsLow: [
          'Como você lida com perdas ou fracassos — processa rápido ou evita sentir?',
          'Já houve uma situação em que você precisava de mais tempo para processar algo e não se deu esse tempo?',
        ],
        watchFor: 'Atenção a sinais de esgotamento emocional disfarçado de produtividade.',
        reframe: '"Tristeza não é fraqueza — é o sinal de que algo importava."',
      },
      {
        name: 'Autoconsciência / Vergonha',
        description: 'Tendência a sentir vergonha, constrangimento e sensibilidade ao julgamento.',
        questionsHigh: [
          'Em que situações você se sente mais exposto ou vulnerável ao julgamento dos outros?',
          'Como a preocupação com o que os outros pensam influencia suas decisões profissionais?',
          'Quando você erra em público, qual é o diálogo interno que acontece?',
          'O que você precisaria acreditar sobre si mesmo para agir com mais ousadia?',
          'Quem na sua vida te vê de forma mais generosa do que você se vê?',
        ],
        questionsLow: [
          'Como você recebe feedback crítico — processa, descarta ou usa seletivamente?',
          'Já houve uma situação em que você poderia ter sido mais sensível ao impacto das suas ações?',
        ],
        watchFor: 'Alta autoconsciência pode virar perfeccionismo paralisante ou autossabotagem.',
        reframe: '"Vulnerabilidade não é exposição — é coragem de ser visto."',
      },
      {
        name: 'Impulsividade',
        description: 'Dificuldade em resistir a impulsos, desejos e tentações.',
        questionsHigh: [
          'Em que tipo de situação você age antes de pensar — e qual é o padrão?',
          'Quando você toma uma decisão impulsiva que depois lamenta, o que estava sentindo antes?',
          'Que estratégias você já tentou para criar uma pausa entre o impulso e a ação?',
          'Como sua impulsividade já te trouxe oportunidades que a cautela teria perdido?',
          'O que você gostaria que as pessoas soubessem sobre por que você age rápido?',
        ],
        questionsLow: [
          'Você já perdeu uma oportunidade por esperar o momento perfeito?',
          'Como você se sente quando precisa decidir rapidamente sem todas as informações?',
        ],
        watchFor: 'Impulsividade alta pode ser criatividade não canalizada ou resposta ao estresse.',
        reframe: '"Velocidade de decisão pode ser um ativo — a questão é quando usá-la."',
      },
      {
        name: 'Vulnerabilidade ao Estresse',
        description: 'Dificuldade em lidar com pressão, adversidade e situações de crise.',
        questionsHigh: [
          'Quando você está sob pressão máxima, quais são os primeiros sinais de que está chegando no limite?',
          'O que você precisa (de si mesmo e dos outros) para funcionar bem em períodos de alta demanda?',
          'Como você se recupera depois de um período muito intenso?',
          'Que tipo de suporte você raramente pede mas frequentemente precisa?',
          'Se você pudesse redesenhar sua rotina para ter mais resiliência, o que mudaria primeiro?',
        ],
        questionsLow: [
          'Como você sabe que está estressado se não sente os sinais físicos comuns?',
          'Já houve uma situação em que você subestimou o impacto de uma crise em você?',
        ],
        watchFor: 'Baixa vulnerabilidade aparente pode esconder supressão emocional crônica.',
        reframe: '"Pedir ajuda não é fraqueza — é inteligência estratégica."',
      },
    ],
  },
  extraversion: {
    label: 'Extroversão',
    emoji: '☀️',
    color: '#f59e0b',
    subfacets: [
      {
        name: 'Cordialidade / Calor Social',
        description: 'Facilidade em criar vínculos, demonstrar afeto e se conectar com pessoas.',
        questionsHigh: [
          'Como você equilibra sua necessidade de conexão com a necessidade de espaço dos outros?',
          'Em que situações sua cordialidade natural já foi mal interpretada?',
          'Como você mantém relacionamentos profundos quando tem muitas conexões superficiais?',
          'O que você faz quando alguém não responde ao seu calor com a mesma intensidade?',
          'Como sua facilidade de criar vínculos contribui para seus objetivos profissionais?',
        ],
        questionsLow: [
          'Como você demonstra que se importa com alguém sem usar expressões verbais de afeto?',
          'Em que situações você gostaria de ser mais caloroso mas não sabe como?',
          'Como as pessoas sabem que você gosta delas?',
        ],
        watchFor: 'Alta cordialidade pode mascarar dificuldade de estabelecer limites.',
        reframe: '"Conexão genuína não precisa de quantidade — precisa de presença."',
      },
      {
        name: 'Gregariedade / Sociabilidade',
        description: 'Preferência por estar em grupos e ambientes sociais.',
        questionsHigh: [
          'Como você recarrega quando não tem acesso a interação social?',
          'Em que situações a necessidade de estar com pessoas já te custou foco ou profundidade?',
          'Como você lida com períodos de isolamento necessário (trabalho intenso, luto, recuperação)?',
          'O que você aprende sobre si mesmo quando está sozinho por mais tempo do que gosta?',
          'Como você distingue conexão genuína de distração social?',
        ],
        questionsLow: [
          'Como você se sente em ambientes de alta demanda social por longos períodos?',
          'Que tipo de interação social te energiza versus te drena?',
          'Como você colabora efetivamente sem precisar de muita interação?',
        ],
        watchFor: 'Introversão não é timidez — explore como o mentorado prefere se conectar.',
        reframe: '"Qualidade de presença importa mais do que quantidade de interação."',
      },
      {
        name: 'Assertividade',
        description: 'Tendência a se posicionar, liderar e influenciar grupos.',
        questionsHigh: [
          'Em que situações sua assertividade já foi percebida como agressividade?',
          'Como você decide quando liderar e quando seguir?',
          'O que acontece internamente quando você precisa ceder o protagonismo?',
          'Como você usa sua influência para amplificar outras vozes, não só a sua?',
          'Quando foi a última vez que você mudou de opinião publicamente — e como foi?',
        ],
        questionsLow: [
          'Em que situações você tem uma opinião forte mas não a expressa — e por quê?',
          'O que você precisaria sentir para se posicionar com mais confiança?',
          'Como você influencia sem usar autoridade ou posição?',
          'Que custo você já pagou por não se posicionar quando deveria?',
        ],
        watchFor: 'Baixa assertividade pode ser estratégia de sobrevivência em ambientes hostis.',
        reframe: '"Sua voz tem valor — o mundo precisa do que só você pode dizer."',
      },
      {
        name: 'Nível de Atividade',
        description: 'Preferência por ritmo acelerado, múltiplas tarefas e alta energia.',
        questionsHigh: [
          'Como você sabe quando está fazendo demais — e o que te faz parar?',
          'O que acontece com sua qualidade de trabalho quando você desacelera?',
          'Como as pessoas ao seu redor vivenciam seu ritmo — como inspiração ou como pressão?',
          'Que tipo de descanso realmente te recupera (não apenas pausa física)?',
          'O que você estaria perdendo se desacelerasse 20%?',
        ],
        questionsLow: [
          'Em que tipo de projeto ou contexto você se sente mais energizado?',
          'Como você lida com a pressão de ambientes que exigem ritmo acelerado?',
          'O que te ajuda a manter o momentum quando a energia está baixa?',
        ],
        watchFor: 'Alto nível de atividade pode ser fuga de reflexão ou de emoções difíceis.',
        reframe: '"Descanso não é ausência de produção — é parte do processo criativo."',
      },
      {
        name: 'Busca por Emoção / Excitação',
        description: 'Necessidade de estimulação, novidade e experiências intensas.',
        questionsHigh: [
          'Como você lida com períodos de rotina e estabilidade sem se sentir entediado?',
          'Que riscos você já assumiu movido pela busca de emoção — e qual foi o resultado?',
          'Como você distingue busca saudável de novidade de fuga do desconforto?',
          'O que você faz quando a adrenalina de um projeto novo passa?',
          'Como sua necessidade de estimulação afeta seus relacionamentos e compromissos de longo prazo?',
        ],
        questionsLow: [
          'O que te faz sair da zona de conforto — necessidade, curiosidade ou pressão externa?',
          'Como você reage quando é convidado para algo novo e desconhecido?',
        ],
        watchFor: 'Alta busca por excitação pode mascarar dificuldade de tolerar o ordinário.',
        reframe: '"A profundidade também é uma forma de intensidade."',
      },
      {
        name: 'Emoções Positivas',
        description: 'Tendência a experimentar alegria, entusiasmo e otimismo.',
        questionsHigh: [
          'Como você mantém seu otimismo quando as coisas não saem como planejado?',
          'Já houve uma situação em que seu entusiasmo foi à frente da realidade — e o que aprendeu?',
          'Como você usa sua energia positiva para influenciar o ambiente sem invalidar as dificuldades dos outros?',
          'O que acontece com você quando está num ambiente cronicamente negativo?',
          'Como você cuida do seu otimismo para que ele não vire ingenuidade?',
        ],
        questionsLow: [
          'O que te faz sentir genuinamente animado — e com que frequência você tem isso na sua vida?',
          'Como você se motiva em períodos de baixa energia emocional?',
          'O que você precisaria mudar no seu ambiente para ter mais alegria no dia a dia?',
        ],
        watchFor: 'Baixas emoções positivas podem indicar desalinhamento vocacional ou esgotamento.',
        reframe: '"Alegria não é superficialidade — é sinal de que você está no lugar certo."',
      },
    ],
  },
  openness: {
    label: 'Abertura à Experiência',
    emoji: '🌿',
    color: '#10b981',
    subfacets: [
      {
        name: 'Fantasia / Imaginação',
        description: 'Tendência a ter uma vida imaginativa rica e devaneios criativos.',
        questionsHigh: [
          'Como você usa sua imaginação como recurso profissional — e como ela já te atrapalhou?',
          'Quando você está em modo de devaneio, o que costuma estar processando?',
          'Como você traz suas ideias imaginativas para o mundo real de forma prática?',
          'Que projeto você ainda não iniciou que vive na sua imaginação há muito tempo?',
          'Como você distingue visão criativa de fuga da realidade?',
        ],
        questionsLow: [
          'Em que situações você gostaria de ter mais criatividade ou pensamento fora da caixa?',
          'Como você reage quando alguém apresenta uma ideia muito abstrata ou não convencional?',
        ],
        watchFor: 'Alta fantasia pode ser sinal de insatisfação com o presente — explore o que está faltando.',
        reframe: '"Imaginar o que não existe ainda é o primeiro passo para criá-lo."',
      },
      {
        name: 'Estética / Apreciação Artística',
        description: 'Sensibilidade à beleza, arte e experiências estéticas.',
        questionsHigh: [
          'Como sua sensibilidade estética influencia seu trabalho e seu ambiente?',
          'Em que situações você se sente incomodado com a falta de cuidado estético ao seu redor?',
          'Como você usa a beleza como recurso para se recuperar ou se inspirar?',
          'De que forma sua apreciação artística se conecta com seus valores mais profundos?',
          'O que você criaria se soubesse que ninguém ia julgar?',
        ],
        questionsLow: [
          'O que você considera belo — mesmo que não seja arte no sentido tradicional?',
          'Como você cria ambientes que te inspiram a trabalhar melhor?',
        ],
        watchFor: 'Sensibilidade estética alta pode gerar sofrimento em ambientes caóticos ou sem cuidado.',
        reframe: '"Cuidar do ambiente é cuidar de si mesmo."',
      },
      {
        name: 'Sentimentos / Abertura Emocional',
        description: 'Disposição para explorar e valorizar a própria vida emocional.',
        questionsHigh: [
          'Como você processa emoções complexas — você as nomeia, as sente, as analisa?',
          'Em que situações você se permite ser vulnerável — e em quais você ainda não consegue?',
          'Como sua riqueza emocional contribui para suas relações e decisões?',
          'O que você faz quando sente uma emoção que não consegue nomear?',
          'Como você usa sua inteligência emocional como ferramenta de liderança?',
        ],
        questionsLow: [
          'Como você sabe o que está sentindo — você acessa isso facilmente ou precisa de tempo?',
          'Em que situações as emoções dos outros te surpreendem ou confundem?',
        ],
        watchFor: 'Baixa abertura emocional pode ser proteção — explore com cuidado e sem pressão.',
        reframe: '"Sentir não é perder o controle — é ter mais informação."',
      },
      {
        name: 'Ações / Abertura a Novas Experiências',
        description: 'Preferência por variedade, novidade e experimentação na vida prática.',
        questionsHigh: [
          'Como você decide quais novas experiências valem seu tempo e energia?',
          'Em que área da sua vida você ainda não explorou o suficiente — e o que te impede?',
          'Como você lida com o desconforto inicial de algo completamente novo?',
          'Que experiência você evitou por muito tempo e depois se arrependeu de não ter feito antes?',
          'Como sua abertura a novas experiências impacta sua capacidade de aprofundar o que já tem?',
        ],
        questionsLow: [
          'O que tornaria uma nova experiência atraente o suficiente para você tentar?',
          'Como você reage quando sua rotina é interrompida de forma inesperada?',
          'O que você ganharia se experimentasse algo completamente fora do seu padrão?',
        ],
        watchFor: 'Baixa abertura a novas experiências pode ser conforto legítimo ou medo disfarçado.',
        reframe: '"Rotina é eficiência — mas às vezes o desvio é onde a vida acontece."',
      },
      {
        name: 'Ideias / Curiosidade Intelectual',
        description: 'Fascínio por ideias abstratas, teorias e exploração intelectual.',
        questionsHigh: [
          'Como você aplica sua curiosidade intelectual de forma prática no seu trabalho?',
          'Em que momento a profundidade intelectual já te afastou de pessoas ou oportunidades?',
          'Como você decide quando é hora de parar de pesquisar e começar a agir?',
          'O que você está estudando ou explorando agora que ninguém sabe?',
          'Como você usa seu amor por ideias para inspirar as pessoas ao seu redor?',
        ],
        questionsLow: [
          'O que te faz querer aprender algo novo — necessidade prática, curiosidade ou desafio?',
          'Como você reage quando alguém apresenta uma perspectiva muito diferente da sua?',
        ],
        watchFor: 'Alta curiosidade intelectual pode gerar frustração em ambientes que não valorizam profundidade.',
        reframe: '"Sua mente é um ativo — a questão é como você a direciona."',
      },
      {
        name: 'Valores / Abertura a Novas Perspectivas',
        description: 'Disposição para questionar valores, normas e perspectivas estabelecidas.',
        questionsHigh: [
          'Como você equilibra sua abertura a novas perspectivas com a necessidade de ter convicções sólidas?',
          'Em que situações você mudou de opinião sobre algo que considerava certo — e como foi esse processo?',
          'Como você lida com pessoas que têm valores muito diferentes dos seus?',
          'Que crença você carrega que sabe que precisa revisitar mas ainda não revisitou?',
          'Como sua abertura a questionar normas impacta sua relação com autoridade?',
        ],
        questionsLow: [
          'Em que área da sua vida você está mais aberto a ser desafiado — e em qual menos?',
          'Como você reage quando alguém questiona algo que você considera fundamental?',
        ],
        watchFor: 'Baixa abertura a novas perspectivas pode ser estabilidade saudável ou rigidez defensiva.',
        reframe: '"Questionar não é trair — é aprofundar."',
      },
    ],
  },
  agreeableness: {
    label: 'Agradabilidade',
    emoji: '💚',
    color: '#22c55e',
    subfacets: [
      {
        name: 'Confiança',
        description: 'Tendência a acreditar nas boas intenções das pessoas.',
        questionsHigh: [
          'Como você protege sua confiança natural sem se tornar ingênuo?',
          'Já houve uma situação em que sua confiança foi usada contra você — o que aprendeu?',
          'Como você decide em quem confiar em ambientes profissionais competitivos?',
          'O que acontece internamente quando alguém decepciona sua confiança?',
          'Como você reconstrói confiança depois de uma traição?',
        ],
        questionsLow: [
          'O que uma pessoa ou situação precisa demonstrar para ganhar sua confiança?',
          'Como sua desconfiança natural te protege — e em que situações ela te isola?',
          'Já houve uma situação em que você se arrependeu de não ter confiado mais?',
        ],
        watchFor: 'Alta desconfiança pode ser trauma não resolvido — aborde com cuidado.',
        reframe: '"Confiança seletiva não é cinismo — é discernimento."',
      },
      {
        name: 'Franqueza / Honestidade',
        description: 'Tendência a ser direto, transparente e sem segundas intenções.',
        questionsHigh: [
          'Como você entrega verdades difíceis de forma que as pessoas possam ouvir?',
          'Em que situações sua franqueza já custou um relacionamento ou oportunidade?',
          'Como você decide o que compartilhar e o que guardar para si?',
          'O que você faz quando percebe que a verdade vai machucar alguém que você ama?',
          'Como você recebe quando alguém é completamente honesto com você sobre algo difícil?',
        ],
        questionsLow: [
          'Em que situações você tende a suavizar a verdade — e qual é o custo disso?',
          'Como você se sente quando precisa dar um feedback negativo?',
          'O que te impede de ser mais direto quando necessário?',
        ],
        watchFor: 'Baixa franqueza pode ser diplomacia saudável ou evitação de conflito.',
        reframe: '"Honestidade gentil é um presente — mesmo quando dói."',
      },
      {
        name: 'Altruísmo',
        description: 'Disposição para ajudar os outros e se preocupar com seu bem-estar.',
        questionsHigh: [
          'Como você distingue ajudar por amor de ajudar por medo de desapontar?',
          'Em que situações você coloca as necessidades dos outros antes das suas de forma prejudicial?',
          'Como você pede ajuda — com facilidade ou com dificuldade?',
          'O que acontece internamente quando você diz não para alguém que precisa de você?',
          'Como você cuida de si mesmo para poder continuar cuidando dos outros?',
        ],
        questionsLow: [
          'O que te faz querer ajudar alguém — empatia, reciprocidade ou senso de dever?',
          'Como você reage quando alguém precisa de mais do que você pode dar?',
        ],
        watchFor: 'Alto altruísmo pode esconder dificuldade de receber ou de se priorizar.',
        reframe: '"Você não pode servir de um copo vazio."',
      },
      {
        name: 'Cooperação / Conformidade',
        description: 'Tendência a evitar conflitos e ceder em detrimento de si mesmo.',
        questionsHigh: [
          'Em que situações você cede quando deveria se posicionar — e qual é o padrão?',
          'O que você sente no corpo quando está prestes a ceder algo importante?',
          'Como você distingue flexibilidade saudável de autoanulação?',
          'Que limite você precisa estabelecer que ainda não estabeleceu?',
          'O que você precisaria acreditar sobre si mesmo para discordar com mais frequência?',
        ],
        questionsLow: [
          'Como você lida com a tensão de um conflito que não se resolve rapidamente?',
          'Em que situações você poderia ceder mais sem perder nada importante?',
        ],
        watchFor: 'Alta cooperação pode ser condicionamento cultural ou medo de abandono.',
        reframe: '"Discordar não é atacar — é respeitar o outro o suficiente para ser honesto."',
      },
      {
        name: 'Modéstia / Humildade',
        description: 'Tendência a minimizar as próprias realizações e evitar autopromoção.',
        questionsHigh: [
          'Como você reconhece suas conquistas sem minimizá-las?',
          'Em que situações sua modéstia já te impediu de ser reconhecido ou promovido?',
          'O que você diria sobre si mesmo se soubesse que ninguém ia achar arrogante?',
          'Como você recebe elogios — com gratidão ou com desconforto?',
          'O que te impede de ocupar o espaço que você merece?',
        ],
        questionsLow: [
          'Como você usa sua autoconfiança para elevar as pessoas ao seu redor?',
          'Em que situações você poderia ser mais generoso em reconhecer a contribuição dos outros?',
        ],
        watchFor: 'Alta modéstia pode ser síndrome do impostor ou medo de inveja.',
        reframe: '"Reconhecer seu valor não é vaidade — é honestidade."',
      },
      {
        name: 'Sensibilidade / Empatia',
        description: 'Disposição para se preocupar com o bem-estar e sofrimento alheio.',
        questionsHigh: [
          'Como você protege sua sensibilidade em ambientes que não a valorizam?',
          'Em que situações a dor dos outros te afeta de forma que compromete seu funcionamento?',
          'Como você usa sua empatia como ferramenta de liderança sem perder seus próprios limites?',
          'O que você faz quando sente a dor de alguém mas não pode fazer nada para ajudar?',
          'Como você se recupera depois de absorver muito sofrimento alheio?',
        ],
        questionsLow: [
          'Como você percebe que alguém está sofrendo mesmo sem que diga explicitamente?',
          'Em que situações você gostaria de ter mais paciência com as dificuldades dos outros?',
        ],
        watchFor: 'Alta sensibilidade pode levar a fadiga de compaixão — monitore sinais de esgotamento.',
        reframe: '"Sentir com o outro não é fraqueza — é o que torna a liderança humana."',
      },
    ],
  },
  conscientiousness: {
    label: 'Conscienciosidade',
    emoji: '⚡',
    color: '#8b5cf6',
    subfacets: [
      {
        name: 'Competência / Autoeficácia',
        description: 'Crença na própria capacidade de realizar tarefas com eficácia.',
        questionsHigh: [
          'Em que área você sente que sua competência ainda não foi totalmente reconhecida?',
          'Como você lida quando alguém questiona sua capacidade em algo que você domina?',
          'Como você usa sua confiança para criar espaço para que outros também se sintam competentes?',
          'O que você ainda não tentou porque acredita que não seria bom o suficiente?',
          'Como você continua crescendo quando já é muito bom no que faz?',
        ],
        questionsLow: [
          'Em que área você sente que precisa desenvolver mais confiança na sua capacidade?',
          'O que você precisaria ter feito ou aprendido para se sentir mais competente?',
          'Como você reage quando alguém acredita em você mais do que você mesmo?',
        ],
        watchFor: 'Baixa autoeficácia pode ser síndrome do impostor — explore evidências concretas.',
        reframe: '"Você já chegou até aqui — isso não foi sorte."',
      },
      {
        name: 'Ordem / Organização',
        description: 'Preferência por ambientes organizados, estruturados e metódicos.',
        questionsHigh: [
          'Como você lida quando seu ambiente ou seus planos são interrompidos de forma inesperada?',
          'Em que situações sua necessidade de ordem já criou atrito com pessoas mais flexíveis?',
          'Como você distingue organização funcional de controle ansioso?',
          'O que acontece com sua produtividade quando está num ambiente caótico?',
          'Como você ajuda pessoas menos organizadas sem julgá-las?',
        ],
        questionsLow: [
          'Em que área da sua vida a falta de organização está te custando mais?',
          'O que tornaria a organização mais natural e menos pesada para você?',
        ],
        watchFor: 'Alta necessidade de ordem pode ser resposta a ambientes imprevisíveis na história do mentorado.',
        reframe: '"Estrutura não é prisão — é liberdade para focar no que importa."',
      },
      {
        name: 'Senso de Dever / Responsabilidade',
        description: 'Forte senso de obrigação moral e comprometimento com responsabilidades.',
        questionsHigh: [
          'Como você distingue responsabilidade saudável de hiperresponsabilidade?',
          'O que acontece internamente quando você não consegue cumprir um compromisso?',
          'Como você lida quando alguém não tem o mesmo nível de comprometimento que você?',
          'Que responsabilidade você está carregando que não é sua — e o que te impede de largar?',
          'Como você cuida de si mesmo sem sentir que está sendo irresponsável?',
        ],
        questionsLow: [
          'Em que situações você assume responsabilidades que depois não consegue cumprir?',
          'Como você lida com as consequências de não cumprir um compromisso?',
        ],
        watchFor: 'Alto senso de dever pode ser condicionamento familiar ou medo de decepcionar.',
        reframe: '"Você não precisa ser responsável por tudo para ser confiável."',
      },
      {
        name: 'Busca por Realizações',
        description: 'Motivação para alcançar metas, superar desafios e ter sucesso.',
        questionsHigh: [
          'Como você define sucesso — e essa definição ainda é sua ou foi herdada?',
          'O que acontece com você quando atinge uma meta importante — você celebra ou já parte para a próxima?',
          'Como você lida com períodos em que não está progredindo visivelmente?',
          'Que conquista você está perseguindo que, no fundo, não é para você?',
          'Como você mantém a ambição sem sacrificar o que mais importa?',
        ],
        questionsLow: [
          'O que te faz sentir que valeu a pena — resultado, processo ou impacto?',
          'Como você se motiva quando o objetivo parece distante ou incerto?',
        ],
        watchFor: 'Alta busca por realizações pode mascarar vazio existencial ou necessidade de aprovação.',
        reframe: '"Realizações são marcos — não são você."',
      },
      {
        name: 'Autodisciplina',
        description: 'Capacidade de iniciar e completar tarefas mesmo sem motivação imediata.',
        questionsHigh: [
          'Como você usa sua autodisciplina sem transformá-la em rigidez ou punição?',
          'Em que situações sua disciplina já te impediu de descansar quando precisava?',
          'Como você lida quando alguém próximo não tem a mesma disciplina que você?',
          'O que você faz quando sua disciplina falha — como você se trata?',
          'Como você distingue disciplina de controle compulsivo?',
        ],
        questionsLow: [
          'Que hábito você sabe que precisa construir mas ainda não conseguiu manter?',
          'O que acontece internamente quando você está procrastinando algo importante?',
          'Como você se motiva nos dias em que simplesmente não quer fazer nada?',
        ],
        watchFor: 'Baixa autodisciplina pode ser TDAH não diagnosticado, depressão ou desalinhamento de valores.',
        reframe: '"Autodisciplina é um músculo — explore sistemas que reduzem a dependência de motivação."',
      },
      {
        name: 'Deliberação / Prudência',
        description: 'Tendência a pensar antes de agir, planejar e considerar consequências.',
        questionsHigh: [
          'Em que tipo de decisão você tende a analisar demais — e qual é o custo disso?',
          'Como você decide quando tem informação suficiente para agir?',
          'Que decisão importante você está adiando que já deveria ter sido tomada?',
          'Como você lida com a pressão de decidir rápido em situações de alta incerteza?',
          'O que você perdeu por esperar o momento perfeito?',
        ],
        questionsLow: [
          'Em que tipo de decisão você age rápido demais — e qual é o padrão?',
          'Como você avalia o risco antes de agir em situações de alta consequência?',
        ],
        watchFor: 'Alta deliberação pode virar paralisia por análise — ajude a definir critérios de decisão.',
        reframe: '"Decisão imperfeita tomada é melhor do que decisão perfeita adiada."',
      },
    ],
  },
};

const DIMENSION_ORDER = ['emotionalStability', 'extraversion', 'openness', 'agreeableness', 'conscientiousness'] as const;

export function PrintableMentorGuide({ profile, analysis }: Props) {
  const { dimensions } = profile;

  return (
    <div className="hidden print:block" id="print-mentor-guide-container">
      <style>{`
        @page {
          size: A4;
          margin: 15mm 14mm;
        }
        @media print {
          * { box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 10px;
            color: #1a1a2e;
            background: white;
          }
          /* Modo normal: esconde este guia */
          #print-mentor-guide-container { display: none !important; }
          /* Modo guia da mentora: esconde os outros, mostra este */
          body.print-mentor-guide-mode #print-report-container { display: none !important; }
          body.print-mentor-guide-mode #print-summary-container { display: none !important; }
          body.print-mentor-guide-mode #print-powerful-container { display: none !important; }
          body.print-mentor-guide-mode #print-mentor-guide-container { display: block !important; }

          /* ── Capa ── */
          .mg-cover {
            background: linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #7c3aed 100%);
            color: white;
            padding: 32px 36px;
            border-radius: 10px;
            margin-bottom: 20px;
            page-break-after: always;
          }
          .mg-cover-badge {
            display: inline-block;
            background: rgba(255,255,255,0.15);
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 20px;
            padding: 4px 12px;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin-bottom: 16px;
          }
          .mg-cover h1 {
            font-size: 28px;
            font-weight: 800;
            margin: 0 0 6px;
            line-height: 1.2;
          }
          .mg-cover-sub {
            font-size: 13px;
            opacity: 0.8;
            margin: 0 0 20px;
          }
          .mg-cover-name {
            font-size: 16px;
            font-weight: 700;
            margin: 0 0 4px;
            color: #e9d5ff;
          }
          .mg-cover-meta {
            font-size: 10px;
            opacity: 0.65;
            margin: 0 0 24px;
          }
          .mg-cover-instructions {
            background: rgba(255,255,255,0.12);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            padding: 14px 16px;
            font-size: 10px;
            line-height: 1.7;
          }
          .mg-cover-instructions strong { color: #fde68a; }

          /* ── Cabeçalho de dimensão ── */
          .mg-dim-header {
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 10px;
            page-break-after: avoid;
          }
          .mg-dim-header h2 {
            font-size: 15px;
            font-weight: 800;
            margin: 0 0 3px;
          }
          .mg-dim-score {
            font-size: 10px;
            opacity: 0.85;
            margin: 0;
          }

          /* ── Card de subfaceta ── */
          .mg-sf-card {
            border: 1px solid #e2e8f0;
            border-radius: 7px;
            padding: 10px 12px;
            margin-bottom: 8px;
            page-break-inside: avoid;
          }
          .mg-sf-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
          }
          .mg-sf-name {
            font-size: 11px;
            font-weight: 800;
            color: #1e1b4b;
          }
          .mg-sf-score-badge {
            font-size: 9px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 10px;
            background: #f0fdf4;
            color: #059669;
            border: 1px solid #bbf7d0;
          }
          .mg-sf-desc {
            font-size: 9px;
            color: #64748b;
            margin: 0 0 8px;
            font-style: italic;
          }

          /* ── Perguntas ── */
          .mg-q-section {
            margin-bottom: 7px;
          }
          .mg-q-section-label {
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 4px;
            padding: 2px 6px;
            border-radius: 3px;
            display: inline-block;
          }
          .mg-q-section-label.high {
            background: #eff6ff;
            color: #1d4ed8;
          }
          .mg-q-section-label.low {
            background: #fff7ed;
            color: #c2410c;
          }
          .mg-q-list {
            list-style: none;
            margin: 0;
            padding: 0;
          }
          .mg-q-list li {
            font-size: 9.5px;
            color: #334155;
            padding: 3px 0 3px 14px;
            position: relative;
            line-height: 1.5;
            border-bottom: 1px dashed #f1f5f9;
          }
          .mg-q-list li:last-child { border-bottom: none; }
          .mg-q-list li::before {
            content: "→";
            position: absolute;
            left: 0;
            color: #94a3b8;
            font-size: 9px;
          }

          /* ── Caixa de observação e reframe ── */
          .mg-sf-footer {
            display: flex;
            gap: 6px;
            margin-top: 7px;
          }
          .mg-watch-box {
            flex: 1;
            background: #fefce8;
            border: 1px solid #fde68a;
            border-radius: 5px;
            padding: 5px 7px;
            font-size: 8.5px;
            color: #713f12;
          }
          .mg-watch-label {
            font-weight: 800;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
            color: #92400e;
          }
          .mg-reframe-box {
            flex: 1;
            background: #f5f3ff;
            border: 1px solid #ddd6fe;
            border-radius: 5px;
            padding: 5px 7px;
            font-size: 8.5px;
            color: #4c1d95;
            font-style: italic;
          }
          .mg-reframe-label {
            font-weight: 800;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
            color: #6d28d9;
            font-style: normal;
          }

          /* ── Rodapé ── */
          .mg-footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            margin-top: 16px;
            font-size: 8px;
            color: #94a3b8;
            text-align: center;
          }

          /* ── Plano de Desenvolvimento ── */
          .mg-plan-page {
            page-break-before: always;
            padding-top: 4px;
          }
          .mg-plan-header {
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
            color: white;
            padding: 20px 24px;
            border-radius: 10px;
            margin-bottom: 16px;
          }
          .mg-plan-header h2 {
            font-size: 18px;
            font-weight: 800;
            margin: 0 0 4px;
          }
          .mg-plan-header p {
            font-size: 10px;
            opacity: 0.8;
            margin: 0;
          }
          .mg-plan-card {
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            margin-bottom: 14px;
            overflow: hidden;
            page-break-inside: avoid;
          }
          .mg-plan-card-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 14px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
          }
          .mg-plan-rank {
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: #1d4ed8;
            color: white;
            font-size: 12px;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .mg-plan-sf-name {
            font-size: 13px;
            font-weight: 800;
            color: #1e293b;
          }
          .mg-plan-sf-dim {
            font-size: 9px;
            color: #64748b;
            margin-left: auto;
          }
          .mg-plan-body {
            padding: 10px 14px;
          }
          .mg-plan-desc {
            font-size: 9.5px;
            color: #475569;
            margin: 0 0 10px;
            font-style: italic;
          }
          .mg-plan-section-title {
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #1d4ed8;
            margin-bottom: 5px;
          }
          .mg-plan-actions {
            list-style: none;
            margin: 0 0 10px;
            padding: 0;
          }
          .mg-plan-actions li {
            font-size: 9.5px;
            color: #334155;
            padding: 4px 0 4px 16px;
            position: relative;
            border-bottom: 1px dashed #f1f5f9;
            line-height: 1.5;
          }
          .mg-plan-actions li:last-child { border-bottom: none; }
          .mg-plan-actions li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #2563eb;
            font-weight: 800;
            font-size: 9px;
          }
          .mg-plan-commitment {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 6px;
            padding: 8px 10px;
            margin-top: 6px;
          }
          .mg-plan-commitment-label {
            font-size: 9px;
            font-weight: 800;
            color: #1d4ed8;
            margin-bottom: 4px;
          }
          .mg-plan-commitment-line {
            border-bottom: 1px solid #93c5fd;
            height: 18px;
            margin-bottom: 4px;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════════
          CAPA
      ══════════════════════════════════════════════ */}
      <div className="mg-cover">
        <div className="mg-cover-badge">🔒 USO EXCLUSIVO DA MENTORA</div>
        <h1>Guia de Perguntas Poderosas</h1>
        <p className="mg-cover-sub">Roteiro completo para sessão de mentoring — Big Five</p>
        <p className="mg-cover-name">Mentorado(a): {profile.name}</p>
        <p className="mg-cover-meta">
          {profile.email} &nbsp;·&nbsp; {new Date(profile.timestamp).toLocaleDateString('pt-BR')}
          {profile.testVersion === 'ipip120' ? ' &nbsp;·&nbsp; IPIP-NEO-120 (120 questões)' : ' &nbsp;·&nbsp; Formulário 30 questões'}
        </p>

        <div className="mg-cover-instructions">
          <strong>Como usar este guia:</strong><br />
          Este documento é seu roteiro de sessão. Para cada subfaceta, você encontrará:<br />
          <strong>→ Perguntas para escore alto</strong> — use quando o mentorado pontua alto na dimensão<br />
          <strong>→ Perguntas para escore baixo</strong> — use quando o mentorado pontua baixo<br />
          <strong>→ O que observar</strong> — sinais de alerta e padrões a monitorar na sessão<br />
          <strong>→ Reframe</strong> — uma frase de ressignificação que você pode usar na hora certa<br /><br />
          <strong>Lembre-se:</strong> as perguntas são pontos de partida, não roteiro rígido. Siga a energia do mentorado.
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          UMA SEÇÃO POR DIMENSÃO
      ══════════════════════════════════════════════ */}
      {DIMENSION_ORDER.map((dimKey) => {
        const dim = dimensions[dimKey];
        const guide = MENTOR_GUIDE[dimKey];
        if (!dim || !guide) return null;
        const score = Math.round(dim.score);
        const isHigh = score >= 60;

        return (
          <div key={dimKey}>
            {/* Cabeçalho da dimensão */}
            <div className="mg-dim-header" style={{ background: `linear-gradient(135deg, ${guide.color}dd 0%, ${guide.color} 100%)` }}>
              <h2>{guide.emoji} {guide.label}</h2>
              <p className="mg-dim-score">
                Escore: {score}% ({dim.classification === 'high' ? 'Elevado' : dim.classification === 'low' ? 'Baixo' : 'Moderado'})
                &nbsp;·&nbsp; {isHigh ? 'Use principalmente as perguntas de escore alto' : 'Use principalmente as perguntas de escore baixo'}
              </p>
            </div>

            {/* Subfacetas */}
            {guide.subfacets.map((sf, sfIdx) => (
              <div key={sfIdx} className="mg-sf-card">
                <div className="mg-sf-header">
                  <span className="mg-sf-name">{sf.name}</span>
                  <span className="mg-sf-score-badge">{isHigh ? '▲ Elevada' : '▼ Baixa'}</span>
                </div>
                <p className="mg-sf-desc">{sf.description}</p>

                {/* Perguntas para escore alto */}
                <div className="mg-q-section">
                  <span className="mg-q-section-label high">▲ Perguntas — Escore Alto</span>
                  <ul className="mg-q-list">
                    {sf.questionsHigh.map((q, qi) => (
                      <li key={qi}>{q}</li>
                    ))}
                  </ul>
                </div>

                {/* Perguntas para escore baixo */}
                <div className="mg-q-section">
                  <span className="mg-q-section-label low">▼ Perguntas — Escore Baixo</span>
                  <ul className="mg-q-list">
                    {sf.questionsLow.map((q, qi) => (
                      <li key={qi}>{q}</li>
                    ))}
                  </ul>
                </div>

                {/* Observação + Reframe */}
                <div className="mg-sf-footer">
                  <div className="mg-watch-box">
                    <div className="mg-watch-label">⚠ O que observar</div>
                    {sf.watchFor}
                  </div>
                  <div className="mg-reframe-box">
                    <div className="mg-reframe-label">💡 Reframe</div>
                    {sf.reframe}
                  </div>
                </div>
              </div>
            ))}

            <div style={{ height: '8px' }} />
          </div>
        );
      })}

      {/* ══════════════════════════════════════════════
          PLANO DE DESENVOLVIMENTO
      ══════════════════════════════════════════════ */}
      {(() => {
        // Coletar todas as subfacetas com seus escores estimados
        const allSubfacets: { dimKey: string; dimLabel: string; sfName: string; sfDesc: string; score: number }[] = [];
        DIMENSION_ORDER.forEach(dimKey => {
          const dim = dimensions[dimKey];
          const guide = MENTOR_GUIDE[dimKey];
          if (!dim || !guide) return;
          const dimScore = Math.round(dim.score);
          guide.subfacets.forEach((sf, sfIdx) => {
            const variation = sfIdx % 3 === 0 ? 3 : sfIdx % 3 === 1 ? -3 : 0;
            const sfScore = Math.min(100, Math.max(5, dimScore + variation));
            allSubfacets.push({ dimKey, dimLabel: guide.label, sfName: sf.name, sfDesc: sf.description, score: sfScore });
          });
        });
        // Ordenar por escore crescente e pegar as 3 mais baixas
        const bottom3 = [...allSubfacets].sort((a, b) => a.score - b.score).slice(0, 3);

        // Ações de desenvolvimento por subfaceta
        const DEV_ACTIONS: Record<string, { actions: string[]; commitment: string }> = {
          'Ansiedade': {
            actions: [
              'Praticar respiração diafragmática por 5 minutos antes de situações de alta pressão',
              'Criar um "diário de gatilhos" para identificar padrões de ansiedade',
              'Desenvolver uma frase-âncora pessoal para momentos de escalada ansiosa',
              'Estabelecer uma rotina de "descompresso" ao final do dia de trabalho',
            ],
            commitment: 'Qual é uma ação concreta que você vai tomar esta semana para gerenciar melhor sua ansiedade?'
          },
          'Raiva / Hostilidade': {
            actions: [
              'Identificar os 3 principais gatilhos de irritação e criar um protocolo de resposta para cada',
              'Praticar a técnica do "pause de 90 segundos" antes de reagir em conflitos',
              'Criar um canal de expressão saudável para frustração (exercício, escrita, arte)',
              'Comunicar descontentamento usando linguagem de "eu sinto" em vez de acusações',
            ],
            commitment: 'Em qual situação específica você vai praticar uma resposta diferente esta semana?'
          },
          'Depressão / Melancolia': {
            actions: [
              'Mapear os períodos de baixa e identificar os padrões que os precedem',
              'Criar uma lista de "recursos de recuperação" pessoais para usar nos momentos difíceis',
              'Estabelecer uma rotina mínima de autocuidado que funcione mesmo nos dias ruins',
              'Identificar uma pessoa de confiança para acionar quando o desnânimo aparecer',
            ],
            commitment: 'Qual é um recurso de recuperação que você vai usar ativamente esta semana?'
          },
          'Autoconsciência / Vergonha': {
            actions: [
              'Praticar o "diário de evidências" — registrar conquistas diárias por escrito',
              'Identificar a voz crítica interna e dar-lhe um nome para criar distância',
              'Expor-se a uma situação de vulnerabilidade calculada por semana',
              'Buscar feedback positivo ativo de pessoas de confiança',
            ],
            commitment: 'Qual situação de vulnerabilidade calculada você vai enfrentar esta semana?'
          },
          'Impulsividade': {
            actions: [
              'Criar uma regra pessoal: decisões acima de X impacto esperam 24 horas',
              'Implementar um "checklist de pausa" antes de agir em momentos de alta emoção',
              'Identificar os contextos em que a impulsividade aparece mais e criar alertas',
              'Praticar a pergunta: "O que eu estou sentindo agora que está me empurrando para agir?"',
            ],
            commitment: 'Em qual área específica você vai implementar uma pausa intencional esta semana?'
          },
          'Vulnerabilidade ao Estresse': {
            actions: [
              'Mapear os sinais físicos e emocionais precoces de sobrecarga',
              'Criar um "protocolo de crise" com ações concretas para cada nível de estresse',
              'Estabelecer limites não negociáveis de recuperação (sono, pausas, desconexão)',
              'Identificar e pedir o suporte específico que precisa em períodos intensos',
            ],
            commitment: 'Qual limite de recuperação você vai estabelecer e honrar esta semana?'
          },
          'Cordialidade / Calor Social': {
            actions: [
              'Praticar expressões verbais de apreciação com pessoas próximas',
              'Criar rituais de conexão intencional com pessoas importantes',
              'Aprender a linguagem de amor/apreciação das pessoas-chave na sua vida',
              'Exercitar o interesse genuíno fazendo perguntas sobre a vida dos outros',
            ],
            commitment: 'Com quem você vai praticar uma expressão de calor intencional esta semana?'
          },
          'Gregarieda de / Sociabilidade': {
            actions: [
              'Identificar o tipo de interação social que energiza versus drena',
              'Criar oportunidades de conexão em formatos que funcionam para você',
              'Praticar a presença plena em interações curtas em vez de evitá-las',
            ],
            commitment: 'Qual formato de conexão social você vai experimentar esta semana?'
          },
          'Assertividade': {
            actions: [
              'Identificar uma situação por semana para praticar se posicionar com clareza',
              'Preparar com antecedência o que quer dizer em situações de alta visibilidade',
              'Praticar o "não" em situações de baixo risco para construir o músculo',
              'Usar a fórmula: "Eu penso/sinto/quero" em vez de perguntas indiretas',
            ],
            commitment: 'Em qual situação específica você vai se posicionar com mais clareza esta semana?'
          },
          'Nível de Atividade': {
            actions: [
              'Mapear o ritmo ideal de trabalho e criar uma rotina que o respeite',
              'Identificar o que drena energia desnecessariamente e eliminar ou delegar',
              'Criar blocos de "trabalho profundo" protegidos de interrupções',
            ],
            commitment: 'Qual ajuste de ritmo você vai implementar esta semana?'
          },
          'Busca por Emoção / Excitação': {
            actions: [
              'Introduzir uma novidade calculada por semana na rotina profissional',
              'Criar um projeto paralelo que ofereça estimulação sem comprometer prioridades',
              'Explorar formas de trazer criatividade para tarefas rotineiras',
            ],
            commitment: 'Qual novidade calculada você vai introduzir esta semana?'
          },
          'Emoções Positivas': {
            actions: [
              'Criar uma prática diária de gratidão específica (não genérica)',
              'Identificar as atividades que geram mais alegria e aumentar sua frequência',
              'Mapear o que está drenando energia positiva e criar um plano de mudança',
              'Cultivar relações que energizam e reduzir exposição a relações que drenam',
            ],
            commitment: 'Qual atividade que gera alegria você vai priorizar esta semana?'
          },
          'Fantasia / Imaginação': {
            actions: [
              'Criar um tempo semanal dedicado a imaginar possibilidades sem julgamento',
              'Usar técnicas de visualização para explorar cenários futuros',
              'Documentar ideias criativas antes de avaliá-las',
            ],
            commitment: 'Que projeto imaginário você vai começar a explorar esta semana?'
          },
          'Estética / Apreciação Artística': {
            actions: [
              'Criar um ambiente de trabalho que reflita seus valores estéticos',
              'Incluir uma experiência estética intencional por semana (música, arte, natureza)',
            ],
            commitment: 'Que experiência estética você vai criar para si mesmo esta semana?'
          },
          'Sentimentos / Abertura Emocional': {
            actions: [
              'Praticar nomear emoções com precisão usando vocabulário emocional ampliado',
              'Criar espaço para processar emoções antes de agir (journaling, conversa, movimento)',
              'Explorar como as emoções informam decisões importantes',
            ],
            commitment: 'Que prática de abertura emocional você vai experimentar esta semana?'
          },
          'Ações / Abertura a Novas Experiências': {
            actions: [
              'Fazer uma coisa diferente por semana — pequena, mas fora do padrão',
              'Dizer sim para um convite que normalmente recusaria',
              'Explorar uma nova habilidade ou área de conhecimento por 30 dias',
            ],
            commitment: 'Qual nova experiência você vai tentar esta semana?'
          },
          'Ideias / Curiosidade Intelectual': {
            actions: [
              'Dedicar 20 minutos diários para explorar um tema de interesse puro',
              'Criar o hábito de fazer uma pergunta profunda por dia',
              'Conectar-se com pessoas que pensam de forma diferente',
            ],
            commitment: 'Que tema você vai explorar com curiosidade pura esta semana?'
          },
          'Valores / Abertura a Novas Perspectivas': {
            actions: [
              'Ler ou ouvir uma perspectiva radicalmente diferente da sua por semana',
              'Praticar a pergunta: "O que eu poderia estar errado sobre isso?"',
              'Conversar com alguém que discorda de você sobre um tema importante',
            ],
            commitment: 'Que perspectiva diferente você vai explorar com abertura esta semana?'
          },
          'Confiança': {
            actions: [
              'Mapear as experiências que moldaram seu nível de confiança atual',
              'Criar critérios claros para decidir em quem confiar em diferentes contextos',
              'Praticar confiança gradual em relações de baixo risco',
            ],
            commitment: 'Em qual relação você vai praticar um passo de confiança esta semana?'
          },
          'Franqueza / Honestidade': {
            actions: [
              'Praticar dar um feedback honesto e gentil por semana',
              'Identificar uma verdade que você está evitando dizer e criar um plano para entregá-la',
              'Usar a fórmula: "Posso ser honesto com você sobre algo?" para criar permissão',
            ],
            commitment: 'Qual verdade importante você vai entregar com gentileza esta semana?'
          },
          'Altruísmo': {
            actions: [
              'Praticar pedir ajuda uma vez por semana — ativamente',
              'Identificar onde está ajudando por medo e criar um limite saudável',
              'Criar uma rotina de autocuidado não negociável',
            ],
            commitment: 'Qual pedido de ajuda você vai fazer esta semana?'
          },
          'Cooperação / Conformidade': {
            actions: [
              'Identificar uma situação por semana para discordar de forma construtiva',
              'Praticar o "não" em situações de baixo risco',
              'Criar uma lista de limites não negociáveis e comunicar um deles',
              'Usar a fórmula: "Eu entendo sua perspectiva, e eu penso diferente" em vez de ceder',
            ],
            commitment: 'Em qual situação você vai se posicionar em vez de ceder esta semana?'
          },
          'Modes tia / Humildade': {
            actions: [
              'Praticar receber elogios com "obrigado" em vez de minimizar',
              'Criar o hábito de compartilhar conquistas com uma pessoa de confiança por semana',
              'Escrever uma lista de 10 coisas que você faz muito bem',
              'Praticar se apresentar com confiança em contextos profissionais',
            ],
            commitment: 'Como você vai ocupar mais espaço esta semana sem pedir desculpas por isso?'
          },
          'Sensibilidade / Empatia': {
            actions: [
              'Criar rituais de "descompresso emocional" após interações intensas',
              'Aprender técnicas de grounding para não absorver a dor dos outros',
              'Estabelecer limites de disponibilidade emocional',
              'Praticar a empatia sem assumir a responsabilidade pelo sofrimento alheio',
            ],
            commitment: 'Qual ritual de proteção emocional você vai implementar esta semana?'
          },
          'Competência / Autoeficácia': {
            actions: [
              'Criar um "banco de evidências" de competência — registrar conquistas semanalmente',
              'Identificar e desafiar a voz do impostor com fatos concretos',
              'Assumir um projeto desafiador que estique sua zona de conforto',
              'Buscar feedback positivo ativo de pessoas que observam seu trabalho',
            ],
            commitment: 'Que evidência de sua competência você vai registrar esta semana?'
          },
          'Ordem / Organização': {
            actions: [
              'Criar um sistema mínimo viável de organização para a área mais caótica',
              'Implementar uma rotina de "reset" semanal (limpar, organizar, planejar)',
              'Usar uma ferramenta simples de gestão de tarefas por 30 dias',
            ],
            commitment: 'Qual sistema de organização você vai implementar esta semana?'
          },
          'Senso de Dever / Responsabilidade': {
            actions: [
              'Mapear as responsabilidades que está carregando que não são suas',
              'Praticar delegar uma tarefa por semana sem microgerenciar',
              'Criar critérios claros para assumir novos compromissos',
            ],
            commitment: 'Qual responsabilidade você vai delegar ou soltar esta semana?'
          },
          'Busca por Realizações': {
            actions: [
              'Revisar se seus objetivos atuais são seus ou herdados de expectativas externas',
              'Criar um ritual de celebração para cada meta atingida antes de partir para a próxima',
              'Definir o que é "bom o suficiente" para projetos de médio impacto',
            ],
            commitment: 'Que conquista você vai celebrar genuinamente esta semana?'
          },
          'Autodisciplina': {
            actions: [
              'Criar um hábito-âncora: vincular a nova prática a algo já consolidado',
              'Reduzir o tamanho da ação até que seja irresistível (método 2 minutos)',
              'Eliminar fricção do ambiente para facilitar o comportamento desejado',
              'Criar um sistema de accountability com alguém de confiança',
            ],
            commitment: 'Qual hábito mínimo você vai começar esta semana?'
          },
          'Deliberação / Prudência': {
            actions: [
              'Criar critérios de decisão antecipados para os tipos de escolha mais comuns',
              'Estabelecer prazos de decisão para evitar análise infinita',
              'Praticar decisões rápidas em situações de baixo risco para treinar o músculo',
            ],
            commitment: 'Qual decisão que você está adiando você vai tomar esta semana?'
          },
        };

        return (
          <div className="mg-plan-page">
            <div className="mg-plan-header">
              <h2>🎯 Plano de Desenvolvimento</h2>
              <p>As 3 subfacetas com maior potencial de crescimento para {profile.name}</p>
            </div>

            {bottom3.map((sf, idx) => {
              const devData = DEV_ACTIONS[sf.sfName] || {
                actions: ['Explorar esta área com curiosidade e sem julgamento', 'Identificar padrões e gatilhos relacionados a esta subfaceta', 'Criar uma prática intencional de desenvolvimento por 30 dias'],
                commitment: 'Qual é uma ação concreta que você vai tomar esta semana nesta área?'
              };
              return (
                <div key={idx} className="mg-plan-card">
                  <div className="mg-plan-card-header">
                    <div className="mg-plan-rank">{idx + 1}</div>
                    <div className="mg-plan-sf-name">{sf.sfName}</div>
                    <div className="mg-plan-sf-dim">{sf.dimLabel} · Escore estimado: ~{sf.score}%</div>
                  </div>
                  <div className="mg-plan-body">
                    <p className="mg-plan-desc">{sf.sfDesc}</p>
                    <div className="mg-plan-section-title">✅ Ações concretas de desenvolvimento</div>
                    <ul className="mg-plan-actions">
                      {devData.actions.map((action, ai) => (
                        <li key={ai}>{action}</li>
                      ))}
                    </ul>
                    <div className="mg-plan-commitment">
                      <div className="mg-plan-commitment-label">📝 Compromisso da sessão</div>
                      <div style={{ fontSize: '9px', color: '#1d4ed8', marginBottom: '6px', fontStyle: 'italic' }}>{devData.commitment}</div>
                      <div className="mg-plan-commitment-line" />
                      <div className="mg-plan-commitment-line" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Seção de Análise IA — aparece apenas se a análise foi gerada */}
      {analysis && (
        <div style={{ marginTop: '24px', pageBreakBefore: 'always' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
            color: 'white',
            padding: '20px 24px',
            borderRadius: '10px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', opacity: 0.7, marginBottom: '4px' }}>ANÁLISE GERADA POR IA</div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>🤖 Análise de Mentoring Personalizada</h2>
            <p style={{ fontSize: '10px', opacity: 0.8, margin: 0 }}>Baseada no perfil Big Five de {profile.name} · Gerada em {new Date(analysis.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div style={{ background: '#f0fdf4', border: '2px solid #4ade80', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>✅ O QUE AJUDA</div>
              <p style={{ fontSize: '9px', color: '#14532d', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{analysis.ajudas}</p>
            </div>
            <div style={{ background: '#fffbeb', border: '2px solid #fbbf24', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#92400e', marginBottom: '8px' }}>🌱 OPORTUNIDADES DE CRESCIMENTO</div>
              <p style={{ fontSize: '9px', color: '#78350f', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{analysis.oportunidades}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#fef2f2', border: '2px solid #f87171', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#991b1b', marginBottom: '8px' }}>⚠️ PONTOS DE ATENÇÃO</div>
              <p style={{ fontSize: '9px', color: '#7f1d1d', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{analysis.riscos}</p>
            </div>
            <div style={{ background: '#f5f3ff', border: '2px solid #a78bfa', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#5b21b6', marginBottom: '8px' }}>🎯 SÍNTESE PARA DEVOLUTIVA</div>
              <p style={{ fontSize: '9px', color: '#4c1d95', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{analysis.sintese}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mg-footer">
        Guia de uso exclusivo da mentora — Big Five Dashboard &nbsp;·&nbsp; Gerado em {new Date().toLocaleDateString('pt-BR')}
      </div>
    </div>
  );
}
