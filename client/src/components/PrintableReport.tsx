import { BigFiveProfile } from '@/lib/bigfive';
import { getFacetsByDimension } from '@/lib/facets';
import { generateProfessionalInsights } from '@/lib/professionalInsights';

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

export function PrintableReport({ profile }: PrintableReportProps) {
  const { dimensions } = profile;
  const professionalInsights = generateProfessionalInsights(profile);

  return (
    <div className="hidden print:block">
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

          /* ── Tabela de Facetas ── */
          .facet-section { margin-bottom: 20px; page-break-inside: avoid; }
          .facet-section-title {
            font-size: 12px;
            font-weight: 700;
            padding: 6px 10px;
            border-radius: 4px;
            color: white;
            margin-bottom: 6px;
          }
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
          <p className="subtitle">Análise baseada no modelo dos Cinco Grandes Fatores de Personalidade</p>
          <p className="meta">
            {profile.name} &nbsp;|&nbsp; {profile.email} &nbsp;|&nbsp;
            Data: {new Date(profile.timestamp).toLocaleDateString('pt-BR')}
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
          Relatório confidencial gerado pelo Big Five Dashboard — Página 1 de 4
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          PÁGINA 2 — Facetas Detalhadas
      ══════════════════════════════════════════════ */}
      <div className="print-page">
        <div className="report-header">
          <h1>Análise Detalhada das Facetas</h1>
          <p className="subtitle">{profile.name} — Subfacetas de cada dimensão</p>
        </div>

        {Object.entries(dimensions).map(([key, dimension]) => {
          const facets = getFacetsByDimension(key, dimension.score);
          const color = DIMENSION_COLORS[key] || '#6366f1';
          return (
            <div key={key} className="facet-section">
              <div className="facet-section-title" style={{ backgroundColor: color }}>
                {dimension.emoji} {dimension.label} — {Math.round(dimension.score)}% ({CLASSIFICATION_LABELS[dimension.classification]})
              </div>
              <table className="facet-table">
                <thead>
                  <tr>
                    <th style={{ width: '22%' }}>Subfaceta</th>
                    <th style={{ width: '16%' }}>Tendência</th>
                    <th style={{ width: '62%' }}>Descrição e Dica</th>
                  </tr>
                </thead>
                <tbody>
                  {facets.map((facet, idx) => {
                    const tendencyLabel = facet.tendency === 'elevada' ? '↑ Elevada' : facet.tendency === 'moderada' ? '— Moderada' : '↓ Baixa';
                    const tendencyColor = facet.tendency === 'elevada' ? '#059669' : facet.tendency === 'moderada' ? '#d97706' : '#dc2626';
                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: '600' }}>{facet.name}</td>
                        <td>
                          <span style={{ fontWeight: '700', color: tendencyColor, fontSize: '11px' }}>{tendencyLabel}</span>
                        </td>
                        <td>
                          <div>{facet.description}</div>
                          {facet.mentorNote && (
                            <div style={{ marginTop: '3px', fontSize: '10px', color: '#6b7280', fontStyle: 'italic' }}>
                              Mentoring: {facet.mentorNote}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}

        <div className="report-footer">
          Relatório confidencial gerado pelo Big Five Dashboard — Página 2 de 4
        </div>
      </div>

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
          Relatório confidencial gerado pelo Big Five Dashboard — Página 3 de 4
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
          Gerado pelo Big Five Dashboard — Página 4 de 4
        </div>
      </div>
    </div>
  );
}
