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
} from "./db";

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

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
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
      const SHEET_ID = '1gnBms78OFB2AqMjVjHSuZaT-Kg0qYqGmomPAWjDpWxI';
      const SHEET_GID = '1030652843';
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

      const csvText = await response.text();
      if (!csvText.trim()) {
        throw new Error('Planilha IPIP-120 vazia ou inacessível');
      }

      return { csv: csvText };
    }),
  }),
});

export type AppRouter = typeof appRouter;
