import { BigFiveProfile } from '@/lib/bigfive';
import { getFacetsByDimension } from '@/lib/facets';
import { generateProfessionalInsights } from '@/lib/professionalInsights';

interface PrintableReportProps {
  profile: BigFiveProfile;
}

export function PrintableReport({ profile }: PrintableReportProps) {
  const { dimensions } = profile;
  const professionalInsights = generateProfessionalInsights(profile);

  return (
    <div className="hidden print:block print:bg-white print:text-black print:p-0">
      <style>{`
        @media print {
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .print-page {
            page-break-after: always;
            padding: 40px;
            min-height: 100vh;
          }
          .print-page:last-child {
            page-break-after: avoid;
          }
          h1 {
            font-size: 28px;
            margin-bottom: 10px;
            color: #1e40af;
          }
          h2 {
            font-size: 20px;
            margin-top: 30px;
            margin-bottom: 15px;
            color: #1e40af;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 5px;
          }
          h3 {
            font-size: 16px;
            margin-top: 15px;
            margin-bottom: 10px;
            color: #333;
            font-weight: 600;
          }
          p {
            margin-bottom: 10px;
            text-align: justify;
          }
          .dimension-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .dimension-box {
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
            page-break-inside: avoid;
          }
          .dimension-header {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #1e40af;
          }
          .dimension-score {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
          }
          .dimension-description {
            font-size: 12px;
            color: #666;
            margin-bottom: 10px;
          }
          .progress-bar {
            width: 100%;
            height: 8px;
            background-color: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 10px;
          }
          .progress-fill {
            height: 100%;
            background-color: #1e40af;
          }
          .facets-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 12px;
          }
          .facets-table th {
            background-color: #f3f4f6;
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            color: #1e40af;
          }
          .facets-table td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          .facets-table tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .insight-box {
            background-color: #f0f4ff;
            border-left: 4px solid #1e40af;
            padding: 12px;
            margin-bottom: 12px;
            page-break-inside: avoid;
            font-size: 13px;
          }
          .insight-title {
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
          }
          .insight-content {
            color: #333;
            line-height: 1.5;
          }
          .header-info {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #1e40af;
          }
          .header-name {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
          }
          .header-email {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
          }
          .timestamp {
            font-size: 12px;
            color: #999;
            margin-top: 10px;
          }
        }
      `}</style>

      {/* Página 1: Resumo */}
      <div className="print-page">
        <div className="header-info">
          <div className="header-name">{profile.name}</div>
          <div className="header-email">{profile.email}</div>
          <div className="timestamp">Data do teste: {new Date(profile.timestamp).toLocaleDateString('pt-BR')}</div>
        </div>

        <h2>Perfil de Personalidade Big Five</h2>
        <div className="dimension-grid">
          {Object.entries(dimensions).map(([key, dim]) => (
            <div key={key} className="dimension-box">
              <div className="dimension-header">{dim.label}</div>
              <div className="dimension-score">{dim.score}%</div>
              <div className="dimension-description">{dim.description}</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${dim.score}%` }}></div>
              </div>
            </div>
          ))}
        </div>

        <h2>Resumo Executivo</h2>
        <p>
          Este relatório apresenta uma análise detalhada do perfil de personalidade baseado no modelo Big Five, um dos
          modelos mais utilizados em psicologia e desenvolvimento profissional. O modelo avalia cinco dimensões principais
          de personalidade: Abertura à Experiência, Conscienciosidade, Extroversão, Agradabilidade e Estabilidade Emocional.
        </p>
      </div>

      {/* Página 2: Dimensões Detalhadas */}
      <div className="print-page">
        <h2>Análise Detalhada das Dimensões</h2>

        {Object.entries(dimensions).map(([key, dimension]) => {
          const facets = getFacetsByDimension(key, dimension.score);
          return (
            <div key={key} style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
              <h3>{dimension.label} ({dimension.score}%)</h3>
              <p style={{ marginBottom: '15px', fontStyle: 'italic', color: '#666' }}>{dimension.description}</p>

              <table className="facets-table">
                <thead>
                  <tr>
                    <th>Subfaceta</th>
                    <th>Score</th>
                    <th>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {facets.map((facet, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 'bold' }}>{facet.name}</td>
                      <td style={{ textAlign: 'center' }}>{facet.score}%</td>
                      <td>{facet.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {/* Página 3: Insights Profissionais */}
      <div className="print-page">
        <h2>Insights Profissionais</h2>
        <p style={{ marginBottom: '20px' }}>
          Análise do perfil sob perspectiva de desenvolvimento profissional e carreira:
        </p>

        {professionalInsights.map((insight, idx) => (
          <div key={idx} className="insight-box">
            <div className="insight-title">{insight.title}</div>
            <div className="insight-content">{insight.content}</div>
          </div>
        ))}
      </div>

      {/* Página 4: Recomendações */}
      <div className="print-page">
        <h2>Recomendações de Desenvolvimento</h2>

        {profile.recommendations.length > 0 ? (
          profile.recommendations.map((rec, idx) => (
            <div key={idx} className="insight-box">
              <div className="insight-content">{rec}</div>
            </div>
          ))
        ) : (
          <p>Nenhuma recomendação específica no momento.</p>
        )}

        <h2 style={{ marginTop: '40px' }}>Combinações de Traços Importantes</h2>
        {profile.combinationInsights.length > 0 ? (
          profile.combinationInsights.map((insight, idx) => (
            <div key={idx} className="insight-box">
              <div className="insight-content">{insight}</div>
            </div>
          ))
        ) : (
          <p>Nenhuma combinação de traços identificada.</p>
        )}

        <p style={{ marginTop: '40px', fontSize: '12px', color: '#999', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
          Relatório gerado automaticamente pelo Big Five Dashboard. Este relatório é confidencial e destinado apenas ao
          respondente e profissionais autorizados.
        </p>
      </div>
    </div>
  );
}
