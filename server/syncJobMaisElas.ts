import cron from 'node-cron';
import { upsertRodaProfile } from './db';

const SPREADSHEET_ID = "11Qdt1kej-bDnsR86Kn8V7PGYHu7ZmcgU0Ba7z5lThKk";
const GID = "1447068702";

const COLS = {
  timestamp: 0, email: 1, nome: 2, area: 3, faixaEtaria: 4,
  // Respostas abertas (perguntas qualitativas)
  respostaEstacao: 8,         // "Se o seu momento profissional fosse uma estação..."
  respostaDrena: 12,          // "O que mais drena sua energia..."
  respostaRelacionamento: 16, // "Qual relacionamento profissional..."
  respostaConquista: 20,      // "Qual foi sua maior conquista..."
  respostaObstaculo: 24,      // "Qual é o maior obstáculo..."
  respostaHabilidade: 28,     // "Qual habilidade ou conhecimento..."
  respostaLegado: 32,         // "Em uma frase, qual é o legado..."
  // Notas da Roda da Vida (0-10) — colunas 33 a 42
  scoreCarreira: 33,
  scoreFinanceiro: 34,
  scoreProposito: 35,
  scoreLideranca: 36,
  scoreRelacionamentos: 37,
  scoreDesenvolvimento: 38,
  scoreSaude: 39,
  scoreEquilibrio: 40,
  scoreReconhecimento: 41,
  scoreAutonomia: 42,
  respostaDimensaoAtencao: 43,
};

function parseScore(val: string | undefined): number | null {
  if (!val || val.trim() === '') return null;
  const n = parseFloat(val.replace(',', '.'));
  return isNaN(n) ? null : Math.min(10, Math.max(0, n));
}

function parseTimestamp(val: string | undefined): Date | null {
  if (!val) return null;
  try {
    const parts = val.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/);
    if (parts) {
      return new Date(`${parts[3]}-${parts[2].padStart(2,'0')}-${parts[1].padStart(2,'0')}T${parts[4].padStart(2,'0')}:${parts[5]}:${parts[6]}`);
    }
    return new Date(val);
  } catch { return null; }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else { current += char; }
  }
  result.push(current);
  return result;
}

export async function syncRodaProfiles(): Promise<{ synced: number; errors: number }> {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID}`;
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`Falha ao buscar planilha: ${response.status}`);

  const text = await response.text();
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return { synced: 0, errors: 0 };

  let synced = 0, errors = 0;
  for (const line of lines.slice(1)) {
    try {
      const cols = parseCSVLine(line);
      if (cols.length < 2) continue;
      const email = cols[COLS.email]?.trim().toLowerCase();
      const nome = cols[COLS.nome]?.trim();
      if (!email || !nome) continue;
      const profileId = email.replace(/[^a-z0-9@._-]/g, '_');
      await upsertRodaProfile({
        id: profileId, email, name: nome,
        area: cols[COLS.area]?.trim() || null,
        faixaEtaria: cols[COLS.faixaEtaria]?.trim() || null,
        scoreCarreira: parseScore(cols[COLS.scoreCarreira]),
        scoreFinanceiro: parseScore(cols[COLS.scoreFinanceiro]),
        scoreProposito: parseScore(cols[COLS.scoreProposito]),
        scoreLideranca: parseScore(cols[COLS.scoreLideranca]),
        scoreRelacionamentos: parseScore(cols[COLS.scoreRelacionamentos]),
        scoreDesenvolvimento: parseScore(cols[COLS.scoreDesenvolvimento]),
        scoreSaude: parseScore(cols[COLS.scoreSaude]),
        scoreEquilibrio: parseScore(cols[COLS.scoreEquilibrio]),
        scoreReconhecimento: parseScore(cols[COLS.scoreReconhecimento]),
        scoreAutonomia: parseScore(cols[COLS.scoreAutonomia]),
        respostaEstacao: cols[COLS.respostaEstacao]?.trim() || null,
        respostaDrena: cols[COLS.respostaDrena]?.trim() || null,
        respostaRelacionamento: cols[COLS.respostaRelacionamento]?.trim() || null,
        respostaConquista: cols[COLS.respostaConquista]?.trim() || null,
        respostaObstaculo: cols[COLS.respostaObstaculo]?.trim() || null,
        respostaHabilidade: cols[COLS.respostaHabilidade]?.trim() || null,
        respostaLegado: cols[COLS.respostaLegado]?.trim() || null,
        respostaDimensaoAtencao: cols[COLS.respostaDimensaoAtencao]?.trim() || null,
        submittedAt: parseTimestamp(cols[COLS.timestamp]),
      });
      synced++;
    } catch (err) {
      console.error('Erro ao processar linha:', err);
      errors++;
    }
  }
  return { synced, errors };
}

export function startSyncScheduler() {
  cron.schedule('0 9 * * *', async () => {
    console.log('[Mais Elas] Iniciando sync agendado...');
    try {
      const r = await syncRodaProfiles();
      console.log(`[Mais Elas] Sync: ${r.synced} perfis, ${r.errors} erros`);
    } catch (err) { console.error('[Mais Elas] Erro no sync:', err); }
  });
  console.log('[Mais Elas] Agendador iniciado (06:00 BRT)');
}
