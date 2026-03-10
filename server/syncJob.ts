/**
 * syncJob.ts — Sincronização automática diária das planilhas Google Sheets
 *
 * Executa às 06:00 horário de Brasília (UTC-3 = 09:00 UTC)
 * Também pode ser acionado manualmente via endpoint /api/sync-now
 *
 * Replica a lógica de parsing do cliente (useFileUpload + ipip120.ts + bigfive.ts)
 * para rodar 100% no servidor, sem dependência do browser.
 */

import cron from 'node-cron';
import { upsertBigfiveProfile } from './db';
import { notifyOwner } from './_core/notification';

// ─── Helpers de parsing CSV ───────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// ─── Lógica Big Five (30 questões) ───────────────────────────────────────────

const REVERSE_QUESTIONS_30 = new Set([2, 4, 8, 10, 14, 16, 19, 21, 23, 24, 25, 27, 29]);
const DIMENSION_QUESTIONS_30 = {
  openness: [0, 1, 2, 3, 4, 5],
  conscientiousness: [6, 7, 8, 9, 10, 11],
  extraversion: [12, 13, 14, 15, 16, 17],
  agreeableness: [18, 19, 20, 21, 22, 23],
  emotionalStability: [24, 25, 26, 27, 28, 29],
};

function getClassification(score: number) {
  if (score <= 30) return 'very_low' as const;
  if (score <= 59) return 'low' as const;
  if (score <= 79) return 'moderate' as const;
  if (score <= 89) return 'high' as const;
  return 'very_high' as const;
}

function getDescription(dim: string, score: number): string {
  if (dim === 'openness') {
    if (score >= 80) return 'Pensamento inovador e criativo — facilidade para lidar com mudanças e visão sistêmica.';
    if (score >= 60) return 'Boa abertura para novas ideias e aprendizado contínuo.';
    if (score >= 40) return 'Equilíbrio entre inovação e estabilidade — adapta-se conforme o contexto.';
    if (score >= 20) return 'Preferência por estabilidade e rotina — valoriza o que já funciona.';
    return 'Foco no concreto e no prático — resistência a mudanças abruptas.';
  }
  if (dim === 'conscientiousness') {
    if (score >= 80) return 'Alta organização, foco e confiabilidade — atenção a detalhes e cumprimento de prazos.';
    if (score >= 60) return 'Boa organização e comprometimento com metas e responsabilidades.';
    if (score >= 40) return 'Equilíbrio entre organização e espontaneidade — adapta planejamento ao contexto.';
    if (score >= 20) return 'Maior espontaneidade e flexibilidade — pode procrastinar em rotinas rígidas.';
    return 'Preferência por liberdade e fluxo — dificuldade com estruturas muito rígidas.';
  }
  if (dim === 'extraversion') {
    if (score >= 80) return 'Energizada pelo contato social — comunicativa, assertiva e com presença marcante.';
    if (score >= 60) return 'Comunicativa e confortável socialmente — boa capacidade de networking.';
    if (score >= 40) return 'Ambivertida — confortável tanto em ambientes sociais quanto no trabalho focado.';
    if (score >= 20) return 'Prefere conexões profundas — processa antes de falar, comunicação reflexiva.';
    return 'Recarrega na solidão — liderança silenciosa, excelente escutadora e analítica.';
  }
  if (dim === 'agreeableness') {
    if (score >= 80) return 'Alta empatia e colaboração — constrói vínculos de confiança com facilidade.';
    if (score >= 60) return 'Colaborativa e empática — valoriza harmonia e trabalho em equipe.';
    if (score >= 40) return 'Equilíbrio entre colaboração e assertividade — adapta-se ao contexto relacional.';
    if (score >= 20) return 'Direta e objetiva — menor tolerância a ineficiência, diz não com facilidade.';
    return 'Altamente assertiva e orientada a resultados — liderança direta e competitiva.';
  }
  // emotionalStability
  if (score >= 80) return 'Estabilidade emocional elevada — resiliente, difícil de desestabilizar sob pressão.';
  if (score >= 60) return 'Boa resiliência — lida bem com adversidades e mantém clareza em crises.';
  if (score >= 40) return 'Equilíbrio emocional moderado — experimenta variações de humor conforme o contexto.';
  if (score >= 20) return 'Maior sensibilidade emocional — tende a se preocupar e reagir intensamente ao estresse.';
  return 'Alta reatividade emocional — humor variável, mais propensa a burnout em ambientes de pressão.';
}

function calculateBigFiveScore(responses: number[]) {
  const normalized = responses.map((r, i) =>
    REVERSE_QUESTIONS_30.has(i) ? 6 - r : r
  );
  const calcScore = (indices: number[]) => {
    const sum = indices.reduce((acc, idx) => acc + normalized[idx], 0);
    return Math.round((sum / indices.length / 5) * 100);
  };

  const dims = {
    openness: calcScore(DIMENSION_QUESTIONS_30.openness),
    conscientiousness: calcScore(DIMENSION_QUESTIONS_30.conscientiousness),
    extraversion: calcScore(DIMENSION_QUESTIONS_30.extraversion),
    agreeableness: calcScore(DIMENSION_QUESTIONS_30.agreeableness),
    emotionalStability: calcScore(DIMENSION_QUESTIONS_30.emotionalStability),
  };

  return {
    openness: { name: 'Abertura à Experiência', label: 'Abertura à Experiência', emoji: '🌿', score: dims.openness, classification: getClassification(dims.openness), description: getDescription('openness', dims.openness) },
    conscientiousness: { name: 'Conscienciosidade', label: 'Conscienciosidade', emoji: '⚡', score: dims.conscientiousness, classification: getClassification(dims.conscientiousness), description: getDescription('conscientiousness', dims.conscientiousness) },
    extraversion: { name: 'Extroversão', label: 'Extroversão', emoji: '☀️', score: dims.extraversion, classification: getClassification(dims.extraversion), description: getDescription('extraversion', dims.extraversion) },
    agreeableness: { name: 'Agradabilidade', label: 'Agradabilidade', emoji: '💚', score: dims.agreeableness, classification: getClassification(dims.agreeableness), description: getDescription('agreeableness', dims.agreeableness) },
    emotionalStability: { name: 'Estabilidade Emocional', label: 'Estabilidade Emocional', emoji: '🌊', score: dims.emotionalStability, classification: getClassification(dims.emotionalStability), description: getDescription('emotionalStability', dims.emotionalStability) },
  };
}

function generateCombinationInsights(dimensions: ReturnType<typeof calculateBigFiveScore>): string[] {
  const insights: string[] = [];
  const { openness, conscientiousness, extraversion, agreeableness, emotionalStability } = dimensions;
  if (conscientiousness.score >= 80 && emotionalStability.score <= 40) insights.push('⚠️ Perfeccionismo crônico + risco de burnout. Trabalhe autocompaixão e limites saudáveis.');
  if (agreeableness.score >= 80 && extraversion.score <= 40) insights.push('🤝 Liderança servidora e discreta. Pode ser invisível — trabalhe posicionamento e visibilidade.');
  if (openness.score >= 80 && conscientiousness.score <= 40) insights.push('💡 Criativa mas com dificuldade de execução. Precisa de estrutura e método para transformar ideias em resultados.');
  if (agreeableness.score <= 40 && extraversion.score >= 80) insights.push('🎯 Liderança assertiva e direta. Pode ser percebida como agressiva — trabalhe escuta ativa.');
  if (emotionalStability.score <= 40 && conscientiousness.score <= 40) insights.push('🆘 Vulnerabilidade emocional + desorganização. Ponto crítico de atenção — priorize suporte e estrutura.');
  if (extraversion.score >= 80 && openness.score >= 80) insights.push('🚀 Perfil empreendedor forte — inovadora, comunicativa e aberta a riscos.');
  if (conscientiousness.score >= 80 && openness.score >= 80) insights.push('✨ Inovadora Confiável — combina criatividade com execução disciplinada.');
  if (agreeableness.score >= 80) insights.push('💛 Alta agradabilidade: atenção à dificuldade em estabelecer limites e dizer não.');
  if (emotionalStability.score >= 80) insights.push('🧘 Estabilidade emocional como ativo de liderança — fortaleza em ambientes voláteis e de alta pressão.');
  return insights;
}

function emailToId30(email: string): string {
  const normalized = email.trim().toLowerCase();
  return Buffer.from(normalized).toString('base64').replace(/[+/=]/g, c => ({ '+': '-', '/': '_', '=': '' }[c] ?? c));
}

// ─── Lógica IPIP-120 ──────────────────────────────────────────────────────────

// Mapeamento: posição na planilha → posição sequencial Q1-Q120
// O novo formulário agrupa as questões em blocos sequenciais por dimensão:
// Parte 1: Estabilidade Emocional (N) — colunas 0-23  → questões Q1,Q6,Q11,...,Q116 (idx 0,5,10,...,115)
// Parte 2: Extroversão (E)           — colunas 24-47 → questões Q2,Q7,Q12,...,Q117 (idx 1,6,11,...,116)
// Parte 3: Abertura (O)              — colunas 48-71 → questões Q3,Q8,Q13,...,Q118 (idx 2,7,12,...,117)
// Parte 4: Conscienciosidade (C)     — colunas 72-95 → questões Q5,Q10,Q15,...,Q120 (idx 4,9,14,...,119)
// Parte 5: Agradabilidade (A)        — colunas 96-119→ questões Q4,Q9,Q14,...,Q119 (idx 3,8,13,...,118)
// Dentro de cada bloco, as questões são agrupadas por subfaceta (4 questões cada)
const COLUMN_ORDER: number[] = (() => {
  const order = new Array(120).fill(0);
  // Dimensão N (Estabilidade Emocional): questões Q1,Q6,Q11,...,Q116 (idx 0,5,10,...,115)
  const N_qs = Array.from({ length: 24 }, (_, i) => i * 5);
  // Dimensão E (Extroversão): questões Q2,Q7,Q12,...,Q117 (idx 1,6,11,...,116)
  const E_qs = Array.from({ length: 24 }, (_, i) => i * 5 + 1);
  // Dimensão O (Abertura): questões Q3,Q8,Q13,...,Q118 (idx 2,7,12,...,117)
  const O_qs = Array.from({ length: 24 }, (_, i) => i * 5 + 2);
  // Dimensão C (Conscienciosidade): questões Q5,Q10,Q15,...,Q120 (idx 4,9,14,...,119)
  const C_qs = Array.from({ length: 24 }, (_, i) => i * 5 + 4);
  // Dimensão A (Agradabilidade): questões Q4,Q9,Q14,...,Q119 (idx 3,8,13,...,118)
  const A_qs = Array.from({ length: 24 }, (_, i) => i * 5 + 3);

  // Nova ordem do formulário: N, E, O, C, A (Parte 4=Conscienciosidade, Parte 5=Agradabilidade)
  const sheetOrder = [...N_qs, ...E_qs, ...O_qs, ...C_qs, ...A_qs];
  for (let sheetPos = 0; sheetPos < 120; sheetPos++) {
    order[sheetOrder[sheetPos]] = sheetPos;
  }
  return order;
})();

function reorderResponsesFromSheet(sheetValues: number[]): number[] {
  const ordered = new Array(120).fill(3);
  for (let seqIdx = 0; seqIdx < 120; seqIdx++) {
    const sheetPos = COLUMN_ORDER[seqIdx];
    ordered[seqIdx] = sheetValues[sheetPos] ?? 3;
  }
  return ordered;
}

// Subfacetas IPIP-120 (simplificado — apenas dimensões para o escore geral)
const SUBFACET_MAP = [
  // Estabilidade Emocional
  { key: 'anxiety', label: 'Ansiedade', dimension: 'emotionalStability', questions: [{ idx: 0, reversed: false }, { idx: 30, reversed: false }, { idx: 60, reversed: false }, { idx: 90, reversed: false }] },
  { key: 'anger', label: 'Raiva', dimension: 'emotionalStability', questions: [{ idx: 5, reversed: false }, { idx: 35, reversed: false }, { idx: 65, reversed: false }, { idx: 95, reversed: true }] },
  { key: 'depression', label: 'Depressão', dimension: 'emotionalStability', questions: [{ idx: 10, reversed: false }, { idx: 40, reversed: false }, { idx: 70, reversed: false }, { idx: 100, reversed: true }] },
  { key: 'selfConsciousness', label: 'Autoconsciência', dimension: 'emotionalStability', questions: [{ idx: 15, reversed: false }, { idx: 45, reversed: false }, { idx: 75, reversed: false }, { idx: 105, reversed: true }] },
  { key: 'immoderation', label: 'Impulsividade', dimension: 'emotionalStability', questions: [{ idx: 20, reversed: false }, { idx: 50, reversed: true }, { idx: 80, reversed: true }, { idx: 110, reversed: true }] },
  { key: 'vulnerability', label: 'Vulnerabilidade', dimension: 'emotionalStability', questions: [{ idx: 25, reversed: false }, { idx: 55, reversed: false }, { idx: 85, reversed: false }, { idx: 115, reversed: true }] },
  // Extroversão
  { key: 'friendliness', label: 'Afabilidade', dimension: 'extraversion', questions: [{ idx: 1, reversed: false }, { idx: 31, reversed: false }, { idx: 61, reversed: true }, { idx: 91, reversed: true }] },
  { key: 'gregariousness', label: 'Gregarismo', dimension: 'extraversion', questions: [{ idx: 6, reversed: false }, { idx: 36, reversed: false }, { idx: 66, reversed: true }, { idx: 96, reversed: true }] },
  { key: 'assertiveness', label: 'Assertividade', dimension: 'extraversion', questions: [{ idx: 11, reversed: false }, { idx: 41, reversed: false }, { idx: 71, reversed: false }, { idx: 101, reversed: true }] },
  { key: 'activityLevel', label: 'Nível de Atividade', dimension: 'extraversion', questions: [{ idx: 16, reversed: false }, { idx: 46, reversed: false }, { idx: 76, reversed: false }, { idx: 106, reversed: true }] },
  { key: 'excitementSeeking', label: 'Busca por Emoções', dimension: 'extraversion', questions: [{ idx: 21, reversed: false }, { idx: 51, reversed: false }, { idx: 81, reversed: false }, { idx: 111, reversed: false }] },
  { key: 'cheerfulness', label: 'Alegria', dimension: 'extraversion', questions: [{ idx: 26, reversed: false }, { idx: 56, reversed: false }, { idx: 86, reversed: false }, { idx: 116, reversed: false }] },
  // Abertura
  { key: 'imagination', label: 'Imaginação', dimension: 'openness', questions: [{ idx: 2, reversed: false }, { idx: 32, reversed: false }, { idx: 62, reversed: false }, { idx: 92, reversed: false }] },
  { key: 'artisticInterests', label: 'Interesses Artísticos', dimension: 'openness', questions: [{ idx: 7, reversed: false }, { idx: 37, reversed: false }, { idx: 67, reversed: true }, { idx: 97, reversed: true }] },
  { key: 'emotionality', label: 'Emocionalidade', dimension: 'openness', questions: [{ idx: 12, reversed: false }, { idx: 42, reversed: false }, { idx: 72, reversed: true }, { idx: 102, reversed: true }] },
  { key: 'adventurousness', label: 'Aventureirismo', dimension: 'openness', questions: [{ idx: 17, reversed: false }, { idx: 47, reversed: true }, { idx: 77, reversed: true }, { idx: 107, reversed: true }] },
  { key: 'intellect', label: 'Intelecto', dimension: 'openness', questions: [{ idx: 22, reversed: false }, { idx: 52, reversed: false }, { idx: 82, reversed: true }, { idx: 112, reversed: true }] },
  { key: 'liberalism', label: 'Abertura a Valores', dimension: 'openness', questions: [{ idx: 27, reversed: false }, { idx: 57, reversed: true }, { idx: 87, reversed: true }, { idx: 117, reversed: true }] },
  // Agradabilidade
  { key: 'trust', label: 'Confiança', dimension: 'agreeableness', questions: [{ idx: 3, reversed: false }, { idx: 33, reversed: false }, { idx: 63, reversed: false }, { idx: 93, reversed: true }] },
  { key: 'morality', label: 'Moralidade', dimension: 'agreeableness', questions: [{ idx: 8, reversed: true }, { idx: 38, reversed: true }, { idx: 68, reversed: false }, { idx: 98, reversed: false }] },
  { key: 'altruism', label: 'Altruísmo', dimension: 'agreeableness', questions: [{ idx: 13, reversed: false }, { idx: 43, reversed: false }, { idx: 73, reversed: false }, { idx: 103, reversed: false }] },
  { key: 'cooperation', label: 'Cooperação', dimension: 'agreeableness', questions: [{ idx: 18, reversed: false }, { idx: 48, reversed: true }, { idx: 78, reversed: false }, { idx: 108, reversed: true }] },
  { key: 'modesty', label: 'Modéstia', dimension: 'agreeableness', questions: [{ idx: 23, reversed: false }, { idx: 53, reversed: false }, { idx: 83, reversed: true }, { idx: 113, reversed: true }] },
  { key: 'sympathy', label: 'Simpatia', dimension: 'agreeableness', questions: [{ idx: 28, reversed: false }, { idx: 58, reversed: false }, { idx: 88, reversed: false }, { idx: 118, reversed: false }] },
  // Conscienciosidade
  { key: 'selfEfficacy', label: 'Autoeficácia', dimension: 'conscientiousness', questions: [{ idx: 4, reversed: false }, { idx: 34, reversed: false }, { idx: 64, reversed: false }, { idx: 94, reversed: false }] },
  { key: 'orderliness', label: 'Ordem', dimension: 'conscientiousness', questions: [{ idx: 9, reversed: false }, { idx: 39, reversed: false }, { idx: 69, reversed: true }, { idx: 99, reversed: true }] },
  { key: 'dutifulness', label: 'Senso de Dever', dimension: 'conscientiousness', questions: [{ idx: 14, reversed: false }, { idx: 44, reversed: false }, { idx: 74, reversed: true }, { idx: 104, reversed: true }] },
  { key: 'achievementStriving', label: 'Busca por Realização', dimension: 'conscientiousness', questions: [{ idx: 19, reversed: false }, { idx: 49, reversed: false }, { idx: 79, reversed: false }, { idx: 109, reversed: false }] },
  { key: 'selfDiscipline', label: 'Autodisciplina', dimension: 'conscientiousness', questions: [{ idx: 24, reversed: false }, { idx: 54, reversed: true }, { idx: 84, reversed: false }, { idx: 114, reversed: true }] },
  { key: 'cautiousness', label: 'Cautela', dimension: 'conscientiousness', questions: [{ idx: 29, reversed: false }, { idx: 59, reversed: true }, { idx: 89, reversed: false }, { idx: 119, reversed: true }] },
];

function calculateIPIP120Profile(responses: number[]) {
  const subfacets = SUBFACET_MAP.map(sf => {
    const rawScore = sf.questions.reduce((sum, q) => {
      const val = responses[q.idx] ?? 3;
      return sum + (q.reversed ? 6 - val : val);
    }, 0);
    const score = Math.round(((rawScore - 4) / 16) * 100);
    return { key: sf.key, label: sf.label, dimension: sf.dimension, score: Math.max(0, Math.min(100, score)), rawScore };
  });

  const dimScore = (dim: string) => {
    const sfs = subfacets.filter(s => s.dimension === dim);
    if (!sfs.length) return 50;
    // Para Estabilidade Emocional, invertemos (neuroticismo → estabilidade)
    if (dim === 'emotionalStability') {
      const avg = sfs.reduce((s, sf) => s + sf.score, 0) / sfs.length;
      return Math.round(100 - avg);
    }
    return Math.round(sfs.reduce((s, sf) => s + sf.score, 0) / sfs.length);
  };

  return {
    openness: dimScore('openness'),
    conscientiousness: dimScore('conscientiousness'),
    extraversion: dimScore('extraversion'),
    agreeableness: dimScore('agreeableness'),
    emotionalStability: dimScore('emotionalStability'),
    subfacets,
  };
}

function emailToIdIPIP(email: string): string {
  const normalized = email.trim().toLowerCase();
  return 'ipip_' + Buffer.from(normalized).toString('base64').replace(/[+/=]/g, c => ({ '+': '-', '/': '_', '=': '' }[c] ?? c));
}

// ─── Busca e parsing das planilhas ────────────────────────────────────────────

async function fetchSheet(sheetId: string, gid: string): Promise<string> {
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  const response = await fetch(csvUrl, { redirect: 'follow' });
  if (!response.ok) throw new Error(`HTTP ${response.status} ao buscar planilha ${sheetId}`);
  const text = await response.text();
  if (!text.trim()) throw new Error(`Planilha ${sheetId} vazia`);
  return text;
}

async function sync30q(): Promise<{ saved: number; errors: number }> {
  const SHEET_ID = '1gStVG2NRfrQe7E2fGMU1RC2xwRd2ZGcX50oJHLeG-3U';
  const GID = '724087005';
  const csv = await fetchSheet(SHEET_ID, GID);

  const lines = csv.split('\n').filter(l => l.trim());
  if (lines.length < 2) return { saved: 0, errors: 0 };

  const headers = parseCSVLine(lines[0]);
  let timestampIdx = -1, emailIdx = -1, nameIdx = -1;
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].toLowerCase();
    if (h.includes('carimbo') || h.includes('timestamp') || h.includes('data')) timestampIdx = i;
    else if (h.includes('e-mail') || h.includes('email') || h.includes('endereço')) emailIdx = i;
    else if (h.includes('nome') || h.includes('name')) nameIdx = i;
  }
  if (timestampIdx === -1 || emailIdx === -1 || nameIdx === -1) {
    throw new Error('Planilha 30q: colunas obrigatórias não encontradas');
  }

  let saved = 0, errors = 0;
  for (let i = 1; i < lines.length; i++) {
    try {
      const cells = parseCSVLine(lines[i]);
      if (!cells[nameIdx]) continue;

      const questionsStart = 3;
      if (cells.length < questionsStart + 30) continue;

      const responses: number[] = [];
      for (let j = questionsStart; j < questionsStart + 30; j++) {
        const match = String(cells[j] || '3').match(/^(\d)/);
        responses.push(match ? Math.max(1, Math.min(5, parseInt(match[1], 10))) : 3);
      }

      const email = cells[emailIdx].trim();
      const name = cells[nameIdx].trim();
      const timestamp = cells[timestampIdx].trim();
      const id = emailToId30(email);
      const dimensions = calculateBigFiveScore(responses);
      const combinationInsights = generateCombinationInsights(dimensions);

      await upsertBigfiveProfile({
        id, name, email, responseTimestamp: timestamp,
        rawResponses: responses, dimensions,
        combinationInsights, recommendations: [],
        ipip120Data: null, testVersion: '30q',
      });
      saved++;
    } catch (e) {
      console.error(`[syncJob] Erro na linha ${i + 1} (30q):`, e);
      errors++;
    }
  }
  return { saved, errors };
}

async function syncIPIP120(): Promise<{ saved: number; errors: number }> {
  const SHEET_ID = '1b--xizm9DcwfsdpQTiSqs4GdF4vX0qqqV2blIAGM04E';
  const GID = '1081644880';
  const csv = await fetchSheet(SHEET_ID, GID);

  const lines = csv.split('\n').filter(l => l.trim());
  if (lines.length < 2) return { saved: 0, errors: 0 };

  const headers = parseCSVLine(lines[0]);
  let timestampIdx = -1, emailIdx = -1, nameIdx = -1;
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].toLowerCase();
    if (h.includes('carimbo') || h.includes('timestamp') || h.includes('data')) timestampIdx = i;
    else if (h.includes('e-mail') || h.includes('email') || h.includes('endereço')) emailIdx = i;
    else if (h.includes('nome') || h.includes('name')) nameIdx = i;
  }
  if (timestampIdx === -1 || emailIdx === -1 || nameIdx === -1) {
    throw new Error('Planilha IPIP-120: colunas obrigatórias não encontradas');
  }

  let saved = 0, errors = 0;
  for (let i = 1; i < lines.length; i++) {
    try {
      const cells = parseCSVLine(lines[i]);
      if (!cells[nameIdx]) continue;

      const questionsStart = 3;
      if (cells.length < questionsStart + 120) continue;

      const sheetValues: number[] = [];
      for (let j = questionsStart; j < questionsStart + 120; j++) {
        const match = String(cells[j] || '3').match(/^(\d)/);
        sheetValues.push(match ? Math.max(1, Math.min(5, parseInt(match[1], 10))) : 3);
      }
      const responses = reorderResponsesFromSheet(sheetValues);

      const email = cells[emailIdx].trim();
      const name = cells[nameIdx].trim();
      const timestamp = cells[timestampIdx].trim();
      const id = emailToIdIPIP(email);

      const ipip120 = calculateIPIP120Profile(responses);
      const scaledResponses = [
        ...Array(6).fill(Math.round(ipip120.openness / 25) + 1),
        ...Array(6).fill(Math.round(ipip120.conscientiousness / 25) + 1),
        ...Array(6).fill(Math.round(ipip120.extraversion / 25) + 1),
        ...Array(6).fill(Math.round(ipip120.agreeableness / 25) + 1),
        ...Array(6).fill(Math.round(ipip120.emotionalStability / 25) + 1),
      ].map(v => Math.max(1, Math.min(5, v)));

      const dimensions = calculateBigFiveScore(scaledResponses);
      const combinationInsights = generateCombinationInsights(dimensions);

      await upsertBigfiveProfile({
        id, name, email, responseTimestamp: timestamp,
        rawResponses: responses, dimensions,
        combinationInsights, recommendations: [],
        ipip120Data: ipip120, testVersion: 'ipip120',
      });
      saved++;
    } catch (e) {
      console.error(`[syncJob] Erro na linha ${i + 1} (IPIP-120):`, e);
      errors++;
    }
  }
  return { saved, errors };
}

// ─── Função principal de sincronização ───────────────────────────────────────

export async function runSync(): Promise<{ success: boolean; message: string }> {
  console.log('[syncJob] Iniciando sincronização automática...');
  const startTime = Date.now();

  try {
    const [r30, rIPIP] = await Promise.allSettled([sync30q(), syncIPIP120()]);

    const s30 = r30.status === 'fulfilled' ? r30.value : { saved: 0, errors: 1 };
    const sIPIP = rIPIP.status === 'fulfilled' ? rIPIP.value : { saved: 0, errors: 1 };

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const message = `30q: ${s30.saved} perfis | IPIP-120: ${sIPIP.saved} perfis | Erros: ${s30.errors + sIPIP.errors} | ${elapsed}s`;

    console.log(`[syncJob] Concluído — ${message}`);

    // Notificar o dono se houve novos perfis
    if (s30.saved + sIPIP.saved > 0) {
      await notifyOwner({
        title: '🔄 Sincronização automática concluída',
        content: message,
      }).catch(() => {});
    }

    return { success: true, message };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[syncJob] Erro fatal:', msg);
    return { success: false, message: msg };
  }
}

// ─── Agendamento do cron job ──────────────────────────────────────────────────

export function startSyncScheduler() {
  // 06:00 horário de Brasília = 09:00 UTC
  // Cron: segundos minutos horas dia mês dia-semana
  // node-cron v4 usa 5 campos (sem segundos): minutos horas dia mês dia-semana
  cron.schedule('0 9 * * *', async () => {
    console.log('[syncJob] Cron disparado — 06:00 Brasília');
    await runSync();
  }, {
    timezone: 'UTC',
  });

  console.log('[syncJob] Agendador iniciado — sincronização diária às 06:00 (Brasília)');
}
