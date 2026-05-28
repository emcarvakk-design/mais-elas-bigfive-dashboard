/**
 * Netlify Function: lqa-sync
 * 
 * Acionada pelo botão "Sincronizar" no dashboard LQA.
 * 
 * Fluxo:
 * 1. Lê RESP CONTEXTO (Form 1) e RESP_Complemento (Form 2) da Google Sheets pública
 * 2. Detecta respondentes novos (não processados ainda no Supabase)
 * 3. Classifica cada respondente com o motor LQA
 * 4. Salva/atualiza no Supabase (tabela lqa_resultados)
 * 5. Retorna o total de novos processados
 */

const SUPABASE_URL = 'https://qhzlhomuhebknkcklagf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoemxob211aGVia25rY2tsYWdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTEzMzE2MSwiZXhwIjoyMDk0NzA5MTYxfQ.748vWBPN3rRU_biV8S05GovPZFDwuS04LFuHPmgs-1I';

const SHEET_ID = '136RxxsS6wV9H9BoUCGGfxirm5_59SOZzmEhmHCloKwA';
const GID_FORM1 = '749797565';   // RESP CONTEXTO
const GID_FORM2 = '1137073244';  // RESP_Complemento

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// ─── CSV Parser ───────────────────────────────────────────────────────────────
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 3) continue;
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? '';
    });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
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

// ─── Fetch Sheets ─────────────────────────────────────────────────────────────
async function fetchSheet(gid) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Sheets HTTP ${res.status} para gid=${gid}`);
  return res.text();
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────
async function supabaseGet(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase GET ${path}: ${res.status}`);
  return res.json();
}

async function supabaseUpsert(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase upsert ${table}: ${res.status} — ${err}`);
  }
  return res;
}

// ─── Motor LQA — Classificação ────────────────────────────────────────────────
/**
 * Classifica um respondente com base nas respostas do Form 1 (e opcionalmente Form 2).
 * 
 * Lógica simplificada baseada nas evidências-chave do protocolo LQA:
 * - P06 (Gestor Centralizador): entra e faz junto, fica frustrado quando padrão cai,
 *   pressiona por velocidade, eleva tom sob pressão
 * - P03 (Gestor Estruturador): alta estrutura de processo, clareza de papéis/prazos
 * - P10 (Gestor Reativo): reatividade emocional sob pressão, inconsistência de sinal
 */
function classificarRespondente(form1Row, form2Row) {
  const r = form1Row;

  // Pontuação por padrão
  const scores = {
    P06: 0, // Centralizador
    P03: 0, // Estruturador
    P10: 0, // Reativo
    P28: 0, // Compulsivo
    P29: 0, // Ansioso por velocidade
  };

  // ── Evidências P06 (Centralizador) ──
  // Q15: entra e faz junto
  const q15 = getField(r, ['Q15', 'Pergunta 15', 15]);
  if (q15?.includes('fazendo junto') || q15?.includes('mais rápido') || q15?.includes('fico mais tranquilo quando faço eu mesmo')) scores.P06 += 3;

  // Q16: fica frustrado, preferia ter feito eu mesmo
  const q16 = getField(r, ['Q16', 'Pergunta 16', 16]);
  if (q16?.includes('preferia ter feito eu mesmo') || q16?.includes('padrão caiu')) scores.P06 += 3;

  // Q28: pressiona por velocidade
  const q28 = getField(r, ['Q28', 'Pergunta 28', 28]);
  if (q28?.includes('Pressiono por velocidade') || q28?.includes('precisa acelerar agora')) scores.P06 += 2;

  // Q32: eleva o tom com frequência
  const q32 = getField(r, ['Q32', 'Pergunta 32', 32]);
  if (q32 === 'Com frequência' || q32 === 'Com frequencia' || q32 === 'Sempre') scores.P06 += 2;

  // Q51: interrompe e explica
  const q51 = getField(r, ['Q51', 'Pergunta 51', 51]);
  if (q51?.includes('Interrompo') && q51?.includes('explico')) scores.P06 += 1;

  // ── Evidências P03 (Estruturador) ──
  // Q18: time sai sabendo exatamente o que fazer
  const q18 = getField(r, ['Q18', 'Pergunta 18', 18]);
  if (q18 === 'Sempre' || q18 === 'Com frequência' || q18 === 'Com frequencia') scores.P03 += 2;

  // Q23: explica raciocínio das decisões
  const q23 = getField(r, ['Q23', 'Pergunta 23', 23]);
  if (q23 === 'Sempre' || q23 === 'Com frequência' || q23 === 'Com frequencia') scores.P03 += 2;

  // Q41: cadência de alinhamento
  const q41 = getField(r, ['Q41', 'Pergunta 41', 41]);
  if (q41?.includes('cadência') || q41?.includes('Isso não acontece')) scores.P03 += 1;

  // ── Evidências P29 (Ansioso por velocidade) ──
  const q25 = getField(r, ['Q25', 'Pergunta 25', 25]);
  if (q25?.includes('irritado') || q25?.includes('lentidão me incomoda') || q25?.includes('nomear')) scores.P29 += 3;

  // ── Evidências P10 (Reativo) ──
  if (q28?.includes('Pressiono') || q28?.includes('acelerar agora')) scores.P10 += 1;
  if (q32 === 'Com frequência' || q32 === 'Com frequencia') scores.P10 += 1;

  // Form 2 — se disponível
  if (form2Row) {
    const f2q2 = getField(form2Row, ['Q2', 'Pergunta 2', 2]);
    if (f2q2?.includes('Mantenho minha posição') || f2q2?.includes('mais experiência')) scores.P06 += 2;

    const f2q18 = getField(form2Row, ['Q18', 'Pergunta 18', 18]);
    if (f2q18?.includes('suavizo') || f2q18?.includes('ninguém fique')) scores.P10 += 1;
  }

  // ── Determinar perfil principal ──
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [perfilPrincipal, scorePrincipal] = sorted[0];
  const [perfilSecundario] = sorted[1];

  // Se P06 domina com P29 como secundário forte, é centralizador com gatilho de velocidade
  // Se P03 é forte junto com P06, é centralizador com estrutura
  const perfilFinal = scorePrincipal >= 3 ? perfilPrincipal : 'P06'; // fallback para P06 se dados insuficientes
  const confianca = form2Row ? (scorePrincipal >= 5 ? 'alta' : 'media') : 'media';

  return {
    perfil_codigo: perfilFinal,
    perfil_secundario: perfilSecundario !== perfilFinal ? perfilSecundario : 'P10',
    confianca,
    scores,
  };
}

function getField(row, keys) {
  if (!row) return undefined;
  // Tenta cada variação de chave
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== '') return row[key];
    // Busca parcial por número
    if (typeof key === 'number') {
      const found = Object.entries(row).find(([k]) => {
        const match = k.match(/(\d+)/);
        return match && parseInt(match[1]) === key;
      });
      if (found) return found[1];
    }
  }
  return undefined;
}

// ─── Mapeamento de perfis ─────────────────────────────────────────────────────
const PERFIS = {
  P06: {
    nome: 'Gestor Centralizador',
    macrogrupo: 'B',
    macrogrupo_nome: 'B — Relação com Poder, Controle e Autoridade',
    blanchard_quadrante: 'S1',
    blanchard_recomendado: 'Coaching (S2)',
    dilts_dominante: 'Comportamento',
    dilts_gap: 'Capacidade',
    fpc_dimensao: 'Controle e Execução',
    gap: 'Sustentar a delegação sem retomar a execução',
    forca: 'Clareza de direção e orientação a resultado',
  },
  P03: {
    nome: 'Gestor Estruturador',
    macrogrupo: 'A',
    macrogrupo_nome: 'A — Relação com Estrutura e Processo',
    blanchard_quadrante: 'S2',
    blanchard_recomendado: 'Coaching (S2) com desenvolvimento para S3',
    dilts_dominante: 'Comportamento',
    dilts_gap: 'Identidade',
    fpc_dimensao: 'Estrutura e Processo',
    gap: 'Desenvolver flexibilidade quando o processo não serve ao contexto',
    forca: 'Clareza de processo e comunicação estruturada',
  },
  P10: {
    nome: 'Gestor Reativo',
    macrogrupo: 'C',
    macrogrupo_nome: 'C — Relação com Pressão e Resultado',
    blanchard_quadrante: 'S1',
    blanchard_recomendado: 'Suporte (S3)',
    dilts_dominante: 'Comportamento',
    dilts_gap: 'Crença',
    fpc_dimensao: 'Reatividade Emocional',
    gap: 'Criar pausa entre o estímulo e a resposta',
    forca: 'Alta energia e senso de urgência',
  },
  P28: {
    nome: 'Gestor Compulsivo',
    macrogrupo: 'B',
    macrogrupo_nome: 'B — Relação com Poder, Controle e Autoridade',
    blanchard_quadrante: 'S1',
    blanchard_recomendado: 'Coaching (S2)',
    dilts_dominante: 'Identidade',
    dilts_gap: 'Crença',
    fpc_dimensao: 'Controle Compulsivo',
    gap: 'Distinguir controle necessário de controle ansioso',
    forca: 'Alta consistência e previsibilidade',
  },
  P29: {
    nome: 'Gestor Ansioso por Velocidade',
    macrogrupo: 'C',
    macrogrupo_nome: 'C — Relação com Pressão e Resultado',
    blanchard_quadrante: 'S2',
    blanchard_recomendado: 'Coaching (S2)',
    dilts_dominante: 'Comportamento',
    dilts_gap: 'Capacidade',
    fpc_dimensao: 'Ansiedade por Velocidade',
    gap: 'Transformar impaciência em pergunta antes de agir',
    forca: 'Alta orientação a resultado e proatividade',
  },
};

// ─── Construir registro completo ──────────────────────────────────────────────
function buildRecord(submissionId, form1Row, form2Row, classificacao) {
  const perfil = PERFIS[classificacao.perfil_codigo] || PERFIS.P06;
  const perfilSec = PERFIS[classificacao.perfil_secundario] || PERFIS.P10;

  // Extrair evidências-chave das respostas
  const evidencias = [];
  const q15 = getField(form1Row, ['Q15', 15]);
  if (q15) evidencias.push(`Q15: "${q15.substring(0, 80)}"`);
  const q16 = getField(form1Row, ['Q16', 16]);
  if (q16) evidencias.push(`Q16: "${q16.substring(0, 80)}"`);
  const q25 = getField(form1Row, ['Q25', 25]);
  if (q25) evidencias.push(`Q25: "${q25.substring(0, 80)}"`);
  const q28 = getField(form1Row, ['Q28', 28]);
  if (q28) evidencias.push(`Q28: "${q28.substring(0, 80)}"`);
  const q32 = getField(form1Row, ['Q32', 32]);
  if (q32) evidencias.push(`Q32: "${q32}"`);

  const nome = form1Row['Nome completo'] || form1Row['Nome'] || form1Row['name'] || 'Respondente';
  const email = form1Row['E-mail'] || form1Row['Email'] || form1Row['email'] || '';
  const timestampRaw = form1Row['Carimbo de data/hora'] || form1Row['Timestamp'] || form1Row['timestamp'] || '';

  return {
    id: submissionId,
    nome,
    email,
    timestamp: timestampRaw ? new Date(timestampRaw).toISOString() : new Date().toISOString(),
    perfil_codigo: classificacao.perfil_codigo,
    macrogrupo: perfil.macrogrupo,
    macrogrupo_nome: perfil.macrogrupo_nome,
    perfil_nome: perfil.nome,
    confianca: classificacao.confianca,
    perfil_secundario: classificacao.perfil_secundario,
    evidencias_chave: evidencias,
    blanchard: {
      quadrante: perfil.blanchard_quadrante,
      estilo_recomendado: perfil.blanchard_recomendado,
      nivel_competencia: 'moderado',
      nivel_comprometimento: 'variável',
      justificativa: `Perfil ${classificacao.perfil_codigo} — ${perfil.nome}. Gap principal: ${perfil.gap}.`,
    },
    dilts: {
      nivel_dominante: perfil.dilts_dominante,
      nivel_gap: perfil.dilts_gap,
      descricao: `Opera no nível de ${perfil.dilts_dominante}. Gap em ${perfil.dilts_gap}.`,
      impacto_lideranca: `Padrão ${classificacao.perfil_codigo} com perfil secundário ${classificacao.perfil_secundario}.`,
    },
    meta_programas: {
      aproximacao_evitacao: 'Misto',
      interno_externo: 'Interno',
      opcoes_procedimentos: 'Misto',
      global_detalhe: 'Misto',
      proativo_reativo: 'Misto',
      padrao_dominante: `Padrão ${classificacao.perfil_codigo} detectado com confiança ${classificacao.confianca}.`,
      implicacao_operacional: perfil.gap,
    },
    fpc: {
      dimensao_dominante: perfil.fpc_dimensao,
      padrao_dominante: `${perfil.nome} — ${perfil.gap}`,
      risco_operacional: `Perfil secundário ${perfilSec.nome} ativado sob pressão.`,
      forca_central: perfil.forca,
    },
    lqa_consolidado: {
      gap_prioritario: perfil.gap,
      forca_dominante: perfil.forca,
      risco_ativado: `${perfilSec.nome} como padrão secundário.`,
      acao_inicial: `Semana 1: identificar 1 situação onde o padrão ${classificacao.perfil_codigo} foi ativado e registrar o gatilho.`,
      evidencia_esperada: `Ao final da semana 1: clareza sobre o principal gatilho do padrão ${classificacao.perfil_codigo}.`,
      nota_metodologica: form2Row
        ? `Classificado com Form 1 e Form 2. Confiança: ${classificacao.confianca}.`
        : `Classificado apenas com Form 1. Form 2 pendente. Confiança: ${classificacao.confianca}. Reprocessar após Form 2.`,
    },
    raw_form1: form1Row,
    raw_form2: form2Row || null,
    updated_at: new Date().toISOString(),
  };
}

// ─── Handler principal ────────────────────────────────────────────────────────
export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Método não permitido. Use POST.' }),
    };
  }

  try {
    // 1. Buscar dados já processados no Supabase (incluindo raw_form1 para preservar _biblioteca)
    const existentes = await supabaseGet('lqa_resultados?select=id,confianca,raw_form1');
    const existentesMap = new Map(existentes.map(r => [r.id, r]));

    // 2. Buscar Form 1 e Form 2 da Sheets
    const [csv1, csv2] = await Promise.all([
      fetchSheet(GID_FORM1),
      fetchSheet(GID_FORM2),
    ]);

    const rows1 = parseCSV(csv1);
    const rows2 = parseCSV(csv2);

    // 3. Indexar Form 2 por submission_id (coluna 2, índice 1)
    const form2Map = new Map();
    for (const row of rows2) {
      // A coluna de submission_id no Tally é a segunda coluna
      const cols = Object.values(row);
      const submissionId = cols[1];
      if (submissionId) form2Map.set(submissionId, row);
    }

    // 4. Processar respondentes novos ou com confiança baixa
    const novos = [];
    const atualizados = [];

    for (const row of rows1) {
      const cols = Object.values(row);
      const submissionId = cols[1]; // segunda coluna = submission_id do Tally
      if (!submissionId) continue;

      const jaExiste = existentesMap.has(submissionId);
      const existenteData = existentesMap.get(submissionId);
      const confiancaAtual = existenteData?.confianca;
      const form2 = form2Map.get(submissionId) || null;

      // Pular se já existe com confiança alta e Form 2 não mudou
      if (jaExiste && confiancaAtual === 'alta') continue;

      // Classificar
      const classificacao = classificarRespondente(row, form2);
      const record = buildRecord(submissionId, row, form2, classificacao);

      // Preservar _biblioteca existente no raw_form1 (não apagar enriquecimento manual)
      if (jaExiste && existenteData?.raw_form1?._biblioteca) {
        record.raw_form1 = { ...record.raw_form1, _biblioteca: existenteData.raw_form1._biblioteca };
      }

      await supabaseUpsert('lqa_resultados', record);

      if (jaExiste) {
        atualizados.push(record.nome);
      } else {
        novos.push(record.nome);
      }
    }

    // 5. Buscar todos os resultados atualizados para retornar ao frontend (incluindo raw_form1 para _biblioteca)
    const todos = await supabaseGet(
      'lqa_resultados?select=id,nome,email,timestamp,perfil_codigo,macrogrupo,macrogrupo_nome,perfil_nome,confianca,perfil_secundario,evidencias_chave,blanchard,dilts,meta_programas,fpc,lqa_consolidado,raw_form1&order=timestamp.desc'
    );

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        novos: novos.length,
        atualizados: atualizados.length,
        nomes_novos: novos,
        nomes_atualizados: atualizados,
        total: todos.length,
        respondentes: todos,
      }),
    };
  } catch (error) {
    console.error('lqa-sync error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
