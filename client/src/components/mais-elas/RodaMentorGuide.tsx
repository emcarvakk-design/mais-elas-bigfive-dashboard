import { DIMENSOES } from "@/lib/rodaDimensoes";

interface RodaProfile {
  id: string;
  email: string;
  name: string;
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
  respostaHabilidade?: string | null;
  respostaLegado?: string | null;
  respostaDimensaoAtencao?: string | null;
  submittedAt?: Date | string | null;
}

interface Analysis {
  ajudas?: string;
  oportunidades?: string;
  riscos?: string;
  sintese?: string;
}

interface Props {
  profile: RodaProfile;
  analysis?: Analysis | null;
}

const SCORE_KEYS: { key: string; scoreField: keyof RodaProfile }[] = [
  { key: "carreira", scoreField: "scoreCarreira" },
  { key: "financeiro", scoreField: "scoreFinanceiro" },
  { key: "proposito", scoreField: "scoreProposito" },
  { key: "lideranca", scoreField: "scoreLideranca" },
  { key: "relacionamentos", scoreField: "scoreRelacionamentos" },
  { key: "desenvolvimento", scoreField: "scoreDesenvolvimento" },
  { key: "saude", scoreField: "scoreSaude" },
  { key: "equilibrio", scoreField: "scoreEquilibrio" },
  { key: "reconhecimento", scoreField: "scoreReconhecimento" },
  { key: "autonomia", scoreField: "scoreAutonomia" },
];

function getScoreColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return "#9ca3af";
  if (score >= 7) return "#2d6a4f";
  if (score >= 4) return "#b5830a";
  return "#dc2626";
}

function getScoreLabel(score: number | null | undefined): string {
  if (score === null || score === undefined) return "—";
  if (score >= 7) return "Saudável";
  if (score >= 4) return "Atenção";
  return "Alerta";
}

export function RodaMentorGuide({ profile, analysis }: Props) {
  const printDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const scores = SCORE_KEYS.map(({ key, scoreField }) => ({
    key,
    score: profile[scoreField] as number | null,
    dim: DIMENSOES.find((d) => d.key === key)!,
  }));

  const sortedScores = [...scores].sort((a, b) => {
    const sa = a.score ?? 10;
    const sb = b.score ?? 10;
    return sa - sb;
  });

  const avgGeral =
    scores.filter((s) => s.score !== null).length > 0
      ? scores.filter((s) => s.score !== null).reduce((acc, s) => acc + (s.score ?? 0), 0) /
        scores.filter((s) => s.score !== null).length
      : null;

  const alertDims = scores.filter((s) => s.score !== null && s.score < 4);
  const attentionDims = scores.filter((s) => s.score !== null && s.score >= 4 && s.score < 7);
  const healthyDims = scores.filter((s) => s.score !== null && s.score >= 7);

  return (
    <div
      id="roda-mentor-guide-print"
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        color: "#1a1a1a",
        background: "#fff",
        maxWidth: "800px",
        margin: "0 auto",
        padding: "40px",
        fontSize: "13px",
        lineHeight: "1.6",
      }}
    >
      {/* CABEÇALHO */}
      <div
        style={{
          borderBottom: "3px solid #2d6a4f",
          paddingBottom: "20px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div style={{ fontSize: "10px", color: "#6b7280", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>
            Mais Elas · Agro Com Propósito
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: "bold", color: "#1b4332", margin: 0 }}>
            Guia da Mentora
          </h1>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0 0" }}>
            Roda da Vida Profissional · Preparação para Sessão
          </p>
        </div>
        <div style={{ textAlign: "right", fontSize: "11px", color: "#6b7280" }}>
          <div>Gerado em {printDate}</div>
          <div style={{ marginTop: "4px", color: "#2d6a4f", fontWeight: "bold" }}>Confidencial</div>
        </div>
      </div>

      {/* DADOS DA MENTORADA */}
      <div
        style={{
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "8px",
          padding: "16px 20px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#1b4332", margin: "0 0 8px" }}>
          {profile.name}
        </h2>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", fontSize: "12px", color: "#374151" }}>
          {profile.area && <span>📍 {profile.area}</span>}
          {profile.faixaEtaria && <span>🎂 {profile.faixaEtaria}</span>}
          {avgGeral !== null && (
            <span style={{ fontWeight: "bold", color: "#2d6a4f" }}>
              ⭐ Média Geral: {avgGeral.toFixed(1)}/10
            </span>
          )}
          <span style={{ color: "#dc2626" }}>⚠ {alertDims.length} em alerta</span>
          <span style={{ color: "#b5830a" }}>⚡ {attentionDims.length} com atenção</span>
          <span style={{ color: "#2d6a4f" }}>✓ {healthyDims.length} saudáveis</span>
        </div>
      </div>

      {/* PANORAMA DA RODA */}
      <h3 style={{ fontSize: "14px", fontWeight: "bold", color: "#1b4332", borderBottom: "1px solid #d1fae5", paddingBottom: "6px", marginBottom: "12px" }}>
        📊 Panorama da Roda da Vida
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "24px" }}>
        {sortedScores.map(({ key, score, dim }) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 12px",
              borderRadius: "6px",
              border: `1px solid ${score !== null && score < 4 ? "#fecaca" : score !== null && score < 7 ? "#fde68a" : "#bbf7d0"}`,
              background: score !== null && score < 4 ? "#fef2f2" : score !== null && score < 7 ? "#fffbeb" : "#f0fdf4",
            }}
          >
            <span style={{ fontSize: "16px" }}>{dim.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold", fontSize: "12px", color: "#1a1a1a" }}>{dim.label}</div>
              <div
                style={{
                  height: "6px",
                  background: "#e5e7eb",
                  borderRadius: "3px",
                  marginTop: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${((score ?? 0) / 10) * 100}%`,
                    background: getScoreColor(score),
                    borderRadius: "3px",
                  }}
                />
              </div>
            </div>
            <div style={{ textAlign: "right", minWidth: "60px" }}>
              <div style={{ fontWeight: "bold", fontSize: "14px", color: getScoreColor(score) }}>
                {score !== null ? score.toFixed(1) : "—"}
              </div>
              <div style={{ fontSize: "10px", color: "#6b7280" }}>{getScoreLabel(score)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* RESPOSTAS ABERTAS */}
      {(profile.respostaEstacao || profile.respostaDrena || profile.respostaConquista || profile.respostaObstaculo || profile.respostaHabilidade || profile.respostaLegado) && (
        <>
          <h3 style={{ fontSize: "14px", fontWeight: "bold", color: "#1b4332", borderBottom: "1px solid #d1fae5", paddingBottom: "6px", marginBottom: "12px" }}>
            💬 Voz da Mentorada
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
            {profile.respostaEstacao && (
              <div style={{ padding: "10px 14px", background: "#f9fafb", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Estação da vida profissional</div>
                <p style={{ margin: 0, fontSize: "12px", fontStyle: "italic", color: "#374151" }}>"{profile.respostaEstacao}"</p>
              </div>
            )}
            {profile.respostaDrena && (
              <div style={{ padding: "10px 14px", background: "#f9fafb", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>O que drena / renova</div>
                <p style={{ margin: 0, fontSize: "12px", fontStyle: "italic", color: "#374151" }}>"{profile.respostaDrena}"</p>
              </div>
            )}
            {profile.respostaConquista && (
              <div style={{ padding: "10px 14px", background: "#f0fdf4", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: "10px", color: "#166534", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Maior conquista recente</div>
                <p style={{ margin: 0, fontSize: "12px", fontStyle: "italic", color: "#374151" }}>"{profile.respostaConquista}"</p>
              </div>
            )}
            {profile.respostaObstaculo && (
              <div style={{ padding: "10px 14px", background: "#fef2f2", borderRadius: "6px", border: "1px solid #fecaca" }}>
                <div style={{ fontSize: "10px", color: "#991b1b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Principal obstáculo</div>
                <p style={{ margin: 0, fontSize: "12px", fontStyle: "italic", color: "#374151" }}>"{profile.respostaObstaculo}"</p>
              </div>
            )}
            {profile.respostaHabilidade && (
              <div style={{ padding: "10px 14px", background: "#eff6ff", borderRadius: "6px", border: "1px solid #bfdbfe" }}>
                <div style={{ fontSize: "10px", color: "#1e40af", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Habilidade a desenvolver</div>
                <p style={{ margin: 0, fontSize: "12px", fontStyle: "italic", color: "#374151" }}>"{profile.respostaHabilidade}"</p>
              </div>
            )}
            {profile.respostaLegado && (
              <div style={{ padding: "10px 14px", background: "#fdf4ff", borderRadius: "6px", border: "1px solid #e9d5ff" }}>
                <div style={{ fontSize: "10px", color: "#6b21a8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Legado que quer construir</div>
                <p style={{ margin: 0, fontSize: "12px", fontStyle: "italic", color: "#374151" }}>"{profile.respostaLegado}"</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ANÁLISE IA */}
      {analysis && (analysis.ajudas || analysis.sintese) && (
        <>
          <h3 style={{ fontSize: "14px", fontWeight: "bold", color: "#1b4332", borderBottom: "1px solid #d1fae5", paddingBottom: "6px", marginBottom: "12px" }}>
            ✨ Análise IA para a Sessão
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
            {analysis.ajudas && (
              <div style={{ padding: "10px 14px", background: "#f0fdf4", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                <div style={{ fontWeight: "bold", color: "#166534", fontSize: "11px", marginBottom: "6px" }}>Pontos de Apoio</div>
                <p style={{ margin: 0, fontSize: "11px", color: "#374151" }}>{analysis.ajudas}</p>
              </div>
            )}
            {analysis.oportunidades && (
              <div style={{ padding: "10px 14px", background: "#eff6ff", borderRadius: "6px", border: "1px solid #bfdbfe" }}>
                <div style={{ fontWeight: "bold", color: "#1e40af", fontSize: "11px", marginBottom: "6px" }}>Oportunidades</div>
                <p style={{ margin: 0, fontSize: "11px", color: "#374151" }}>{analysis.oportunidades}</p>
              </div>
            )}
            {analysis.riscos && (
              <div style={{ padding: "10px 14px", background: "#fffbeb", borderRadius: "6px", border: "1px solid #fde68a" }}>
                <div style={{ fontWeight: "bold", color: "#92400e", fontSize: "11px", marginBottom: "6px" }}>Pontos de Atenção</div>
                <p style={{ margin: 0, fontSize: "11px", color: "#374151" }}>{analysis.riscos}</p>
              </div>
            )}
          </div>
          {analysis.sintese && (
            <div style={{ padding: "12px 16px", background: "#f0fdf4", borderRadius: "6px", border: "2px solid #2d6a4f", marginBottom: "24px" }}>
              <div style={{ fontWeight: "bold", color: "#1b4332", fontSize: "12px", marginBottom: "6px" }}>Síntese para a Sessão</div>
              <p style={{ margin: 0, fontSize: "12px", color: "#374151" }}>{analysis.sintese}</p>
            </div>
          )}
        </>
      )}

      {/* GUIA POR DIMENSÃO — apenas as que precisam de atenção */}
      <h3 style={{ fontSize: "14px", fontWeight: "bold", color: "#1b4332", borderBottom: "1px solid #d1fae5", paddingBottom: "6px", marginBottom: "12px" }}>
        🎯 Perguntas-Chave para a Sessão
      </h3>
      <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "16px", fontStyle: "italic" }}>
        Dimensões em ordem de prioridade (menor nota primeiro). Foque nas que precisam de mais atenção.
      </p>
      {sortedScores.map(({ key, score, dim }) => (
        <div
          key={key}
          style={{
            marginBottom: "16px",
            padding: "14px 16px",
            borderRadius: "8px",
            border: `1px solid ${score !== null && score < 4 ? "#fecaca" : score !== null && score < 7 ? "#fde68a" : "#d1fae5"}`,
            background: score !== null && score < 4 ? "#fef2f2" : score !== null && score < 7 ? "#fffbeb" : "#f9fafb",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>{dim.emoji}</span>
              <div>
                <span style={{ fontWeight: "bold", fontSize: "13px", color: "#1a1a1a" }}>{dim.label}</span>
                <span style={{ fontSize: "10px", color: "#6b7280", marginLeft: "8px" }}>{dim.definicao.slice(0, 80)}...</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: "bold", fontSize: "16px", color: getScoreColor(score) }}>
                {score !== null ? score.toFixed(1) : "—"}
              </div>
              <div style={{ fontSize: "10px", color: "#6b7280" }}>{getScoreLabel(score)}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <div style={{ fontSize: "10px", fontWeight: "bold", color: "#374151", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                Perguntas para explorar
              </div>
              {dim.perguntas.map((q, i) => (
                <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "4px", fontSize: "11px", color: "#374151" }}>
                  <span style={{ color: "#2d6a4f", fontWeight: "bold", flexShrink: 0 }}>→</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: "bold", color: "#166534", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                Sinais de Saúde
              </div>
              {dim.sinaisSaude.slice(0, 3).map((s, i) => (
                <div key={i} style={{ fontSize: "10px", color: "#166534", marginBottom: "2px" }}>✓ {s}</div>
              ))}
              <div style={{ fontSize: "10px", fontWeight: "bold", color: "#991b1b", textTransform: "uppercase", letterSpacing: "1px", marginTop: "8px", marginBottom: "4px" }}>
                Sinais de Alerta
              </div>
              {dim.sinaisAlerta.slice(0, 3).map((s, i) => (
                <div key={i} style={{ fontSize: "10px", color: "#991b1b", marginBottom: "2px" }}>⚠ {s}</div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* NOTAS DA MENTORA */}
      <div style={{ marginTop: "24px", borderTop: "2px dashed #d1fae5", paddingTop: "20px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: "bold", color: "#1b4332", marginBottom: "12px" }}>
          📝 Notas da Sessão
        </h3>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ borderBottom: "1px solid #e5e7eb", marginBottom: "20px", paddingBottom: "4px" }} />
        ))}
      </div>

      {/* RODAPÉ */}
      <div style={{ marginTop: "24px", borderTop: "1px solid #e5e7eb", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#9ca3af" }}>
        <span>Mais Elas · Agro Com Propósito · @oagrocomproposito</span>
        <span>Documento confidencial — uso exclusivo da mentora</span>
      </div>
    </div>
  );
}
