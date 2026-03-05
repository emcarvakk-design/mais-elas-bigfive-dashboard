import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import { z } from "zod";

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
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
