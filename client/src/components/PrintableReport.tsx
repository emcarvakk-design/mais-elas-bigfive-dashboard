import { BigFiveProfile, IPIP120SubfacetScore } from '@/lib/bigfive';
import { getFacetsByDimension } from '@/lib/facets';
import { generateProfessionalInsights } from '@/lib/professionalInsights';
import { POWERFUL_QUESTIONS } from '@/lib/powerfulQuestions';

interface PrintableReportProps {
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

const DIMENSION_ORDER = ['emotionalStability', 'extraversion', 'openness', 'agreeableness', 'conscientiousness'] as const;

export function PrintableReport({ profile }: PrintableReportProps) {
  const { dimensions } = profile;
  const professionalInsights = generateProfessionalInsights(profile);
  const isIPIP120 = profile.testVersion === 'ipip120' && !!profile.ipip120Data?.subfacets?.length;
  const ipip120 = profile.ipip120Data;
  // Páginas: 1 (capa) + 5 (dimensões) + 3 (profissional, recomendações, perguntas) + 1 opcional (IPIP-120)
  const totalPages = isIPIP120 ? 10 : 9;

  return (
    <div className="hidden print:block" id="print-report-container">
      <style>{`
        @page {
          size: A4;
          margin: 20mm 15mm;
        }
        @media print {
          * { box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 11px;
            color: #1a1a2e;
            background: white;
          }
          .print-page {
            page-break-after: always;
            padding: 0;
          }
          .print-page:last-child { page-break-after: avoid; }

          /* ── Cabeçalho ── */
          .report-header {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            padding: 24px 28px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .report-header h1 { font-size: 22px; font-weight: 700; margin: 0 0 4px; color: white; }
          .report-header .subtitle { font-size: 12px; opacity: 0.85; margin: 0; }
          .report-header .meta { font-size: 11px; opacity: 0.7; margin-top: 8px; }

          /* ── Seções ── */
          .section-title {
            font-size: 14px;
            font-weight: 700;
            color: #1e3a8a;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 4px;
            margin: 20px 0 12px;
          }

          /* ── Cards de Dimensão ── */
          .dim-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 16px;
          }
          .dim-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
            page-break-inside: avoid;
          }
          .dim-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
          }
          .dim-name { font-weight: 700; font-size: 12px; }
          .dim-score { font-size: 18px; font-weight: 800; }
          .dim-level { font-size: 10px; color: #64748b; margin-bottom: 6px; }
          .dim-desc { font-size: 10px; color: #475569; line-height: 1.4; }
          .bar-bg {
            height: 6px;
            background: #e2e8f0;
            border-radius: 3px;
            overflow: hidden;
            margin: 6px 0;
          }
          .bar-fill { height: 100%; border-radius: 3px; }

          /* ── Gráfico de barras horizontal ── */
          .radar-bars { margin-bottom: 16px; }
          .radar-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }
          .radar-label { width: 120px; font-size: 10px; font-weight: 600; color: #334155; flex-shrink: 0; }
          .radar-bar-bg { flex: 1; height: 14px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
          .radar-bar-fill { height: 100%; border-radius: 4px; display: flex; align-items: center; padding-left: 6px; }
          .radar-bar-text { font-size: 9px; font-weight: 700; color: white; }
          .radar-pct { width: 36px; text-align: right; font-size: 10px; font-weight: 700; }

          /* ── Seções de Facetas ── */
          .facet-section { margin-bottom: 24px; page-break-inside: avoid; }
          .facet-section-title {
            font-size: 12px;
            font-weight: 700;
            padding: 6px 10px;
            border-radius: 4px;
            color: white;
            margin-bottom: 10px;
          }
          /* Card de cada subfaceta */
          .facet-card {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px 12px;
            margin-bottom: 8px;
            page-break-inside: avoid;
          }
          .facet-card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 4px;
          }
          .facet-card-name { font-weight: 700; font-size: 11px; color: #1e293b; }
          .facet-card-tendency {
            font-size: 10px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 20px;
            border: 1px solid;
          }
          .facet-card-desc { font-size: 10px; color: #475569; line-height: 1.4; margin-bottom: 8px; }
          .facet-when-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .facet-when-high {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 5px;
            padding: 7px 9px;
          }
          .facet-when-low {
            background: #fff7ed;
            border: 1px solid #fed7aa;
            border-radius: 5px;
            padding: 7px 9px;
          }
          .facet-when-label {
            font-size: 10px;
            font-weight: 700;
            margin-bottom: 3px;
          }
          .facet-when-text { font-size: 9px; line-height: 1.4; }
          .facet-mentor-note {
            margin-top: 6px;
            font-size: 9px;
            color: #6b7280;
            font-style: italic;
            border-top: 1px dashed #e2e8f0;
            padding-top: 5px;
          }
          /* Tabela de facetas (usada na pág. IPIP-120) */
          .facet-table { width: 100%; border-collapse: collapse; font-size: 10px; }
          .facet-table th {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 6px 8px;
            text-align: left;
            font-weight: 700;
            color: #475569;
          }
          .facet-table td { border: 1px solid #e2e8f0; padding: 6px 8px; vertical-align: top; }
          .facet-table tr:nth-child(even) td { background: #f8fafc; }
          .facet-score-bar { height: 4px; background: #e2e8f0; border-radius: 2px; margin-top: 3px; overflow: hidden; }
          .facet-score-fill { height: 100%; border-radius: 2px; }

          /* ── Insights ── */
          .insight-card {
            border-left: 3px solid #3b82f6;
            background: #f0f7ff;
            padding: 10px 12px;
            margin-bottom: 10px;
            border-radius: 0 6px 6px 0;
            page-break-inside: avoid;
          }
          .insight-title { font-weight: 700; color: #1e3a8a; font-size: 11px; margin-bottom: 4px; }
          .insight-text { color: #334155; line-height: 1.5; font-size: 10px; }

          /* ── Recomendações ── */
          .rec-card {
            border-left: 3px solid #10b981;
            background: #f0fdf4;
            padding: 8px 12px;
            margin-bottom: 8px;
            border-radius: 0 6px 6px 0;
            page-break-inside: avoid;
          }
          .combo-card {
            border-left: 3px solid #f59e0b;
            background: #fffbeb;
            padding: 8px 12px;
            margin-bottom: 8px;
            border-radius: 0 6px 6px 0;
            page-break-inside: avoid;
          }

          /* ── Perguntas Poderosas ── */
          .pq-section {
            margin-bottom: 18px;
            page-break-inside: avoid;
          }
          .pq-header {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-radius: 6px 6px 0 0;
            color: white;
            font-weight: 700;
            font-size: 12px;
          }
          .pq-body {
            border: 1px solid #e9d5ff;
            border-top: none;
            border-radius: 0 0 6px 6px;
            padding: 10px 12px;
            background: #faf5ff;
          }
          .pq-intro {
            font-size: 9px;
            color: #7c3aed;
            font-style: italic;
            margin-bottom: 8px;
            line-height: 1.4;
          }
          .pq-list { list-style: none; padding: 0; margin: 0; }
          .pq-item {
            display: flex;
            gap: 8px;
            align-items: flex-start;
            margin-bottom: 6px;
          }
          .pq-num {
            flex-shrink: 0;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #7c3aed;
            color: white;
            font-size: 9px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .pq-text {
            font-size: 10px;
            color: #4c1d95;
            font-style: italic;
            line-height: 1.5;
          }

          /* ── Rodapé ── */
          .report-footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            margin-top: 20px;
            font-size: 9px;
            color: #94a3b8;
            text-align: center;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════════
          PÁGINA 1 — Capa + Visão Geral
      ══════════════════════════════════════════════ */}
      <div className="print-page">
        <div className="report-header">
          <h1>Relatório de Personalidade Big Five</h1>
          <p className="subtitle">
            Análise baseada no modelo dos Cinco Grandes Fatores de Personalidade
            {isIPIP120 && ' — Instrumento IPIP-NEO-120'}
          </p>
          <p className="meta">
            {profile.name} &nbsp;|&nbsp; {profile.email} &nbsp;|&nbsp;
            Data: {new Date(profile.timestamp).toLocaleDateString('pt-BR')}
            {isIPIP120 && ' &nbsp;|&nbsp; IPIP-NEO-120 (120 questões)'}
          </p>
        </div>

        <div className="section-title">Visão Geral — Escores por Dimensão</div>

        {/* Gráfico de barras horizontais */}
        <div className="radar-bars">
          {Object.entries(dimensions).map(([key, dim]) => {
            const color = DIMENSION_COLORS[key] || '#6366f1';
            return (
              <div key={key} className="radar-row">
                <div className="radar-label">{dim.emoji} {dim.label}</div>
                <div className="radar-bar-bg">
                  <div
                    className="radar-bar-fill"
                    style={{ width: `${dim.score}%`, backgroundColor: color }}
                  >
                    <span className="radar-bar-text">{CLASSIFICATION_LABELS[dim.classification]}</span>
                  </div>
                </div>
                <div className="radar-pct" style={{ color }}>{Math.round(dim.score)}%</div>
              </div>
            );
          })}
        </div>

        <div className="section-title">Detalhamento por Dimensão</div>
        <div className="dim-grid">
          {Object.entries(dimensions).map(([key, dim]) => {
            const color = DIMENSION_COLORS[key] || '#6366f1';
            return (
              <div key={key} className="dim-card" style={{ borderTop: `3px solid ${color}` }}>
                <div className="dim-card-header">
                  <span className="dim-name">{dim.emoji} {dim.label}</span>
                  <span className="dim-score" style={{ color }}>{Math.round(dim.score)}%</span>
                </div>
                <div className="dim-level">{CLASSIFICATION_LABELS[dim.classification]}</div>
                <div className="bar-bg">
                  <div className="bar-fill" style={{ width: `${dim.score}%`, backgroundColor: color }} />
                </div>
                <div className="dim-desc">{dim.description}</div>
              </div>
            );
          })}
        </div>

        <div className="report-footer">
          Relatório confidencial gerado pelo Big Five Dashboard — Página 1 de {totalPages}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          PÁGINAS 2–6 — Uma página por dimensão
      ══════════════════════════════════════════════ */}
      {Object.entries(dimensions).map(([key, dimension], dimIdx) => {
        const facets = getFacetsByDimension(key, dimension.score);
        const color = DIMENSION_COLORS[key] || '#6366f1';
        const pageNum = dimIdx + 2;
        const baseScore = dimension.score;
        return (
          <div key={key} className="print-page">
            <div className="report-header" style={{ background: `linear-gradient(135deg, ${color}bb 0%, ${color} 100%)` }}>
              <h1>{dimension.emoji} {dimension.label}</h1>
              <p className="subtitle">{profile.name} — Subfacetas detalhadas</p>
              <p className="meta">
                Escore geral: {Math.round(dimension.score)}% — {CLASSIFICATION_LABELS[dimension.classification]}
                &nbsp;| Tendência estimada com base no escore da dimensão
              </p>
            </div>

            {/* Barra de escore geral da dimensão */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', marginBottom: '3px' }}>
                <span>Baixo</span><span>Moderado</span><span>Elevado</span>
              </div>
              <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${dimension.score}%`, height: '100%', backgroundColor: color, borderRadius: '5px' }} />
              </div>
            </div>

            {facets.map((facet, idx) => {
              const estimatedScore = Math.min(100, Math.max(5, Math.round(baseScore + (idx % 2 === 0 ? 2 : -2))));
              const tendencyLabel =
                facet.tendency === 'elevada' ? 'Tende a ser elevada'
                : facet.tendency === 'moderada' ? 'Tendência moderada'
                : 'Tende a ser baixa';
              const tendencyColor =
                facet.tendency === 'elevada' ? '#059669'
                : facet.tendency === 'moderada' ? '#d97706'
                : '#dc2626';
              const tendencyBg =
                facet.tendency === 'elevada' ? '#f0fdf4'
                : facet.tendency === 'moderada' ? '#fffbeb'
                : '#fef2f2';
              const tendencyBorder =
                facet.tendency === 'elevada' ? '#86efac'
                : facet.tendency === 'moderada' ? '#fde68a'
                : '#fca5a5';
              const barColor =
                facet.tendency === 'elevada' ? '#059669'
                : facet.tendency === 'moderada' ? '#d97706'
                : '#dc2626';
              return (
                <div key={idx} className="facet-card">
                  <div className="facet-card-header">
                    <span className="facet-card-name">{facet.name}</span>
                    <span
                      className="facet-card-tendency"
                      style={{ color: tendencyColor, backgroundColor: tendencyBg, borderColor: tendencyBorder }}
                    >
                      {tendencyLabel}
                    </span>
                  </div>
                  {/* Barra de progresso estimada */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ flex: 1, height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${estimatedScore}%`, height: '100%', backgroundColor: barColor, borderRadius: '3px' }} />
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: '700', color: barColor, minWidth: '36px', textAlign: 'right' }}>
                      ~{estimatedScore}%
                    </span>
                  </div>
                  <div className="facet-card-desc">{facet.description}</div>
                  <div className="facet-when-grid">
                    <div className="facet-when-high">
                      <div className="facet-when-label" style={{ color: '#059669' }}>Quando elevada</div>
                      <div className="facet-when-text" style={{ color: '#065f46' }}>{facet.highDescription}</div>
                    </div>
                    <div className="facet-when-low">
                      <div className="facet-when-label" style={{ color: '#c2410c' }}>Quando baixa</div>
                      <div className="facet-when-text" style={{ color: '#7c2d12' }}>{facet.lowDescription}</div>
                    </div>
                  </div>
                  {facet.mentorNote && (
                    <div className="facet-mentor-note">
                      💡 Mentoring: {facet.mentorNote}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="report-footer">
              Relatório confidencial gerado pelo Big Five Dashboard — Página {pageNum} de {totalPages}
            </div>
          </div>
        );
      })}

      {/* ══════════════════════════════════════════════
          PÁGINA 3 — Análise Profissional
      ══════════════════════════════════════════════ */}
      <div className="print-page">
        <div className="report-header">
          <h1>Análise Profissional e de Carreira</h1>
          <p className="subtitle">{profile.name} — Implicações para o desenvolvimento profissional</p>
        </div>

        <div className="section-title">Insights Profissionais</div>
        {professionalInsights.map((insight, idx) => (
          <div key={idx} className="insight-card">
            <div className="insight-title">{insight.title}</div>
            <div className="insight-text">{insight.content}</div>
          </div>
        ))}

        <div className="report-footer">
          Relatório confidencial gerado pelo Big Five Dashboard — Página 3 de {totalPages}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          PÁGINA 4 — Recomendações e Combinações
      ══════════════════════════════════════════════ */}
      <div className="print-page">
        <div className="report-header">
          <h1>Recomendações de Desenvolvimento</h1>
          <p className="subtitle">{profile.name} — Plano de ação e combinações de traços</p>
        </div>

        <div className="section-title">Áreas de Desenvolvimento</div>
        {profile.recommendations.length > 0 ? (
          profile.recommendations.map((rec, idx) => (
            <div key={idx} className="rec-card">
              <div className="insight-text">{rec}</div>
            </div>
          ))
        ) : (
          <p style={{ color: '#64748b', fontStyle: 'italic' }}>Nenhuma recomendação específica identificada.</p>
        )}

        <div className="section-title">Combinações de Traços Importantes</div>
        {profile.combinationInsights.length > 0 ? (
          profile.combinationInsights.map((insight, idx) => (
            <div key={idx} className="combo-card">
              <div className="insight-text">{insight}</div>
            </div>
          ))
        ) : (
          <p style={{ color: '#64748b', fontStyle: 'italic' }}>Nenhuma combinação de traços identificada.</p>
        )}

        <div className="report-footer" style={{ marginTop: '30px' }}>
          Este relatório é confidencial e destinado exclusivamente ao respondente e profissionais autorizados.
          Gerado pelo Big Five Dashboard — Página 4 de {totalPages}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          PÁGINA 5 — Perguntas Poderosas para Sessão
      ════════════════════════════════════════════ */}
      <div className="print-page">
        <div className="report-header" style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)' }}>
          <h1>Perguntas Poderosas para a Sessão</h1>
          <p className="subtitle">{profile.name} — Roteiro reflexivo por dimensão</p>
          <p className="meta">Use estas perguntas como ponto de partida para aprofundar o autoconhecimento durante a mentoria.</p>
        </div>

        {Object.entries(POWERFUL_QUESTIONS).map(([key, pq]) => {
          const dimension = dimensions[key as keyof typeof dimensions];
          const color = DIMENSION_COLORS[key] || '#7c3aed';
          return (
            <div key={key} className="pq-section">
              <div className="pq-header" style={{ background: color }}>
                {pq.emoji} {pq.label}
                {dimension && (
                  <span style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.9 }}>
                    {Math.round(dimension.score)}% — {CLASSIFICATION_LABELS[dimension.classification]}
                  </span>
                )}
              </div>
              <div className="pq-body">
                <p className="pq-intro">{pq.intro}</p>
                <ul className="pq-list">
                  {pq.questions.map((q, idx) => (
                    <li key={idx} className="pq-item">
                      <span className="pq-num">{idx + 1}</span>
                      <p className="pq-text">"{q.question}"</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}

        <div className="report-footer" style={{ marginTop: '20px' }}>
          Este relatório é confidencial e destinado exclusivamente ao respondente e profissionais autorizados.
          Gerado pelo Big Five Dashboard — Página 5 de {totalPages}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          PÁGINA 6 — Subfacetas IPIP-NEO-120
          (apenas para perfis com testVersion === 'ipip120')
      ════════════════════════════════════════════ */}
      {isIPIP120 && ipip120 && (
        <div className="print-page">
          <div className="report-header" style={{ background: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)' }}>
            <h1>Subfacetas IPIP-NEO-120</h1>
            <p className="subtitle">{profile.name} — Escores reais das 30 subfacetas do instrumento validado</p>
            <p className="meta">Instrumento: IPIP-NEO-120 (Johnson, 2014) · 120 questões · 5 dimensões × 6 subfacetas × 4 itens</p>
          </div>

          {DIMENSION_ORDER.map(dimKey => {
            const dimSubfacets = ipip120.subfacets.filter((s: IPIP120SubfacetScore) => s.dimension === dimKey);
            const dim = dimensions[dimKey];
            const color = DIMENSION_COLORS[dimKey] || '#10b981';
            if (!dim || dimSubfacets.length === 0) return null;
            const dimScore = (ipip120 as any)[dimKey] ?? dim.score;
            return (
              <div key={dimKey} className="facet-section">
                <div className="facet-section-title" style={{ backgroundColor: color }}>
                  {dim.emoji} {dim.label} — Escore Geral: {Math.round(dimScore)}%
                </div>
                <table className="facet-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30%' }}>Subfaceta</th>
                      <th style={{ width: '14%' }}>Escore</th>
                      <th style={{ width: '56%' }}>Barra de Progresso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dimSubfacets.map((s: IPIP120SubfacetScore, idx: number) => {
                      const barColor = s.score >= 70 ? '#10b981' : s.score >= 40 ? '#f59e0b' : '#ef4444';
                      const levelLabel = s.score >= 70 ? 'Elevado' : s.score >= 40 ? 'Moderado' : 'Baixo';
                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: '600' }}>{s.label}</td>
                          <td>
                            <span style={{ fontWeight: '800', color: barColor, fontSize: '13px' }}>{s.score}%</span>
                            <div style={{ fontSize: '9px', color: barColor }}>{levelLabel}</div>
                          </td>
                          <td>
                            <div className="bar-bg" style={{ height: '10px' }}>
                              <div className="bar-fill" style={{ width: `${s.score}%`, backgroundColor: barColor, height: '100%' }} />
                            </div>
                            <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
                              Escore bruto: {s.rawScore}/20
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}

          <div className="report-footer" style={{ marginTop: '20px' }}>
            Este relatório é confidencial e destinado exclusivamente ao respondente e profissionais autorizados.
            Gerado pelo Big Five Dashboard — Página 6 de 6
          </div>
        </div>
      )}
    </div>
  );
}
