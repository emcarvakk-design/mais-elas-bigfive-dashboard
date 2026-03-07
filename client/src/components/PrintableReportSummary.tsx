import { BigFiveProfile } from '@/lib/bigfive';

interface PrintableReportSummaryProps {
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

const DIMENSION_DESCRIPTIONS: Record<string, { short: string; high: string; low: string }> = {
  emotionalStability: {
    short: 'Capacidade de manter equilíbrio emocional diante de desafios e pressões.',
    high: 'Mantém a calma sob pressão, lida bem com críticas e situações de estresse.',
    low: 'Pode experienciar mais ansiedade, preocupação ou oscilações emocionais.',
  },
  extraversion: {
    short: 'Orientação para o mundo externo, sociabilidade e busca por estimulação.',
    high: 'Energizado pelo contato social, comunicativo e assertivo em grupos.',
    low: 'Prefere ambientes tranquilos, reflexivo e seletivo nas interações sociais.',
  },
  openness: {
    short: 'Abertura a novas experiências, criatividade e pensamento abstrato.',
    high: 'Curioso, criativo e receptivo a novas ideias e perspectivas diferentes.',
    low: 'Prefere o familiar e o concreto, valoriza tradição e praticidade.',
  },
  agreeableness: {
    short: 'Orientação para a cooperação, empatia e harmonia nas relações.',
    high: 'Cooperativo, empático e focado no bem-estar coletivo.',
    low: 'Mais direto e independente, prioriza objetivos próprios quando necessário.',
  },
  conscientiousness: {
    short: 'Organização, disciplina e orientação para metas e resultados.',
    high: 'Organizado, confiável e comprometido com qualidade e planejamento.',
    low: 'Mais flexível e espontâneo, adapta-se facilmente a mudanças de planos.',
  },
};

export function PrintableReportSummary({ profile }: PrintableReportSummaryProps) {
  const { dimensions } = profile;
  const isIPIP120 = profile.testVersion === 'ipip120';

  return (
    <div className="hidden print:block" id="print-summary-container">
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
          /* Modo normal: mostra relatório completo, esconde resumo */
          #print-summary-container { display: none !important; }
          /* Modo resumo: esconde relatório completo, mostra resumo */
          body.print-summary-mode #print-report-container { display: none !important; }
          body.print-summary-mode #print-summary-container { display: block !important; }

          .print-summary-page {
            page-break-after: always;
          }
          .print-summary-page:last-child { page-break-after: avoid; }

          .report-header {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            padding: 28px 32px;
            border-radius: 10px;
            margin-bottom: 24px;
          }
          .report-header h1 { font-size: 24px; font-weight: 700; margin: 0 0 6px; color: white; }
          .report-header .subtitle { font-size: 13px; opacity: 0.85; margin: 0; }
          .report-header .meta { font-size: 11px; opacity: 0.7; margin-top: 10px; }

          .section-title {
            font-size: 14px;
            font-weight: 700;
            color: #1e3a8a;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 4px;
            margin: 20px 0 14px;
          }

          /* Gráfico de barras */
          .radar-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
          }
          .radar-label { width: 130px; font-size: 11px; font-weight: 600; color: #334155; flex-shrink: 0; }
          .radar-bar-bg { flex: 1; height: 18px; background: #f1f5f9; border-radius: 6px; overflow: hidden; }
          .radar-bar-fill { height: 100%; border-radius: 6px; display: flex; align-items: center; padding-left: 8px; }
          .radar-bar-text { font-size: 10px; font-weight: 700; color: white; }
          .radar-pct { width: 40px; text-align: right; font-size: 12px; font-weight: 800; }

          /* Cards de dimensão */
          .dim-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            margin-top: 20px;
          }
          .dim-card {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 14px 16px;
            page-break-inside: avoid;
          }
          .dim-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
          }
          .dim-name { font-weight: 700; font-size: 13px; }
          .dim-score { font-size: 22px; font-weight: 800; }
          .dim-level { font-size: 10px; color: #64748b; margin-bottom: 6px; }
          .dim-desc { font-size: 10px; color: #475569; line-height: 1.5; margin-bottom: 8px; }
          .bar-bg {
            height: 7px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
            margin: 6px 0 8px;
          }
          .bar-fill { height: 100%; border-radius: 4px; }
          .dim-when-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            margin-top: 6px;
          }
          .dim-when-high {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 5px;
            padding: 6px 8px;
          }
          .dim-when-low {
            background: #fff7ed;
            border: 1px solid #fed7aa;
            border-radius: 5px;
            padding: 6px 8px;
          }
          .dim-when-label { font-size: 9px; font-weight: 700; margin-bottom: 2px; }
          .dim-when-text { font-size: 9px; line-height: 1.4; }

          /* Rodapé */
          .report-footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            margin-top: 20px;
            font-size: 9px;
            color: #94a3b8;
            text-align: center;
          }

          /* Badge IPIP */
          .ipip-badge {
            display: inline-block;
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #6ee7b7;
            border-radius: 20px;
            padding: 2px 10px;
            font-size: 10px;
            font-weight: 700;
            margin-left: 10px;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════════
          PÁGINA 1 — Capa + Visão Geral (Resumo)
      ══════════════════════════════════════════════ */}
      <div className="print-summary-page">
        <div className="report-header">
          <h1>
            Relatório de Personalidade Big Five
            {isIPIP120 && <span className="ipip-badge">IPIP-NEO-120</span>}
          </h1>
          <p className="subtitle">
            Análise baseada no modelo dos Cinco Grandes Fatores de Personalidade
          </p>
          <p className="meta">
            {profile.name} &nbsp;|&nbsp; {profile.email} &nbsp;|&nbsp;
            Data: {new Date(profile.timestamp).toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="section-title">Escores por Dimensão</div>

        <div>
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

        <div className="report-footer">
          Relatório resumido — Página 1 de 2 &nbsp;|&nbsp; Big Five Dashboard
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          PÁGINA 2 — Cards por Dimensão (Resumo)
      ══════════════════════════════════════════════ */}
      <div className="print-summary-page">
        <div className="report-header">
          <h1>Detalhamento por Dimensão</h1>
          <p className="subtitle">{profile.name} — Visão resumida de cada fator</p>
        </div>

        <div className="dim-grid">
          {Object.entries(dimensions).map(([key, dim]) => {
            const color = DIMENSION_COLORS[key] || '#6366f1';
            const desc = DIMENSION_DESCRIPTIONS[key];
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
                {desc && (
                  <>
                    <div className="dim-desc">{desc.short}</div>
                    <div className="dim-when-grid">
                      <div className="dim-when-high">
                        <div className="dim-when-label" style={{ color: '#059669' }}>Quando elevada</div>
                        <div className="dim-when-text" style={{ color: '#065f46' }}>{desc.high}</div>
                      </div>
                      <div className="dim-when-low">
                        <div className="dim-when-label" style={{ color: '#c2410c' }}>Quando baixa</div>
                        <div className="dim-when-text" style={{ color: '#7c2d12' }}>{desc.low}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="report-footer" style={{ marginTop: '24px' }}>
          Relatório resumido confidencial — Página 2 de 2 &nbsp;|&nbsp; Big Five Dashboard
        </div>
      </div>
    </div>
  );
}
