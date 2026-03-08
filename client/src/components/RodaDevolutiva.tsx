/**
 * RodaDevolutiva — PDF de devolutiva pós-sessão para a mentorada
 * Tom: acolhedor, empoderador, no espírito do manifesto "O Futuro é Humano"
 * Uso: renderizado em @media print via window.print()
 */

import { useRef } from "react";
import { DIMENSOES, DIMENSAO_KEYS, getScoreLabel } from "@/lib/rodaDimensoes";

interface RodaProfile {
  name: string;
  email: string;
  area?: string | null;
  faixaEtaria?: string | null;
  scoreCarreira?: number | null;
  scoreFinanceiro?: number | null;
  scoreProposito?: number | null;
  scoreLideranca?: number | null;
  scoreRelacionamentos?: number | null;
  scoreDesenvolvimento?: number | null;
  scoreSaude?: number | null;
  scoreEquilibrio?: number | null;
  scoreReconhecimento?: number | null;
  scoreAutonomia?: number | null;
  respostaEstacao?: string | null;
  respostaDrena?: string | null;
  respostaConquista?: string | null;
  respostaObstaculo?: string | null;
  respostaLegado?: string | null;
  respostaDimensaoAtencao?: string | null;
}

interface RodaDevolutivaProps {
  profile: RodaProfile;
  aiAnalysis?: string | null;
}

function getScore(profile: RodaProfile, key: string): number | null {
  const scoreKey = `score${key.charAt(0).toUpperCase()}${key.slice(1)}` as keyof RodaProfile;
  return (profile[scoreKey] as number | null) ?? null;
}

function getScoreColor(score: number | null): string {
  if (score === null) return "#9ca3af";
  if (score >= 7) return "#2d6a4f";
  if (score >= 4) return "#b5830a";
  return "#dc2626";
}

function getScoreBarWidth(score: number | null): string {
  if (score === null) return "0%";
  return `${(score / 10) * 100}%`;
}

// Interpretações por dimensão em linguagem humana para a mentorada
const INTERPRETACOES: Record<string, { alta: string; media: string; baixa: string }> = {
  carreira: {
    alta: "Você está em um momento de alinhamento com sua trajetória. Isso é raro e valioso — significa que o caminho que você escolheu faz sentido para quem você é.",
    media: "Sua carreira está em movimento, mas algo ainda pede atenção. Pode ser o próximo passo que ainda não está claro, ou uma sensação de que você pode mais do que o ambiente permite.",
    baixa: "Sua carreira está pedindo uma pausa reflexiva. Não para desistir — mas para reconectar com o que você realmente quer construir. Às vezes, o desconforto é o primeiro sinal de uma virada importante.",
  },
  financeiro: {
    alta: "Você construiu uma base financeira que te dá liberdade para escolher. Essa segurança é fruto de decisões conscientes — e ela sustenta sua autonomia.",
    media: "Sua relação com o financeiro está em construção. Há clareza em algumas áreas, mas ainda existe espaço para estruturar mais segurança e liberdade nas suas escolhas.",
    baixa: "O financeiro está pedindo atenção — e isso não é fraqueza, é honestidade. Nomear esse ponto é o primeiro passo para transformá-lo em estratégia.",
  },
  proposito: {
    alta: "Você sabe por que faz o que faz. Esse é um dos recursos mais poderosos de uma liderança feminina — a clareza de propósito que sustenta as decisões difíceis.",
    media: "Seu propósito está presente, mas ainda em construção. Você sente que há algo maior, mas talvez ainda não tenha encontrado as palavras certas para nomear.",
    baixa: "Esse é um convite para uma conversa mais profunda consigo mesma. O propósito não precisa ser grandioso — ele precisa ser verdadeiro. E você está no caminho certo ao questionar.",
  },
  lideranca: {
    alta: "Você se reconhece como líder — e isso faz toda a diferença. Sua liderança não depende de validação externa. Ela nasce de dentro.",
    media: "Sua liderança está crescendo. Há momentos em que você se posiciona com clareza, e outros em que a dúvida aparece. Isso é humano — e faz parte do processo.",
    baixa: "A síndrome da impostora pode estar falando mais alto do que você merece ouvir. Sua capacidade de liderar existe — ela só precisa de mais espaço para se mostrar.",
  },
  relacionamentos: {
    alta: "Você cultiva relações que te sustentam e te desafiam. Isso é raro — e é um dos maiores ativos de uma liderança com propósito.",
    media: "Seus relacionamentos têm valor, mas algo ainda pede mais profundidade ou cuidado. Pode ser a qualidade das conexões, ou o tempo que você tem dado a elas.",
    baixa: "Os relacionamentos estão pedindo atenção. Às vezes, quando estamos muito focadas em entregar, nos afastamos das pessoas que mais importam. Esse é um sinal para reconectar.",
  },
  desenvolvimento: {
    alta: "Você investe em si mesma — e isso se reflete em tudo que você constrói. Seu crescimento é intencional.",
    media: "Você tem vontade de crescer, mas talvez o tempo ou os recursos ainda não estejam alinhados com essa intenção. O desejo já é o começo.",
    baixa: "Seu desenvolvimento está em pausa — e isso merece atenção. Quando paramos de crescer, começamos a sentir que estamos ficando para trás. Que pequeno passo seria possível agora?",
  },
  saude: {
    alta: "Você cuida de si mesma — e isso não é egoísmo, é estratégia. Sua saúde é a base de tudo que você constrói.",
    media: "Sua saúde está sendo cuidada em alguns aspectos, mas outros ainda pedem atenção. O corpo e a mente falam — e vale a pena ouvir.",
    baixa: "Seu corpo e sua mente estão pedindo cuidado. A exaustão normalizada é um dos maiores riscos para mulheres que lideram. Você merece se recuperar.",
  },
  equilibrio: {
    alta: "Você encontrou um ritmo que sustenta sua vida como um todo. Isso é conquista — e precisa ser protegido.",
    media: "O equilíbrio está presente em alguns momentos, mas ainda é frágil. Há áreas da vida que estão sendo negligenciadas em função de outras.",
    baixa: "A sensação de estar sempre correndo — como na rodinha do hamster — está presente. Esse é um sinal importante. Não de fraqueza, mas de que algo precisa mudar no ritmo.",
  },
  reconhecimento: {
    alta: "Você se reconhece — e isso é o mais importante. O reconhecimento externo é consequência de quem você sabe que é.",
    media: "Você entrega muito, mas talvez ainda não esteja comunicando seu valor com a clareza que merece. Ou talvez o ambiente ainda não esteja vendo o que você realmente entrega.",
    baixa: "Você está entregando mais do que está sendo visto. Isso dói — e é real. Mas a primeira mudança começa em como você mesma se vê e se posiciona.",
  },
  autonomia: {
    alta: "Você é autora da sua própria vida. Suas decisões nascem dos seus valores — não do medo de desagradar. Isso é liberdade.",
    media: "Sua autonomia está em construção. Há momentos de clareza e momentos em que a opinião dos outros ainda pesa mais do que deveria.",
    baixa: "Você ainda está aprendendo a ocupar o espaço que é seu. Estabelecer limites, fazer escolhas próprias, não precisar de permissão — isso se aprende. E você está nesse caminho.",
  },
};

function getInterpretacao(key: string, score: number | null): string {
  const interp = INTERPRETACOES[key];
  if (!interp) return "";
  if (score === null) return "";
  if (score >= 7) return interp.alta;
  if (score >= 4) return interp.media;
  return interp.baixa;
}

// Perguntas reflexivas pós-sessão por dimensão
const PERGUNTAS_POS_SESSAO: Record<string, string[]> = {
  carreira: [
    "Que passo concreto posso dar nos próximos 30 dias para me aproximar da carreira que quero?",
    "O que precisa mudar para eu me sentir mais alinhada com meu potencial?",
  ],
  financeiro: [
    "Qual é o primeiro movimento financeiro que posso fazer esta semana?",
    "O que me impede de cobrar o que meu trabalho realmente vale?",
  ],
  proposito: [
    "Se eu pudesse fazer apenas uma coisa com meu trabalho, o que seria?",
    "Que legado quero deixar — e o que estou fazendo hoje que aponta para ele?",
  ],
  lideranca: [
    "Em que situação recente eu me posicionei como líder — e o que aprendi com isso?",
    "Que decisão difícil estou adiando que precisa ser tomada?",
  ],
  relacionamentos: [
    "Quem são as pessoas que me sustentam — e quando foi a última vez que investi nessas relações?",
    "Há alguma relação que está me custando mais energia do que me dando?",
  ],
  desenvolvimento: [
    "Qual habilidade, se desenvolvida, teria o maior impacto na minha vida profissional agora?",
    "Que aprendizado desta sessão quero colocar em prática primeiro?",
  ],
  saude: [
    "Que sinal do meu corpo ou mente estou ignorando que precisa de atenção?",
    "Qual é o menor gesto de autocuidado que posso incluir na minha rotina amanhã?",
  ],
  equilibrio: [
    "O que estou sacrificando que não deveria? O que preciso proteger?",
    "Qual é o limite que preciso estabelecer — e com quem?",
  ],
  reconhecimento: [
    "Como eu me apresentaria se soubesse, sem dúvida, o valor do que entrego?",
    "Que conquista recente eu minimizei — e que merecia ser celebrada?",
  ],
  autonomia: [
    "Que decisão estou adiando porque espero permissão de alguém?",
    "Em que área da minha vida quero exercer mais autoria nos próximos meses?",
  ],
};

export function RodaDevolutiva({ profile, aiAnalysis }: RodaDevolutivaProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const scores = DIMENSAO_KEYS.map((key) => ({
    key,
    label: DIMENSOES.find((d) => d.key === key)?.label ?? key,
    emoji: DIMENSOES.find((d) => d.key === key)?.emoji ?? "",
    score: getScore(profile, key),
  }));

  const sorted = [...scores].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const topDimensoes = sorted.slice(0, 3);
  const atencaoDimensao = sorted[sorted.length - 1];

  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div ref={printRef} className="devolutiva-print" id="roda-devolutiva-print">
      <style>{`
        @media print {
          body > *:not(#roda-devolutiva-print) { display: none !important; }
          #roda-devolutiva-print { display: block !important; }
          .no-print { display: none !important; }
          @page { margin: 15mm 15mm; size: A4; }
        }
        #roda-devolutiva-print {
          display: none;
          font-family: 'Georgia', serif;
          color: #1a2e1a;
          background: #fff;
          max-width: 800px;
          margin: 0 auto;
          padding: 0;
        }
        .dev-header {
          background: linear-gradient(135deg, #1a4a2e 0%, #2d6a4f 60%, #52b788 100%);
          color: white;
          padding: 40px 48px 32px;
          position: relative;
          overflow: hidden;
        }
        .dev-header::after {
          content: '';
          position: absolute;
          bottom: -20px;
          left: 0;
          right: 0;
          height: 40px;
          background: white;
          border-radius: 50% 50% 0 0 / 100% 100% 0 0;
        }
        .dev-header-tag {
          font-family: 'Arial', sans-serif;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #b7e4c7;
          margin-bottom: 12px;
        }
        .dev-header-name {
          font-size: 32px;
          font-weight: bold;
          margin: 0 0 6px;
          line-height: 1.2;
        }
        .dev-header-sub {
          font-family: 'Arial', sans-serif;
          font-size: 13px;
          color: #b7e4c7;
          margin: 0;
        }
        .dev-header-date {
          font-family: 'Arial', sans-serif;
          font-size: 11px;
          color: #74c69d;
          margin-top: 16px;
        }
        .dev-section {
          padding: 32px 48px;
          border-bottom: 1px solid #e8f5e9;
        }
        .dev-section:last-child { border-bottom: none; }
        .dev-section-title {
          font-family: 'Arial', sans-serif;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #52b788;
          margin-bottom: 16px;
          font-weight: bold;
        }
        .dev-intro-text {
          font-size: 15px;
          line-height: 1.8;
          color: #2d3a2d;
          font-style: italic;
        }
        .dev-roda-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 8px;
        }
        .dev-dim-bar {
          margin-bottom: 4px;
        }
        .dev-dim-bar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .dev-dim-bar-label {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          font-weight: bold;
          color: #1a2e1a;
        }
        .dev-dim-bar-score {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          font-weight: bold;
        }
        .dev-dim-bar-track {
          height: 8px;
          background: #e8f5e9;
          border-radius: 4px;
          overflow: hidden;
        }
        .dev-dim-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s;
        }
        .dev-dim-badge {
          font-family: 'Arial', sans-serif;
          font-size: 9px;
          padding: 1px 6px;
          border-radius: 10px;
          font-weight: bold;
          margin-left: 6px;
        }
        .badge-saudavel { background: #d8f3dc; color: #1b4332; }
        .badge-atencao { background: #fff3cd; color: #7d5a00; }
        .badge-alerta { background: #fee2e2; color: #991b1b; }
        .dev-destaque-card {
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border-left: 4px solid #2d6a4f;
          padding: 16px 20px;
          border-radius: 0 8px 8px 0;
          margin-bottom: 12px;
        }
        .dev-destaque-card-title {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          font-weight: bold;
          color: #1b4332;
          margin-bottom: 6px;
        }
        .dev-destaque-card-text {
          font-size: 13px;
          line-height: 1.7;
          color: #2d3a2d;
        }
        .dev-atencao-card {
          background: linear-gradient(135deg, #fffbeb, #fef3c7);
          border-left: 4px solid #b5830a;
          padding: 16px 20px;
          border-radius: 0 8px 8px 0;
          margin-bottom: 12px;
        }
        .dev-atencao-card-title {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          font-weight: bold;
          color: #7d5a00;
          margin-bottom: 6px;
        }
        .dev-perguntas-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .dev-perguntas-list li {
          font-size: 14px;
          line-height: 1.7;
          color: #2d3a2d;
          padding: 10px 0 10px 20px;
          border-bottom: 1px dashed #e8f5e9;
          position: relative;
        }
        .dev-perguntas-list li::before {
          content: '→';
          position: absolute;
          left: 0;
          color: #52b788;
          font-weight: bold;
        }
        .dev-perguntas-list li:last-child { border-bottom: none; }
        .dev-resposta-block {
          background: #f8fdf9;
          border: 1px solid #e8f5e9;
          border-radius: 8px;
          padding: 14px 18px;
          margin-bottom: 12px;
        }
        .dev-resposta-label {
          font-family: 'Arial', sans-serif;
          font-size: 10px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #52b788;
          font-weight: bold;
          margin-bottom: 6px;
        }
        .dev-resposta-text {
          font-size: 13px;
          line-height: 1.7;
          color: #2d3a2d;
          font-style: italic;
        }
        .dev-ai-text {
          font-size: 13px;
          line-height: 1.8;
          color: #2d3a2d;
          white-space: pre-wrap;
        }
        .dev-footer {
          background: #1a4a2e;
          color: white;
          padding: 28px 48px;
          text-align: center;
        }
        .dev-footer-quote {
          font-size: 16px;
          font-style: italic;
          line-height: 1.7;
          color: #b7e4c7;
          margin-bottom: 12px;
        }
        .dev-footer-brand {
          font-family: 'Arial', sans-serif;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #74c69d;
        }
        .dev-manifesto-box {
          background: linear-gradient(135deg, #1a4a2e, #2d6a4f);
          color: white;
          padding: 24px 28px;
          border-radius: 8px;
          margin-top: 8px;
        }
        .dev-manifesto-text {
          font-size: 14px;
          line-height: 1.9;
          color: #d8f3dc;
          font-style: italic;
        }
        .dev-manifesto-assinatura {
          font-family: 'Arial', sans-serif;
          font-size: 11px;
          color: #74c69d;
          margin-top: 12px;
          text-align: right;
        }
        .dev-top3-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          margin-top: 8px;
        }
        .dev-top3-card {
          background: #f0fdf4;
          border: 1px solid #b7e4c7;
          border-radius: 8px;
          padding: 14px;
          text-align: center;
        }
        .dev-top3-emoji { font-size: 22px; margin-bottom: 4px; }
        .dev-top3-label {
          font-family: 'Arial', sans-serif;
          font-size: 11px;
          font-weight: bold;
          color: #1b4332;
          margin-bottom: 4px;
        }
        .dev-top3-score {
          font-size: 22px;
          font-weight: bold;
          color: #2d6a4f;
        }
        .dev-top3-interp {
          font-size: 11px;
          line-height: 1.5;
          color: #4a6741;
          margin-top: 6px;
          text-align: left;
        }
      `}</style>

      {/* CABEÇALHO */}
      <div className="dev-header">
        <p className="dev-header-tag">Mais Elas · Devolutiva Pós-Sessão</p>
        <h1 className="dev-header-name">{profile.name}</h1>
        <p className="dev-header-sub">
          {profile.area ? `${profile.area}` : ""}
          {profile.area && profile.faixaEtaria ? " · " : ""}
          {profile.faixaEtaria ? profile.faixaEtaria : ""}
        </p>
        <p className="dev-header-date">Sessão realizada em {today}</p>
      </div>

      {/* INTRODUÇÃO */}
      <div className="dev-section">
        <p className="dev-intro-text">
          Este documento é um espelho do que você trouxe para a sessão de hoje.
          Não é um diagnóstico — é um ponto de partida. Um convite para olhar com
          honestidade e cuidado para onde você está, e com clareza para onde quer ir.
          <br /><br />
          Guarde este material. Volte a ele quando precisar se reconectar com o que
          descobriu hoje.
        </p>
      </div>

      {/* RODA DA VIDA — SCORES */}
      <div className="dev-section">
        <p className="dev-section-title">Sua Roda da Vida</p>
        <div className="dev-roda-grid">
          {scores.map(({ key, label, emoji, score }) => {
            const scoreLabel = getScoreLabel(score);
            const badgeClass =
              scoreLabel === "Saudável"
                ? "badge-saudavel"
                : scoreLabel === "Atenção"
                ? "badge-atencao"
                : "badge-alerta";
            return (
              <div key={key} className="dev-dim-bar">
                <div className="dev-dim-bar-header">
                  <span className="dev-dim-bar-label">
                    {emoji} {label}
                  </span>
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <span
                      className="dev-dim-bar-score"
                      style={{ color: getScoreColor(score) }}
                    >
                      {score !== null ? score.toFixed(1) : "—"}
                    </span>
                    <span className={`dev-dim-badge ${badgeClass}`}>{scoreLabel}</span>
                  </span>
                </div>
                <div className="dev-dim-bar-track">
                  <div
                    className="dev-dim-bar-fill"
                    style={{
                      width: getScoreBarWidth(score),
                      background: getScoreColor(score),
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEUS PONTOS MAIS FORTES */}
      <div className="dev-section">
        <p className="dev-section-title">Seus Pontos de Força</p>
        <div className="dev-top3-grid">
          {topDimensoes.map(({ key, label, emoji, score }) => (
            <div key={key} className="dev-top3-card">
              <div className="dev-top3-emoji">{emoji}</div>
              <div className="dev-top3-label">{label}</div>
              <div className="dev-top3-score">{score !== null ? score.toFixed(1) : "—"}</div>
              <div className="dev-top3-interp">{getInterpretacao(key, score)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DIMENSÃO QUE PEDE ATENÇÃO */}
      {atencaoDimensao && (
        <div className="dev-section">
          <p className="dev-section-title">O Que Está Pedindo Atenção</p>
          <div className="dev-atencao-card">
            <div className="dev-atencao-card-title">
              {atencaoDimensao.emoji} {atencaoDimensao.label}{" "}
              {atencaoDimensao.score !== null
                ? `· ${atencaoDimensao.score.toFixed(1)}`
                : ""}
            </div>
            <p className="dev-destaque-card-text">
              {getInterpretacao(atencaoDimensao.key, atencaoDimensao.score)}
            </p>
          </div>
          {profile.respostaDimensaoAtencao && (
            <div className="dev-resposta-block">
              <div className="dev-resposta-label">O que você mesma identificou</div>
              <p className="dev-resposta-text">"{profile.respostaDimensaoAtencao}"</p>
            </div>
          )}
        </div>
      )}

      {/* SUAS PALAVRAS */}
      {(profile.respostaEstacao ||
        profile.respostaDrena ||
        profile.respostaConquista ||
        profile.respostaObstaculo ||
        profile.respostaLegado) && (
        <div className="dev-section">
          <p className="dev-section-title">Suas Palavras</p>
          {profile.respostaEstacao && (
            <div className="dev-resposta-block">
              <div className="dev-resposta-label">Estação da sua vida profissional</div>
              <p className="dev-resposta-text">"{profile.respostaEstacao}"</p>
            </div>
          )}
          {profile.respostaDrena && (
            <div className="dev-resposta-block">
              <div className="dev-resposta-label">O que drena e o que renova</div>
              <p className="dev-resposta-text">"{profile.respostaDrena}"</p>
            </div>
          )}
          {profile.respostaConquista && (
            <div className="dev-resposta-block">
              <div className="dev-resposta-label">Sua maior conquista recente</div>
              <p className="dev-resposta-text">"{profile.respostaConquista}"</p>
            </div>
          )}
          {profile.respostaObstaculo && (
            <div className="dev-resposta-block">
              <div className="dev-resposta-label">Seu maior obstáculo hoje</div>
              <p className="dev-resposta-text">"{profile.respostaObstaculo}"</p>
            </div>
          )}
          {profile.respostaLegado && (
            <div className="dev-resposta-block">
              <div className="dev-resposta-label">O legado que quer deixar</div>
              <p className="dev-resposta-text">"{profile.respostaLegado}"</p>
            </div>
          )}
        </div>
      )}

      {/* PERGUNTAS PARA LEVAR */}
      <div className="dev-section">
        <p className="dev-section-title">Perguntas Para Levar</p>
        <p style={{ fontSize: "13px", color: "#4a6741", marginBottom: "16px", fontStyle: "italic" }}>
          Estas perguntas nasceram do que você trouxe hoje. Não há resposta certa —
          há a sua resposta. Reserve um momento nos próximos dias para sentar com elas.
        </p>
        <ul className="dev-perguntas-list">
          {/* Perguntas da dimensão de atenção */}
          {atencaoDimensao &&
            PERGUNTAS_POS_SESSAO[atencaoDimensao.key]?.map((q, i) => (
              <li key={`atencao-${i}`}>{q}</li>
            ))}
          {/* Perguntas do ponto mais forte */}
          {topDimensoes[0] &&
            PERGUNTAS_POS_SESSAO[topDimensoes[0].key]
              ?.slice(0, 1)
              .map((q, i) => <li key={`top-${i}`}>{q}</li>)}
          {/* Pergunta universal */}
          <li>
            Qual é o menor passo possível que posso dar esta semana em direção ao que
            descobri hoje?
          </li>
        </ul>
      </div>

      {/* ANÁLISE IA (se disponível) */}
      {aiAnalysis && (
        <div className="dev-section">
          <p className="dev-section-title">Síntese da Sessão</p>
          <div className="dev-destaque-card">
            <p className="dev-ai-text">{aiAnalysis}</p>
          </div>
        </div>
      )}

      {/* MANIFESTO / MENSAGEM FINAL */}
      <div className="dev-section">
        <p className="dev-section-title">Uma Palavra Para Você</p>
        <div className="dev-manifesto-box">
          <p className="dev-manifesto-text">
            Você não precisa mais se moldar para caber.
            <br /><br />
            Liderança verdadeira nasce quando uma mulher entende quem ela é.
            Quando ela pensa com estratégia, estrutura suas decisões
            e se posiciona com consciência.
            <br /><br />
            O que você descobriu hoje é seu. Leve com você.
            <br /><br />
            <strong style={{ color: "#74c69d" }}>
              Mais Elas. Mais estratégicas. Mais estruturadas. Mais posicionadas.
            </strong>
          </p>
          <p className="dev-manifesto-assinatura">— Erica Carvalho · Mais Elas</p>
        </div>
      </div>

      {/* RODAPÉ */}
      <div className="dev-footer">
        <p className="dev-footer-quote">
          "O Futuro é Humano."
        </p>
        <p className="dev-footer-brand">Mais Elas · {today}</p>
      </div>
    </div>
  );
}

export function useDevolutivaprint() {
  const print = () => {
    const el = document.getElementById("roda-devolutiva-print");
    if (el) {
      el.style.display = "block";
      window.print();
      // Restaurar após impressão
      setTimeout(() => {
        el.style.display = "none";
      }, 1000);
    }
  };
  return { print };
}
