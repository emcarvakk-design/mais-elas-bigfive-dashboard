import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import { z } from "zod";
import {
  upsertBigfiveProfile,
  getAllBigfiveProfiles,
  deleteBigfiveProfile,
  deleteAllBigfiveProfiles,
  deduplicateProfiles,
  saveMentoringAnalysis,
  getMentoringAnalysis,
  getAllRodaProfiles,
  getRodaProfileById,
  getRodaAnalysis,
  saveRodaAnalysis,
} from "./db";
import { syncRodaProfiles } from "./syncJobMaisElas";
import { invokeLLM } from "./_core/llm";

// ─── Zod schema para uma dimensão Big Five ───────────────────────────────────
const dimensionSchema = z.object({
  name: z.string(),
  label: z.string(),
  emoji: z.string(),
  score: z.number(),
  classification: z.enum(['very_low', 'low', 'moderate', 'high', 'very_high']),
  description: z.string(),
});

// ─── Zod schema para o perfil completo ───────────────────────────────────────
const profileInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  timestamp: z.string(),
  rawResponses: z.array(z.number()),
  dimensions: z.object({
    openness: dimensionSchema,
    conscientiousness: dimensionSchema,
    extraversion: dimensionSchema,
    agreeableness: dimensionSchema,
    emotionalStability: dimensionSchema,
  }),
  combinationInsights: z.array(z.string()),
  recommendations: z.array(z.string()),
  ipip120Data: z.any().optional(),
  testVersion: z.string().optional(),
});

// ─── MAIS ELAS — Roda da Vida Profissional ───────────────────────────────────
const maisElasRouter = router({
  list: publicProcedure.query(async () => getAllRodaProfiles()),
  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => getRodaProfileById(input.id)),
  sync: publicProcedure.mutation(async () => syncRodaProfiles()),
  getAnalysis: publicProcedure.input(z.object({ profileId: z.string() })).query(async ({ input }) => getRodaAnalysis(input.profileId)),
  generateAnalysis: publicProcedure
    .input(z.object({ profileId: z.string() }))
    .mutation(async ({ input }) => {
      const profile = await getRodaProfileById(input.profileId);
      if (!profile) throw new Error('Perfil não encontrado');
      const scores = [
        { name: 'Carreira', score: profile.scoreCarreira },
        { name: 'Financeiro', score: profile.scoreFinanceiro },
        { name: 'Propósito', score: profile.scoreProposito },
        { name: 'Liderança', score: profile.scoreLideranca },
        { name: 'Relacionamentos', score: profile.scoreRelacionamentos },
        { name: 'Desenvolvimento', score: profile.scoreDesenvolvimento },
        { name: 'Saúde e Energia', score: profile.scoreSaude },
        { name: 'Equilíbrio', score: profile.scoreEquilibrio },
        { name: 'Reconhecimento', score: profile.scoreReconhecimento },
        { name: 'Autonomia', score: profile.scoreAutonomia },
      ].filter(s => s.score !== null);
      const scoresText = scores.map(s => `${s.name}: ${s.score}/10`).join('\n');
      const respostas = [
        profile.respostaEstacao && `Estação profissional: ${profile.respostaEstacao}`,
        profile.respostaDrena && `O que drena/renova: ${profile.respostaDrena}`,
        profile.respostaConquista && `Maior conquista: ${profile.respostaConquista}`,
        profile.respostaObstaculo && `Maior obstáculo: ${profile.respostaObstaculo}`,
        profile.respostaLegado && `Legado desejado: ${profile.respostaLegado}`,
        profile.respostaDimensaoAtencao && `Dimensão que precisa de atenção: ${profile.respostaDimensaoAtencao}`,
      ].filter(Boolean).join('\n');
      const prompt = `Você é uma mentora especialista em desenvolvimento humano e carreira de mulheres no agronegócio.\nAnalise o perfil da Roda da Vida Profissional de ${profile.name} e gere uma análise de mentoring estruturada em 4 blocos.\nESCORES DA RODA DA VIDA (0-10):\n${scoresText}\nRESPOSTAS ABERTAS:\n${respostas || 'Não disponíveis'}\nGere a análise em 4 blocos EXATAMENTE neste formato JSON:\n{\n  "ajudas": "Texto sobre os principais pontos fortes",\n  "oportunidades": "Texto sobre as principais oportunidades de crescimento",\n  "riscos": "Texto sobre os principais riscos e pontos de atenção",\n  "sintese": "Síntese integradora pronta para a devolutiva"\n}\nUse linguagem acolhedora, direta e profissional. Foco em mulheres do agronegócio. Sempre em português brasileiro.`;
      const response = await invokeLLM({
        messages: [
          { role: 'system', content: 'Você é uma mentora especialista em desenvolvimento humano e carreira de mulheres no agronegócio. Responda sempre em JSON válido.' },
          { role: 'user', content: prompt },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'mentoring_analysis',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                ajudas: { type: 'string' },
                oportunidades: { type: 'string' },
                riscos: { type: 'string' },
                sintese: { type: 'string' },
              },
              required: ['ajudas', 'oportunidades', 'riscos', 'sintese'],
              additionalProperties: false,
            },
          },
        },
      });
      const content = typeof response.choices[0].message.content === 'string' ? response.choices[0].message.content : JSON.stringify(response.choices[0].message.content);
      const parsed = JSON.parse(content);
      const fullAnalysis = `## Ajudas\n${parsed.ajudas}\n\n## Oportunidades\n${parsed.oportunidades}\n\n## Riscos\n${parsed.riscos}\n\n## Síntese\n${parsed.sintese}`;
      await saveRodaAnalysis({ profileId: input.profileId, ajudas: parsed.ajudas, oportunidades: parsed.oportunidades, riscos: parsed.riscos, sintese: parsed.sintese, fullAnalysis });
      return { ajudas: parsed.ajudas, oportunidades: parsed.oportunidades, riscos: parsed.riscos, sintese: parsed.sintese, fullAnalysis };
    }),
});

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  maisElas: maisElasRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ─── Perfis Big Five (banco de dados) ──────────────────────────────────────
  profiles: router({
    /** Busca todos os perfis salvos no banco */
    list: publicProcedure.query(async () => {
      const rows = await getAllBigfiveProfiles();
      // Converter de volta ao formato BigFiveProfile esperado pelo frontend
      return rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        timestamp: row.responseTimestamp,
        dimensions: row.dimensions as any,
        combinationInsights: row.combinationInsights as string[],
        recommendations: row.recommendations as string[],
        ipip120Data: row.ipip120Data as any ?? null,
        testVersion: row.testVersion ?? '30q',
      }));
    }),

    /** Salva ou atualiza um lote de perfis no banco */
    upsertBatch: publicProcedure
      .input(z.array(profileInputSchema))
      .mutation(async ({ input }) => {
        for (const profile of input) {
          await upsertBigfiveProfile({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            responseTimestamp: profile.timestamp,
            rawResponses: profile.rawResponses,
            dimensions: profile.dimensions,
            combinationInsights: profile.combinationInsights,
            recommendations: profile.recommendations,
            ipip120Data: profile.ipip120Data ?? null,
            testVersion: profile.testVersion ?? '30q',
          });
        }
        return { saved: input.length };
      }),

    /** Remove um perfil pelo ID */
    delete: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await deleteBigfiveProfile(input.id);
        return { success: true };
      }),

    /** Remove todos os perfis */
    deleteAll: publicProcedure
      .mutation(async () => {
        await deleteAllBigfiveProfiles();
        return { success: true };
      }),
    /** Remove duplicatas mantendo o perfil mais completo (IPIP-120 > 30q) */
    deduplicate: publicProcedure
      .mutation(async () => {
        const result = await deduplicateProfiles();
        return { success: true, ...result };
      }),
  }),

  // Notificação de nova resposta
  notifications: router({
    newResponse: publicProcedure
      .input(z.object({
        name: z.string(),
        email: z.string(),
        scores: z.object({
          openness: z.number(),
          conscientiousness: z.number(),
          extraversion: z.number(),
          agreeableness: z.number(),
          emotionalStability: z.number(),
        }),
      }))
      .mutation(async ({ input }) => {
        const { name, email, scores } = input;
        const scoreLines = [
          `🌿 Abertura: ${Math.round(scores.openness)}%`,
          `⚡ Conscienciosidade: ${Math.round(scores.conscientiousness)}%`,
          `☀️ Extroversão: ${Math.round(scores.extraversion)}%`,
          `💚 Agradabilidade: ${Math.round(scores.agreeableness)}%`,
          `🌊 Est. Emocional: ${Math.round(scores.emotionalStability)}%`,
        ].join('\n');

        const success = await notifyOwner({
          title: `Nova resposta Big Five: ${name}`,
          content: `${name} (${email}) acabou de completar o teste Big Five.\n\nResultados:\n${scoreLines}`,
        });

        return { success };
      }),
  }),

  // Proxy para buscar dados do Google Sheets (evita CORS no browser)
  sheets: router({
    /** Planilha original (30 questões) */
    fetchResponses: publicProcedure.query(async () => {
      const SHEET_ID = '1gStVG2NRfrQe7E2fGMU1RC2xwRd2ZGcX50oJHLeG-3U';
      const SHEET_GID = '724087005';
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

      // Seguir redirecionamentos manualmente (Google Sheets usa 307)
      let response = await fetch(csvUrl, { redirect: 'follow' });
      
      // Se ainda for redirecionamento, seguir manualmente
      if (response.status === 307 || response.status === 302 || response.status === 301) {
        const location = response.headers.get('location');
        if (location) {
          response = await fetch(location, { redirect: 'follow' });
        }
      }

      if (!response.ok) {
        throw new Error(`Erro ao buscar planilha: ${response.status} ${response.statusText}`);
      }

      const csvText = await response.text();
      if (!csvText.trim()) {
        throw new Error('Planilha vazia ou inacessível');
      }
      return { csv: csvText };
    }),
    /** Planilha IPIP-NEO-120 (120 questões) */
    fetchResponsesIPIP120: publicProcedure.query(async () => {
      const SHEET_ID = '1b--xizm9DcwfsdpQTiSqs4GdF4vX0qqqV2blIAGM04E';
      const SHEET_GID = '1081644880';
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
      let response = await fetch(csvUrl, { redirect: 'follow' });
      
      if (response.status === 307 || response.status === 302 || response.status === 301) {
        const location = response.headers.get('location');
        if (location) {
          response = await fetch(location, { redirect: 'follow' });
        }
      }
      if (!response.ok) {
        throw new Error(`Erro ao buscar planilha IPIP-120: ${response.status} ${response.statusText}`);
      }
      const csvText2 = await response.text();
      if (!csvText2.trim()) {
        throw new Error('Planilha IPIP-120 vazia ou inacessível');
      }
      return { csv: csvText2 };
    }),
  }),
  // ─── Análise de Mentoring por IA ─────────────────────────────────────────
  mentoring: router({
    /** Gera análise de mentoring via IA com base nos escores do perfil */
    generate: publicProcedure
      .input(z.object({
        profileId: z.string(),
        profileName: z.string(),
        dimensions: z.object({
          openness: z.object({ score: z.number(), classification: z.string(), label: z.string() }),
          conscientiousness: z.object({ score: z.number(), classification: z.string(), label: z.string() }),
          extraversion: z.object({ score: z.number(), classification: z.string(), label: z.string() }),
          agreeableness: z.object({ score: z.number(), classification: z.string(), label: z.string() }),
          emotionalStability: z.object({ score: z.number(), classification: z.string(), label: z.string() }),
        }),
        testVersion: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { profileId, profileName, dimensions, testVersion } = input;
        const isIPIP = testVersion === 'ipip120';

        const dimSummary = [
          `- Abertura à Experiência: ${dimensions.openness.score}% (${dimensions.openness.classification})`,
          `- Conscienciosidade: ${dimensions.conscientiousness.score}% (${dimensions.conscientiousness.classification})`,
          `- Extroversão: ${dimensions.extraversion.score}% (${dimensions.extraversion.classification})`,
          `- Agradabilidade: ${dimensions.agreeableness.score}% (${dimensions.agreeableness.classification})`,
          `- Estabilidade Emocional: ${dimensions.emotionalStability.score}% (${dimensions.emotionalStability.classification})`,
        ].join('\n');

        const prompt = `Você é uma especialista em mentoring de desenvolvimento humano com profundo conhecimento no modelo Big Five de personalidade e na metodologia FPC (Formação de Pessoas e Carreiras).

Analise o perfil de personalidade abaixo e gere uma análise estruturada para apoiar a sessão de mentoring. O perfil é de ${isIPIP ? 'teste IPIP-NEO-120 (subfacetas medidas diretamente)' : 'teste de 30 questões (dimensões gerais)'}.

**Nome:** ${profileName}

**Escores Big Five:**
${dimSummary}

Gere a análise em português brasileiro, no seguinte formato JSON exato:
{
  "ajudas": "Texto em markdown com os 4-5 principais pontos de ajuda para o mentorado. Cada ponto deve ter título em negrito e 2-3 parágrafos explicando o que trabalhar, como a dimensão se manifesta e qual a abordagem de mentoring recomendada. Use linguagem da FPC quando relevante.",
  "oportunidades": "Texto em markdown com as 3-4 principais oportunidades de desenvolvimento e crescimento. Inclua potenciais de carreira, liderança, comunicação e adaptabilidade.",
  "riscos": "Texto em markdown com os 4-5 principais riscos e pontos de atenção. Seja específico sobre como cada risco se manifesta no dia a dia.",
  "sintese": "Uma síntese de 3-4 linhas, direta e poderosa, pronta para ser usada na devolutiva oral. Deve capturar a essência do perfil em linguagem de mentoring."
}

Importante: seja específico, use os escores reais, conecte as dimensões entre si quando relevante, e mantenha linguagem profissional de mentoring.`;

        const response = await invokeLLM({
          messages: [
            { role: 'system', content: 'Você é especialista em mentoring de desenvolvimento humano e Big Five. Responda sempre em JSON válido.' },
            { role: 'user', content: prompt },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'mentoring_analysis',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  ajudas: { type: 'string' },
                  oportunidades: { type: 'string' },
                  riscos: { type: 'string' },
                  sintese: { type: 'string' },
                },
                required: ['ajudas', 'oportunidades', 'riscos', 'sintese'],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content as string;
        const parsed = JSON.parse(content);

        const fullAnalysis = `## Principais Ajudas\n\n${parsed.ajudas}\n\n## Principais Oportunidades\n\n${parsed.oportunidades}\n\n## Principais Riscos\n\n${parsed.riscos}\n\n## Síntese para Devolutiva\n\n${parsed.sintese}`;

        await saveMentoringAnalysis({
          profileId,
          ajudas: parsed.ajudas,
          oportunidades: parsed.oportunidades,
          riscos: parsed.riscos,
          sintese: parsed.sintese,
          fullAnalysis,
        });

        return { ajudas: parsed.ajudas, oportunidades: parsed.oportunidades, riscos: parsed.riscos, sintese: parsed.sintese, fullAnalysis };
      }),

    /** Busca análise de mentoring salva para um perfil */
    get: publicProcedure
      .input(z.object({ profileId: z.string() }))
      .query(async ({ input }) => {
        return getMentoringAnalysis(input.profileId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
