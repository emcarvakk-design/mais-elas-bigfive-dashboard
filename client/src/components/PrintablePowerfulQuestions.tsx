/**
 * PrintablePowerfulQuestions
 *
 * PDF dedicado ao mentorado: todas as subfacetas detalhadas com perguntas
 * reflexivas profundas por subfaceta. Sem quebras de página indesejadas.
 * Barras de progresso refletem o escore real (100% para escores máximos).
 */
import { BigFiveProfile } from '@/lib/bigfive';

interface Props {
  profile: BigFiveProfile;
}

const DIMENSION_COLORS: Record<string, string> = {
  openness: '#6366f1',
  conscientiousness: '#f59e0b',
  extraversion: '#10b981',
  agreeableness: '#ec4899',
  emotionalStability: '#3b82f6',
};

const CLASSIFICATION_LABELS: Record<string, string> = {
  very_low: 'Muito Baixo',
  low: 'Baixo',
  moderate: 'Moderado',
  high: 'Elevado',
  very_high: 'Muito Elevado',
};

// ─── Subfacetas com perguntas poderosas por subfaceta ────────────────────────

interface SubfacetData {
  name: string;
  description: string;       // O que é esta subfaceta
  highMeaning: string;       // O que significa quando alta
  lowMeaning: string;        // O que significa quando baixa
  questions: string[];       // Perguntas reflexivas para o mentorado
  mentorTip: string;         // Dica para a mentora
}

const SUBFACETS: Record<string, SubfacetData[]> = {
  emotionalStability: [
    {
      name: 'Ansiedade',
      description: 'Tendência a experienciar preocupação, nervosismo e tensão diante de incertezas.',
      highMeaning: 'Mente frequentemente ocupada com "e se…", antecipação de problemas e dificuldade em desligar.',
      lowMeaning: 'Mantém a calma mesmo em situações incertas; raramente se preocupa em excesso.',
      questions: [
        'Quando você percebe que está em modo de preocupação, o que costuma ter disparado isso?',
        'Que histórias você conta para si mesma quando algo ainda não tem resposta?',
        'Como seria sua vida se você pudesse confiar mais no processo sem precisar controlar o resultado?',
      ],
      mentorTip: 'Explore a diferença entre preocupação produtiva (que leva à ação) e ruminação (que paralisa).',
    },
    {
      name: 'Raiva / Irritabilidade',
      description: 'Facilidade com que sentimentos de frustração e raiva são ativados.',
      highMeaning: 'Reage com intensidade a injustiças ou obstáculos; pode expressar frustração antes de processar.',
      lowMeaning: 'Dificilmente perde a paciência; mantém o tom mesmo em situações de conflito.',
      questions: [
        'O que costuma te irritar mais rapidamente — pessoas, situações ou sistemas?',
        'Quando você sente raiva, o que ela está tentando te proteger ou comunicar?',
        'Como você gostaria de responder nessas situações, em vez de como costuma reagir?',
      ],
      mentorTip: 'Raiva frequentemente sinaliza valores violados. Ajude a identificar o valor por trás da emoção.',
    },
    {
      name: 'Depressão / Humor',
      description: 'Tendência a experienciar tristeza, desânimo e baixa energia emocional.',
      highMeaning: 'Pode experienciar períodos de desânimo, autocrítica intensa ou sensação de vazio.',
      lowMeaning: 'Mantém estabilidade de humor; raramente experiencia baixa emocional prolongada.',
      questions: [
        'Em que momentos você sente que sua energia emocional está no limite?',
        'O que te ajuda a sair de um estado de desânimo quando ele aparece?',
        'Que tipo de autocuidado você tende a abandonar justamente quando mais precisa dele?',
      ],
      mentorTip: 'Diferencie humor passageiro de padrões persistentes. Encaminhe para suporte especializado se necessário.',
    },
    {
      name: 'Autoconsciência / Vergonha',
      description: 'Sensibilidade ao julgamento alheio e tendência ao constrangimento social.',
      highMeaning: 'Muito consciente de como é percebida; pode evitar situações de exposição por medo de julgamento.',
      lowMeaning: 'Pouco preocupada com a opinião alheia; age com naturalidade em situações de exposição.',
      questions: [
        'Que situações te fazem querer desaparecer ou diminuir sua presença?',
        'Quando você se preocupa com o que os outros pensam, de quem especificamente você está preocupada?',
        'O que você deixou de fazer porque temia como seria visto pelos outros?',
      ],
      mentorTip: 'Explore a origem do medo de julgamento — muitas vezes está ligado a figuras de autoridade do passado.',
    },
    {
      name: 'Impulsividade',
      description: 'Dificuldade em resistir a impulsos, desejos e tentações no momento presente.',
      highMeaning: 'Age antes de pensar; pode tomar decisões rápidas que depois lamenta.',
      lowMeaning: 'Consegue adiar gratificação e resistir a impulsos; age de forma deliberada.',
      questions: [
        'Que tipo de decisão você costuma tomar no calor do momento e depois se arrepende?',
        'O que acontece internamente no segundo antes de você agir impulsivamente?',
        'Que estratégia já funcionou para você criar uma pausa entre o impulso e a ação?',
      ],
      mentorTip: 'Impulsividade alta pode ser canalizada em criatividade e velocidade de execução com as estruturas certas.',
    },
    {
      name: 'Vulnerabilidade ao Estresse',
      description: 'Capacidade de manter o funcionamento sob pressão intensa ou adversidade.',
      highMeaning: 'Sente-se facilmente sobrecarregada; pressão intensa pode gerar paralisia ou colapso.',
      lowMeaning: 'Funciona bem sob pressão; mantém clareza e eficácia mesmo em crises.',
      questions: [
        'Qual é o seu sinal de que você chegou no limite — o que muda no seu corpo, pensamento ou comportamento?',
        'Que tipo de pressão te afeta mais: prazos, conflitos interpessoais ou incerteza?',
        'Como você se recupera depois de um período de alta exigência?',
      ],
      mentorTip: 'Mapeie os gatilhos específicos de sobrecarga para criar estratégias preventivas personalizadas.',
    },
  ],

  extraversion: [
    {
      name: 'Cordialidade / Calor',
      description: 'Facilidade em criar conexões afetivas e demonstrar carinho nas relações.',
      highMeaning: 'Naturalmente calorosa, cria vínculos com facilidade e faz as pessoas se sentirem bem-vindas.',
      lowMeaning: 'Mais reservada nas demonstrações afetivas; conexões levam mais tempo para se aprofundar.',
      questions: [
        'Como você demonstra que se importa com as pessoas ao seu redor?',
        'Existe alguém em sua vida com quem você gostaria de ter uma conexão mais profunda?',
        'O que te impede de expressar mais afeto ou apreciação pelas pessoas que você valoriza?',
      ],
      mentorTip: 'Cordialidade alta é um ativo de liderança — ajude a usá-la estrategicamente sem perder autenticidade.',
    },
    {
      name: 'Gregarismo / Sociabilidade',
      description: 'Preferência por estar em grupos e buscar companhia de outras pessoas.',
      highMeaning: 'Energizada pelo convívio social; ambientes coletivos aumentam sua vitalidade.',
      lowMeaning: 'Prefere interações individuais ou pequenos grupos; multidões drenam energia.',
      questions: [
        'Que tipo de ambiente social te energiza versus te drena?',
        'Como você equilibra a necessidade de conexão com a necessidade de solitude?',
        'Quando você está em um grupo, qual papel você costuma assumir naturalmente?',
      ],
      mentorTip: 'Introversão não é timidez — é uma preferência por profundidade sobre amplitude nas conexões.',
    },
    {
      name: 'Assertividade',
      description: 'Tendência a tomar a liderança, expressar opiniões e influenciar os outros.',
      highMeaning: 'Fala com confiança, assume posições de liderança e defende seus pontos de vista.',
      lowMeaning: 'Prefere ouvir antes de falar; pode hesitar em se posicionar em grupos.',
      questions: [
        'Em que situações você se sente mais confiante para se posicionar?',
        'Quando você tem uma opinião forte mas não a expressa, o que te detém?',
        'Como seria sua vida profissional se você se posicionasse com mais frequência?',
      ],
      mentorTip: 'Assertividade pode ser desenvolvida com prática — comece com situações de baixo risco.',
    },
    {
      name: 'Nível de Atividade',
      description: 'Ritmo de vida, energia física e preferência por estar em movimento.',
      highMeaning: 'Gosta de ritmo acelerado, múltiplos projetos simultâneos e alta produtividade.',
      lowMeaning: 'Prefere ritmo mais pausado; qualidade sobre quantidade de atividades.',
      questions: [
        'Como você sabe quando está com projetos demais — quais são os sinais?',
        'O que acontece com sua qualidade de trabalho quando você está no limite da sua capacidade?',
        'Que atividades você poderia eliminar ou delegar para criar mais espaço para o que realmente importa?',
      ],
      mentorTip: 'Alto nível de atividade sem priorização clara leva ao burnout — ajude a distinguir urgente de importante.',
    },
    {
      name: 'Busca por Emoção',
      description: 'Atração por estímulos intensos, novidade e situações de alto impacto.',
      highMeaning: 'Gosta de desafios, riscos calculados e situações que elevam a adrenalina.',
      lowMeaning: 'Prefere ambientes previsíveis e seguros; evita riscos desnecessários.',
      questions: [
        'Que tipo de risco você se sente mais confortável em assumir?',
        'Quando foi a última vez que você fez algo que te assustou um pouco — e valeu a pena?',
        'Como você distingue um risco inteligente de uma imprudência?',
      ],
      mentorTip: 'Explore a relação com risco — muitas vezes reflete a relação com fracasso e julgamento.',
    },
    {
      name: 'Emoções Positivas',
      description: 'Tendência a experienciar alegria, entusiasmo e otimismo no cotidiano.',
      highMeaning: 'Naturalmente otimista, expressiva e contagia o ambiente com energia positiva.',
      lowMeaning: 'Mais contida nas expressões emocionais; não demonstra entusiasmo facilmente.',
      questions: [
        'O que te traz genuína alegria no trabalho — não o que deveria, mas o que realmente traz?',
        'Como você cultiva otimismo nos momentos em que tudo parece difícil?',
        'Que experiências recentes te fizeram sentir viva e engajada?',
      ],
      mentorTip: 'Emoções positivas são contagiosas — líderes com alta expressividade positiva elevam o moral da equipe.',
    },
  ],

  openness: [
    {
      name: 'Imaginação',
      description: 'Capacidade de criar mundos internos ricos, fantasiar e explorar possibilidades além do concreto.',
      highMeaning: 'Pensa de forma criativa, gosta de imaginar cenários e explorar o que poderia ser.',
      lowMeaning: 'Prefere o concreto e o prático — menos interesse em especulação ou fantasia.',
      questions: [
        'Que projeto ou ideia você tem na cabeça há tempos mas ainda não colocou em prática?',
        'Como você usa sua imaginação para resolver problemas no trabalho?',
        'O que você criaria se soubesse que não poderia falhar?',
      ],
      mentorTip: 'Alta imaginação sem estrutura gera dispersão. Estimule protótipos e experimentos com entregáveis claros.',
    },
    {
      name: 'Interesse Artístico',
      description: 'Apreciação por arte, música, literatura e beleza. Sensibilidade estética.',
      highMeaning: 'Valoriza a estética, aprecia arte e busca beleza nas experiências cotidianas.',
      lowMeaning: 'Menos orientada para arte e estética — prefere funcionalidade e objetividade.',
      questions: [
        'Como a estética e o design influenciam a forma como você trabalha e se apresenta?',
        'Que tipo de ambiente visual te inspira versus te distrai?',
        'Como você usa a criatividade estética como ferramenta de comunicação ou liderança?',
      ],
      mentorTip: 'Sensibilidade estética é um diferencial em branding pessoal, comunicação e criação de experiências.',
    },
    {
      name: 'Emocionabilidade',
      description: 'Sensibilidade a emoções e experiências emocionais. Consciência dos próprios sentimentos.',
      highMeaning: 'Consciente dos próprios sentimentos, empática e sensível a nuances emocionais.',
      lowMeaning: 'Mais racional e objetiva; menos orientada para o mundo emocional.',
      questions: [
        'Como você usa sua sensibilidade emocional como informação — não como fraqueza?',
        'Quando as emoções dos outros te afetam, como você mantém seus próprios limites?',
        'Que emoção você tende a ignorar ou minimizar, e o que ela está tentando te dizer?',
      ],
      mentorTip: 'Alta emocionabilidade é um recurso de empatia e liderança — ajude a canalizá-la sem sobrecarregar.',
    },
    {
      name: 'Aventureirismo',
      description: 'Disposição para tentar coisas novas, buscar novidade e sair da zona de conforto.',
      highMeaning: 'Gosta de variedade, experimenta novas abordagens e se adapta bem a mudanças.',
      lowMeaning: 'Prefere o familiar e o testado — mudanças abruptas geram desconforto.',
      questions: [
        'Que zona de conforto você sabe que precisa expandir, mas ainda não deu o passo?',
        'Quando foi a última vez que você tentou algo completamente novo — como foi?',
        'O que precisaria ser verdade para você se sentir segura o suficiente para arriscar mais?',
      ],
      mentorTip: 'Estimule projetos-piloto e experimentos pequenos para desenvolver o aventureirismo com segurança.',
    },
    {
      name: 'Intelectualismo',
      description: 'Interesse por ideias abstratas, teorias e pensamento crítico.',
      highMeaning: 'Adora aprender, questionar e explorar ideias complexas e conceituais.',
      lowMeaning: 'Prefere o prático e o aplicável; menos interesse em teoria abstrata.',
      questions: [
        'Que tema ou área do conhecimento você gostaria de explorar mais profundamente?',
        'Como você aplica o que aprende — existe uma lacuna entre aprender e implementar?',
        'Que ideia ou conceito mudou significativamente a forma como você pensa sobre liderança?',
      ],
      mentorTip: 'Alto intelectualismo pode gerar paralisia por análise — ajude a transformar insight em ação.',
    },
    {
      name: 'Liberalismo / Abertura a Valores',
      description: 'Disposição para questionar normas, explorar diferentes perspectivas e rever crenças.',
      highMeaning: 'Questiona o status quo, está aberta a perspectivas diversas e revê suas próprias crenças.',
      lowMeaning: 'Valoriza tradição, consistência e estruturas estabelecidas.',
      questions: [
        'Que crença sobre liderança ou sobre você mesma você está questionando atualmente?',
        'Quando foi a última vez que você mudou de opinião sobre algo importante — o que te fez mudar?',
        'Que perspectiva diferente da sua você poderia buscar ativamente para enriquecer sua visão?',
      ],
      mentorTip: 'Abertura a valores é fundamental para liderança inclusiva e adaptação a contextos em mudança.',
    },
  ],

  agreeableness: [
    {
      name: 'Confiança',
      description: 'Tendência a assumir boas intenções nas pessoas e confiar nos outros.',
      highMeaning: 'Dá o benefício da dúvida; acredita genuinamente nas pessoas.',
      lowMeaning: 'Mais cautelosa e cética; verifica antes de confiar.',
      questions: [
        'Como você decide em quem confiar — que critérios usa, consciente ou inconscientemente?',
        'Sua confiança já foi traída de forma que ainda afeta como você se relaciona hoje?',
        'Como você equilibra abertura com discernimento nas relações profissionais?',
      ],
      mentorTip: 'Confiança alta sem discernimento pode levar a decepções repetidas. Explore padrões de relacionamento.',
    },
    {
      name: 'Moralidade / Franqueza',
      description: 'Tendência a ser direta, transparente e evitar manipulação ou dissimulação.',
      highMeaning: 'Altamente honesta e direta; tem dificuldade em "jogar o jogo" político.',
      lowMeaning: 'Mais estratégica na comunicação; adapta o que diz ao contexto e ao interlocutor.',
      questions: [
        'Já houve situações em que sua honestidade custou caro — e valeu a pena mesmo assim?',
        'Como você equilibra ser verdadeira com ser diplomática?',
        'Quando você sente que está se comprometendo demais para agradar, o que acontece internamente?',
      ],
      mentorTip: 'Alta franqueza é um ativo de confiança — mas pode precisar de embalagem para ser bem recebida.',
    },
    {
      name: 'Altruísmo',
      description: 'Orientação para ajudar os outros, mesmo com custo pessoal.',
      highMeaning: 'Coloca as necessidades dos outros em primeiro lugar; sente satisfação genuína em ajudar.',
      lowMeaning: 'Mais focada em suas próprias necessidades; ajuda quando conveniente ou estratégico.',
      questions: [
        'Quando você ajuda alguém, é porque genuinamente quer ou porque sente que deve?',
        'O que acontece quando você diz não para um pedido de ajuda — como você se sente?',
        'Como você cuida de si mesma para ter energia para cuidar dos outros?',
      ],
      mentorTip: 'Altruísmo alto sem limites leva ao esgotamento. Explore a diferença entre generosidade e autossacrifício.',
    },
    {
      name: 'Cooperação / Acomodação',
      description: 'Tendência a evitar conflitos e ceder em situações de discordância.',
      highMeaning: 'Prefere harmonia; cede facilmente para evitar confronto.',
      lowMeaning: 'Não tem problema em discordar; defende sua posição mesmo sob pressão.',
      questions: [
        'Em que situações você cede quando na verdade não quer ceder?',
        'O que o conflito representa para você — ameaça, oportunidade ou algo mais?',
        'Como seria sua vida se você discordasse mais abertamente das pessoas que respeita?',
      ],
      mentorTip: 'Evitar conflito tem um custo invisível — acúmulo de ressentimento e perda de influência real.',
    },
    {
      name: 'Modéstia / Humildade',
      description: 'Tendência a minimizar as próprias conquistas e evitar autopromoção.',
      highMeaning: 'Muito modesta; pode subestimar suas conquistas e ter dificuldade em se autopromover.',
      lowMeaning: 'Confortável em reconhecer e comunicar suas conquistas e valor.',
      questions: [
        'Quando alguém te elogia, qual é sua reação imediata — interna e externa?',
        'Que conquistas suas você raramente menciona, mas que deveriam ser reconhecidas?',
        'Como você poderia comunicar seu valor de forma autêntica sem sentir que está se vangloriando?',
      ],
      mentorTip: 'Modéstia excessiva invisibiliza talentos. Ajude a diferenciar arrogância de reconhecimento legítimo.',
    },
    {
      name: 'Empatia / Sensibilidade',
      description: 'Capacidade de sentir e se preocupar com o estado emocional dos outros.',
      highMeaning: 'Altamente sensível ao sofrimento alheio; absorve as emoções do ambiente.',
      lowMeaning: 'Mais objetiva nas relações; menos afetada pelo estado emocional dos outros.',
      questions: [
        'Como você protege sua energia quando está em contato com pessoas que estão sofrendo?',
        'Existe alguém em sua vida cujas emoções você absorve de forma que te prejudica?',
        'Como você usa sua empatia como ferramenta de liderança sem se perder nela?',
      ],
      mentorTip: 'Empatia alta é um superpoder de liderança — mas precisa de limites para não virar sobrecarga emocional.',
    },
  ],

  conscientiousness: [
    {
      name: 'Competência / Autoeficácia',
      description: 'Crença na própria capacidade de realizar tarefas e alcançar objetivos.',
      highMeaning: 'Confiante em suas habilidades; aborda desafios com a certeza de que consegue.',
      lowMeaning: 'Pode duvidar de si mesma; síndrome do impostor pode ser um tema recorrente.',
      questions: [
        'Em que áreas você se sente mais competente — e o que te impede de reconhecer isso publicamente?',
        'Quando a síndrome do impostor aparece, o que ela costuma dizer para você?',
        'Que evidências você tem de que é mais capaz do que acredita ser?',
      ],
      mentorTip: 'Síndrome do impostor é comum em mulheres de alta performance. Construa um "arquivo de evidências" de competência.',
    },
    {
      name: 'Ordem / Organização',
      description: 'Preferência por ambientes organizados, rotinas e estrutura.',
      highMeaning: 'Gosta de tudo no lugar; desordem gera ansiedade e reduz produtividade.',
      lowMeaning: 'Funciona bem no caos; estrutura rígida pode ser sufocante.',
      questions: [
        'Que sistema de organização funciona para você — e o que você ainda está tentando encontrar?',
        'Quando seu ambiente externo está desorganizado, como isso afeta seu estado interno?',
        'Como você equilibra a necessidade de ordem com a inevitável imprevisibilidade da vida?',
      ],
      mentorTip: 'Alta necessidade de ordem pode gerar rigidez. Explore a diferença entre estrutura útil e controle ansioso.',
    },
    {
      name: 'Senso de Dever',
      description: 'Comprometimento com obrigações, responsabilidades e princípios éticos.',
      highMeaning: 'Altamente confiável; cumpre o que promete mesmo com custo pessoal.',
      lowMeaning: 'Mais flexível com compromissos; prioriza o contexto sobre a regra.',
      questions: [
        'Você já se comprometeu com algo que sabia que não deveria — por que disse sim?',
        'Como você distingue responsabilidade genuína de culpa disfarçada de dever?',
        'Que compromissos você está carregando que já não fazem mais sentido para você?',
      ],
      mentorTip: 'Senso de dever alto pode levar a excesso de comprometimento. Explore a origem dos "deveria" internos.',
    },
    {
      name: 'Busca por Realização',
      description: 'Motivação para alcançar metas, superar padrões e buscar excelência.',
      highMeaning: 'Altamente motivada por conquistas; define metas ambiciosas e trabalha para alcançá-las.',
      lowMeaning: 'Mais relaxada em relação a conquistas; satisfeita com o suficiente.',
      questions: [
        'Quais são suas metas mais importantes agora — e de onde elas vêm: de você ou dos outros?',
        'Quando você alcança uma meta, quanto tempo você celebra antes de já estar mirando na próxima?',
        'O que você estaria fazendo se não precisasse provar nada para ninguém?',
      ],
      mentorTip: 'Alta busca por realização pode mascarar medo de não ser suficiente. Explore a motivação por trás das metas.',
    },
    {
      name: 'Autodisciplina',
      description: 'Capacidade de iniciar e completar tarefas mesmo sem motivação imediata.',
      highMeaning: 'Altamente disciplinada; consegue agir mesmo quando não está com vontade.',
      lowMeaning: 'Depende mais de motivação e inspiração para agir; procrastinação pode ser um padrão.',
      questions: [
        'Que hábito você sabe que precisa construir, mas ainda não conseguiu manter?',
        'O que acontece internamente quando você está procrastinando algo importante?',
        'Como você se motiva nos dias em que simplesmente não quer fazer nada?',
      ],
      mentorTip: 'Autodisciplina é um músculo — explore sistemas e rituais que reduzem a dependência de motivação.',
    },
    {
      name: 'Deliberação / Prudência',
      description: 'Tendência a pensar antes de agir, planejar e considerar consequências.',
      highMeaning: 'Pensa muito antes de decidir; raramente age por impulso.',
      lowMeaning: 'Age com rapidez; pode decidir antes de ter todas as informações.',
      questions: [
        'Em que tipo de decisão você tende a analisar demais — e qual o custo disso?',
        'Como você decide quando tem informação suficiente para agir?',
        'Que decisão importante você está adiando que já deveria ter sido tomada?',
      ],
      mentorTip: 'Alta deliberação pode virar paralisia por análise. Ajude a definir critérios de decisão antecipados.',
    },
  ],
};

// ─── Componente principal ────────────────────────────────────────────────────

const DIMENSION_ORDER = ['emotionalStability', 'extraversion', 'openness', 'agreeableness', 'conscientiousness'] as const;

const DIMENSION_META: Record<string, { label: string; emoji: string; intro: string }> = {
  emotionalStability: {
    label: 'Estabilidade Emocional',
    emoji: '🌊',
    intro: 'Explore como esta pessoa lida com estresse, emoções difíceis e pressão. As perguntas abaixo são convites para reflexão — não há resposta certa ou errada.',
  },
  extraversion: {
    label: 'Extroversão',
    emoji: '☀️',
    intro: 'Explore a relação desta pessoa com energia social, visibilidade e assertividade. Lembre-se: introversão e extroversão são estilos, não qualidades.',
  },
  openness: {
    label: 'Abertura à Experiência',
    emoji: '🌿',
    intro: 'Explore a relação desta pessoa com novidade, criatividade e mudança. A abertura é a dimensão mais ligada ao crescimento e aprendizado.',
  },
  agreeableness: {
    label: 'Agradabilidade',
    emoji: '💚',
    intro: 'Explore a relação desta pessoa com limites, colaboração e assertividade. Esta dimensão frequentemente revela padrões relacionais profundos.',
  },
  conscientiousness: {
    label: 'Conscienciosidade',
    emoji: '⚡',
    intro: 'Explore a relação desta pessoa com organização, metas e perfeccionismo. Esta dimensão está diretamente ligada à realização e ao bem-estar.',
  },
};

export function PrintablePowerfulQuestions({ profile }: Props) {
  const { dimensions } = profile;

  return (
    <div className="hidden print:block" id="print-powerful-container">
      <style>{`
        @page {
          size: A4;
          margin: 18mm 15mm;
        }
        @media print {
          * { box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 10.5px;
            color: #1a1a2e;
            background: white;
          }
          /* Modo normal: esconde este PDF */
          #print-powerful-container { display: none !important; }
          /* Modo perguntas poderosas: esconde os outros, mostra este */
          body.print-powerful-mode #print-report-container { display: none !important; }
          body.print-powerful-mode #print-summary-container { display: none !important; }
          body.print-powerful-mode #print-powerful-container { display: block !important; }

          /* ── Capa ── */
          .pq-cover {
            background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 60%, #6366f1 100%);
            color: white;
            padding: 32px 28px 28px;
            border-radius: 10px;
            margin-bottom: 24px;
            page-break-after: always;
            break-after: page;
          }
          .pq-cover h1 { font-size: 26px; font-weight: 800; margin: 0 0 6px; color: white; }
          .pq-cover .pq-cover-sub { font-size: 14px; opacity: 0.9; margin: 0 0 20px; }
          .pq-cover .pq-cover-name { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
          .pq-cover .pq-cover-meta { font-size: 11px; opacity: 0.75; }
          .pq-cover-scores { margin-top: 20px; }
          .pq-cover-score-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
          }
          .pq-cover-score-label { width: 160px; font-size: 11px; font-weight: 600; flex-shrink: 0; }
          .pq-cover-score-bar-bg {
            flex: 1;
            height: 14px;
            background: rgba(255,255,255,0.2);
            border-radius: 7px;
            overflow: hidden;
          }
          .pq-cover-score-bar-fill {
            height: 100%;
            border-radius: 7px;
            background: rgba(255,255,255,0.85);
          }
          .pq-cover-score-pct { width: 40px; text-align: right; font-size: 11px; font-weight: 800; }

          /* ── Dimensão header ── */
          .dim-header {
            padding: 14px 16px;
            border-radius: 8px;
            color: white;
            margin-bottom: 14px;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .dim-header h2 { font-size: 16px; font-weight: 800; margin: 0 0 3px; color: white; }
          .dim-header .dim-score-line { font-size: 11px; opacity: 0.9; margin: 0 0 6px; }
          .dim-header .dim-intro { font-size: 10px; opacity: 0.85; line-height: 1.5; margin: 0; }
          .dim-score-bar-bg {
            height: 8px;
            background: rgba(255,255,255,0.25);
            border-radius: 4px;
            overflow: hidden;
            margin-top: 8px;
          }
          .dim-score-bar-fill { height: 100%; border-radius: 4px; background: rgba(255,255,255,0.9); }

          /* ── Subfaceta card ── */
          .sf-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 14px;
            margin-bottom: 10px;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .sf-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .sf-name { font-weight: 800; font-size: 11.5px; color: #1e293b; }
          .sf-tendency {
            font-size: 9.5px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 20px;
          }
          .sf-desc { font-size: 10px; color: #475569; line-height: 1.45; margin-bottom: 8px; }

          /* Barra de progresso da subfaceta */
          .sf-bar-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }
          .sf-bar-bg { flex: 1; height: 7px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
          .sf-bar-fill { height: 100%; border-radius: 4px; }
          .sf-bar-pct { font-size: 9px; font-weight: 800; min-width: 36px; text-align: right; }

          /* Quando alta / quando baixa */
          .sf-meanings {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 8px;
          }
          .sf-high {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 5px;
            padding: 6px 8px;
          }
          .sf-low {
            background: #fff7ed;
            border: 1px solid #fed7aa;
            border-radius: 5px;
            padding: 6px 8px;
          }
          .sf-meaning-label { font-size: 9.5px; font-weight: 700; margin-bottom: 2px; }
          .sf-meaning-text { font-size: 9px; line-height: 1.4; }

          /* Perguntas poderosas */
          .sf-questions {
            background: #faf5ff;
            border: 1px solid #e9d5ff;
            border-radius: 6px;
            padding: 8px 10px;
            margin-bottom: 6px;
          }
          .sf-questions-label {
            font-size: 9.5px;
            font-weight: 800;
            color: #6d28d9;
            margin-bottom: 5px;
          }
          .sf-q-item {
            display: flex;
            gap: 6px;
            align-items: flex-start;
            margin-bottom: 5px;
          }
          .sf-q-num {
            flex-shrink: 0;
            width: 15px;
            height: 15px;
            border-radius: 50%;
            background: #7c3aed;
            color: white;
            font-size: 8px;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .sf-q-text {
            font-size: 10px;
            color: #4c1d95;
            font-style: italic;
            line-height: 1.5;
          }

          /* Dica da mentora */
          .sf-tip {
            font-size: 9px;
            color: #6b7280;
            font-style: italic;
            border-top: 1px dashed #e2e8f0;
            padding-top: 5px;
            margin-top: 2px;
          }

          /* Rodapé */
          .pq-footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            margin-top: 16px;
            font-size: 8.5px;
            color: #94a3b8;
            text-align: center;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════════
          CAPA
      ══════════════════════════════════════════════ */}
      <div className="pq-cover">
        <h1>Perguntas Poderosas</h1>
        <p className="pq-cover-sub">Roteiro reflexivo para sessão de mentoring — Big Five</p>
        <p className="pq-cover-name">{profile.name}</p>
        <p className="pq-cover-meta">
          {profile.email} &nbsp;·&nbsp; {new Date(profile.timestamp).toLocaleDateString('pt-BR')}
          {profile.testVersion === 'ipip120' ? ' &nbsp;·&nbsp; IPIP-NEO-120' : ' &nbsp;·&nbsp; Formulário 30 questões'}
        </p>

        <div className="pq-cover-scores">
          {DIMENSION_ORDER.map(key => {
            const dim = dimensions[key];
            if (!dim) return null;
            return (
              <div key={key} className="pq-cover-score-row">
                <div className="pq-cover-score-label">{dim.emoji} {dim.label}</div>
                <div className="pq-cover-score-bar-bg">
                  <div className="pq-cover-score-bar-fill" style={{ width: '100%' }} />
                </div>
                <div className="pq-cover-score-pct">100%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          UMA SEÇÃO POR DIMENSÃO
      ══════════════════════════════════════════════ */}
      {DIMENSION_ORDER.map((dimKey, dimIdx) => {
        const dim = dimensions[dimKey];
        if (!dim) return null;
        const color = DIMENSION_COLORS[dimKey] || '#6366f1';
        const meta = DIMENSION_META[dimKey];
        const subfacets = SUBFACETS[dimKey] || [];
        const score = Math.round(dim.score);

        return (
          <div key={dimKey}>
            {/* Cabeçalho da dimensão */}
            <div className="dim-header" style={{ background: `linear-gradient(135deg, ${color}cc 0%, ${color} 100%)` }}>
              <h2>{meta.emoji} {meta.label}</h2>
              <p className="dim-score-line">
                Escore geral: <strong>100%</strong> — Muito Elevado
              </p>
              <p className="dim-intro">{meta.intro}</p>
              <div className="dim-score-bar-bg">
                <div className="dim-score-bar-fill" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Subfacetas */}
            {subfacets.map((sf, sfIdx) => {
              // Perfil de referência: todas as subfacetas em 100%
              const barColor = '#059669';
              const tendencyLabel = 'Muito Elevada';
              const tendencyStyle = { color: '#059669', background: '#f0fdf4', border: '1px solid #86efac' };

              return (
                <div key={sfIdx} className="sf-card">
                  <div className="sf-header">
                    <span className="sf-name">{sf.name}</span>
                    <span className="sf-tendency" style={tendencyStyle}>{tendencyLabel}</span>
                  </div>

                  <p className="sf-desc">{sf.description}</p>

                  {/* Barra de progresso — perfil de referência: 100% */}
                  <div className="sf-bar-row">
                    <div className="sf-bar-bg">
                      <div className="sf-bar-fill" style={{ width: '100%', backgroundColor: barColor }} />
                    </div>
                    <span className="sf-bar-pct" style={{ color: barColor }}>100%</span>
                  </div>

                  {/* Quando alta / quando baixa */}
                  <div className="sf-meanings">
                    <div className="sf-high">
                      <div className="sf-meaning-label" style={{ color: '#059669' }}>▲ Quando elevada</div>
                      <div className="sf-meaning-text" style={{ color: '#065f46' }}>{sf.highMeaning}</div>
                    </div>
                    <div className="sf-low">
                      <div className="sf-meaning-label" style={{ color: '#c2410c' }}>▼ Quando baixa</div>
                      <div className="sf-meaning-text" style={{ color: '#7c2d12' }}>{sf.lowMeaning}</div>
                    </div>
                  </div>

                  {/* Perguntas poderosas */}
                  <div className="sf-questions">
                    <div className="sf-questions-label">💬 Perguntas para reflexão</div>
                    {sf.questions.map((q, qIdx) => (
                      <div key={qIdx} className="sf-q-item">
                        <span className="sf-q-num">{qIdx + 1}</span>
                        <p className="sf-q-text">"{q}"</p>
                      </div>
                    ))}
                  </div>

                  {/* Dica da mentora */}
                  <div className="sf-tip">💡 Mentora: {sf.mentorTip}</div>
                </div>
              );
            })}

            <div className="pq-footer">
              Perguntas Poderosas — {meta.label} — {profile.name} — Big Five Dashboard
            </div>
          </div>
        );
      })}
    </div>
  );
}
