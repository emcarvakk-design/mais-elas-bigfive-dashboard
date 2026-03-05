import { useState } from 'react';
import { BigFiveProfile } from '@/lib/bigfive';
import { generateProfessionalInsights } from '@/lib/professionalInsights';
import { getFacetsByDimension } from '@/lib/facets';

// Gera HTML completo de um relatório para um perfil
function generateReportHTML(profile: BigFiveProfile): string {
  const insights = generateProfessionalInsights(profile);
  const dimensions = [
    { key: 'openness', dim: profile.dimensions.openness },
    { key: 'conscientiousness', dim: profile.dimensions.conscientiousness },
    { key: 'extraversion', dim: profile.dimensions.extraversion },
    { key: 'agreeableness', dim: profile.dimensions.agreeableness },
    { key: 'emotionalStability', dim: profile.dimensions.emotionalStability },
  ];

  const classLabel: Record<string, string> = {
    very_low: 'Muito Baixo',
    low: 'Baixo',
    moderate: 'Moderado',
    high: 'Elevado',
    very_high: 'Muito Elevado',
  };

  const scoreColor = (score: number) => {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const dimensionsHTML = dimensions.map(({ key, dim }) => {
    const facets = getFacetsByDimension(key, dim.score);
    const facetsHTML = facets.map(f => `
      <tr>
        <td style="padding:6px 8px;font-size:12px;color:#374151;">${f.name}</td>
        <td style="padding:6px 8px;text-align:center;">
          <div style="background:#e5e7eb;border-radius:4px;height:8px;width:100%;max-width:120px;margin:0 auto;">
            <div style="background:${scoreColor(f.score)};height:8px;border-radius:4px;width:${f.score}%;"></div>
          </div>
        </td>
        <td style="padding:6px 8px;text-align:center;font-weight:600;font-size:12px;color:${scoreColor(f.score)};">${Math.round(f.score)}%</td>
        <td style="padding:6px 8px;font-size:11px;color:#6b7280;">${f.description.substring(0, 80)}...</td>
      </tr>
    `).join('');

    return `
      <div style="margin-bottom:24px;page-break-inside:avoid;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding:10px 14px;background:#f8fafc;border-radius:8px;border-left:4px solid ${scoreColor(dim.score)};">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:20px;">${dim.emoji}</span>
            <span style="font-weight:700;font-size:15px;color:#1e293b;">${dim.label}</span>
          </div>
          <div style="text-align:right;">
            <span style="font-size:22px;font-weight:800;color:${scoreColor(dim.score)};">${Math.round(dim.score)}%</span>
            <span style="display:block;font-size:11px;color:#64748b;">${classLabel[dim.classification]}</span>
          </div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-family:sans-serif;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="padding:6px 8px;text-align:left;font-size:11px;color:#64748b;font-weight:600;">Faceta</th>
              <th style="padding:6px 8px;text-align:center;font-size:11px;color:#64748b;font-weight:600;">Score</th>
              <th style="padding:6px 8px;text-align:center;font-size:11px;color:#64748b;font-weight:600;">%</th>
              <th style="padding:6px 8px;text-align:left;font-size:11px;color:#64748b;font-weight:600;">Descrição</th>
            </tr>
          </thead>
          <tbody>${facetsHTML}</tbody>
        </table>
      </div>
    `;
  }).join('');

  const insightsHTML = insights.map(ins => `
    <div style="margin-bottom:12px;padding:12px;background:#f8fafc;border-radius:8px;border-left:3px solid #6366f1;">
      <p style="font-weight:700;font-size:13px;color:#1e293b;margin:0 0 4px 0;">${ins.title}</p>
      <p style="font-size:12px;color:#374151;margin:0;">${ins.content}</p>
    </div>
  `).join('');

  const recommendationsHTML = profile.recommendations.map(r => `
    <li style="font-size:12px;color:#374151;margin-bottom:6px;padding-left:4px;">${r}</li>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório Big Five — ${profile.name}</title>
  <style>
    @page { margin: 20mm; size: A4; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; margin: 0; padding: 0; }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  <!-- Cabeçalho -->
  <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:28px 32px;border-radius:12px;margin-bottom:28px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <p style="margin:0 0 4px 0;font-size:12px;opacity:0.8;text-transform:uppercase;letter-spacing:1px;">Relatório de Personalidade</p>
        <h1 style="margin:0 0 6px 0;font-size:26px;font-weight:800;">${profile.name}</h1>
        <p style="margin:0;font-size:13px;opacity:0.85;">${profile.email}</p>
      </div>
      <div style="text-align:right;">
        <p style="margin:0;font-size:11px;opacity:0.75;">Big Five — Modelo dos Cinco Grandes Fatores</p>
        <p style="margin:4px 0 0 0;font-size:11px;opacity:0.75;">${new Date(profile.timestamp).toLocaleDateString('pt-BR')}</p>
      </div>
    </div>
  </div>

  <!-- Resumo dos Escores -->
  <h2 style="font-size:16px;font-weight:700;margin:0 0 14px 0;color:#1e293b;">Resumo dos Escores</h2>
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:28px;">
    ${dimensions.map(({ dim }) => `
      <div style="text-align:center;padding:14px 8px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
        <div style="font-size:22px;margin-bottom:4px;">${dim.emoji}</div>
        <div style="font-size:20px;font-weight:800;color:${scoreColor(dim.score)};">${Math.round(dim.score)}%</div>
        <div style="font-size:10px;color:#64748b;margin-top:2px;">${dim.label}</div>
        <div style="font-size:10px;font-weight:600;color:${scoreColor(dim.score)};margin-top:2px;">${classLabel[dim.classification]}</div>
      </div>
    `).join('')}
  </div>

  <!-- Análise por Dimensão e Facetas -->
  <h2 style="font-size:16px;font-weight:700;margin:0 0 16px 0;color:#1e293b;">Análise Detalhada por Dimensão</h2>
  ${dimensionsHTML}

  <!-- Insights Profissionais -->
  <div style="page-break-before:always;padding-top:8px;">
    <h2 style="font-size:16px;font-weight:700;margin:0 0 16px 0;color:#1e293b;">Insights Profissionais</h2>
    ${insightsHTML}
    
    <h2 style="font-size:16px;font-weight:700;margin:24px 0 12px 0;color:#1e293b;">Recomendações de Desenvolvimento</h2>
    <ul style="padding-left:16px;margin:0;">${recommendationsHTML}</ul>
  </div>

  <!-- Rodapé -->
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="font-size:10px;color:#94a3b8;margin:0;">
      Relatório gerado pelo Big Five Dashboard • Baseado no Modelo dos Cinco Grandes Fatores de Personalidade
    </p>
  </div>
</body>
</html>`;
}

export function useBatchExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const exportAllPDFs = async (profiles: BigFiveProfile[]) => {
    if (profiles.length === 0) return;
    setIsExporting(true);
    setProgress(0);

    try {
      // Para cada perfil, abre uma janela de impressão sequencial
      // Usamos uma abordagem de download de HTML individual por limitações do browser
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      for (let i = 0; i < profiles.length; i++) {
        const profile = profiles[i];
        const html = generateReportHTML(profile);
        const fileName = `${profile.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}_BigFive.html`;
        zip.file(fileName, html);
        setProgress(Math.round(((i + 1) / profiles.length) * 100));
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BigFive_Relatorios_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  const exportSinglePDF = (profile: BigFiveProfile) => {
    const html = generateReportHTML(profile);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 800);
    }
  };

  return { exportAllPDFs, exportSinglePDF, isExporting, progress };
}
