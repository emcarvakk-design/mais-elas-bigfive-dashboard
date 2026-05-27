/**
 * lqaRouter.ts — Rotas de API para o módulo LQA
 *
 * GET /api/lqa/profiles   — Retorna todos os perfis processados pelo motor LQA
 * POST /api/lqa/sync      — Força re-processamento das respostas da Sheets
 *
 * Usa a mesma abordagem do syncJob.ts: fetch CSV público da Sheets.
 * A Sheets deve estar compartilhada como "Qualquer pessoa com o link → Leitor".
 */

import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Config da Sheets LQA ────────────────────────────────────────────────────
const LQA_SHEET_ID = '136RxxsS6wV9H9BoUCGGfxirm5_59SOZzmEhmHCloKwA';
const LQA_GID_CONTEXTO = '749797565';
const LQA_GID_COMPLEMENTO = '1137073244';

// Cache em memória (recarrega a cada 30 min ou ao chamar /sync)
let cachedProfiles: Record<string, any> | null = null;
let lastCacheTime: number = 0;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos

// ─── Helpers CSV ─────────────────────────────────────────────────────────────
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

async function fetchSheetCSV(gid: string): Promise<string[][]> {
  const csvUrl = `https://docs.google.com/spreadsheets/d/${LQA_SHEET_ID}/export?format=csv&gid=${gid}`;
  try {
    const response = await fetch(csvUrl, { redirect: 'follow' });
    if (!response.ok) {
      console.warn(`[LQA] Sheets retornou ${response.status} para GID ${gid}`);
      return [];
    }
    const text = await response.text();
    const lines = text.split('\n').filter(l => l.trim());
    return lines.map(parseCSVLine);
  } catch (e) {
    console.warn(`[LQA] Erro ao buscar Sheets GID ${gid}:`, e);
    return [];
  }
}

// ─── Processar respondentes ──────────────────────────────────────────────────
async function processarRespondentes(): Promise<Record<string, any>> {
  // Verificar se há arquivo de resultados pré-processados pelo motor Python
  const resultadosPath = path.resolve(__dirname, '..', 'lqa_resultados.json');

  let resultados: Record<string, any> = {};

  if (fs.existsSync(resultadosPath)) {
    try {
      const raw = fs.readFileSync(resultadosPath, 'utf-8');
      resultados = JSON.parse(raw);
      console.log(`[LQA] Carregados ${Object.keys(resultados).length} perfis do lqa_resultados.json`);
    } catch (e) {
      console.warn('[LQA] Erro ao ler lqa_resultados.json:', e);
    }
  }

  // Enriquecer com dados frescos da Sheets (timestamps, novos respondentes)
  try {
    const contextoRows = await fetchSheetCSV(LQA_GID_CONTEXTO);
    if (contextoRows.length > 1) {
      const headers = contextoRows[0];
      const emailIdx = headers.findIndex(h =>
        h.toLowerCase().includes('email') || h.toLowerCase().includes('e-mail')
      );
      const nomeIdx = headers.findIndex(h =>
        h.toLowerCase().includes('nome') || h.toLowerCase().includes('name')
      );
      const tsIdx = headers.findIndex(h =>
        h.toLowerCase().includes('timestamp') ||
        h.toLowerCase().includes('carimbo') ||
        h.toLowerCase().includes('data')
      );

      for (const row of contextoRows.slice(1)) {
        const email = (row[emailIdx] || '').toLowerCase().trim();
        const nome = (row[nomeIdx] || '').trim();
        if (!email && !nome) continue;

        // Encontrar respondente no JSON de resultados pelo email
        const respKey = Object.keys(resultados).find(k => {
          const resp = resultados[k]?.respondente;
          return resp?.email?.toLowerCase() === email ||
                 resp?.nome?.toLowerCase() === nome.toLowerCase();
        });

        if (respKey && resultados[respKey]) {
          // Atualizar timestamp se disponível
          if (tsIdx >= 0 && row[tsIdx]) {
            resultados[respKey].respondente.timestamp = row[tsIdx];
          }
        }
      }
    }
  } catch (e) {
    console.warn('[LQA] Erro ao enriquecer com dados da Sheets:', e);
  }

  return resultados;
}

// ─── Router Express ──────────────────────────────────────────────────────────
export function createLQARouter(): Router {
  const router = Router();

  // GET /api/lqa/profiles — retorna todos os perfis processados
  router.get('/profiles', async (_req, res) => {
    try {
      const now = Date.now();
      if (!cachedProfiles || (now - lastCacheTime) > CACHE_TTL_MS) {
        cachedProfiles = await processarRespondentes();
        lastCacheTime = now;
      }
      res.json({
        success: true,
        data: cachedProfiles,
        lastSync: new Date(lastCacheTime).toISOString(),
        total: Object.keys(cachedProfiles).length,
      });
    } catch (error) {
      console.error('[LQA] Erro ao buscar perfis:', error);
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // POST /api/lqa/sync — força re-processamento
  router.post('/sync', async (_req, res) => {
    try {
      cachedProfiles = await processarRespondentes();
      lastCacheTime = Date.now();
      res.json({
        success: true,
        message: `${Object.keys(cachedProfiles).length} perfis sincronizados`,
        lastSync: new Date(lastCacheTime).toISOString(),
      });
    } catch (error) {
      console.error('[LQA] Erro ao sincronizar:', error);
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  return router;
}
