import { eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, InsertBigfiveProfile, bigfiveProfiles, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Big Five Profiles ───────────────────────────────────────────────────────

/**
 * Retorna o "peso" de completude de um perfil.
 * IPIP-120 (com subfacetas) = 2, 30q = 1
 */
function profileCompleteness(testVersion?: string | null): number {
  return testVersion === 'ipip120' ? 2 : 1;
}

/**
 * Gera o ID canônico baseado no email (sem prefixo).
 * Usado para buscar duplicatas independentemente do prefixo histórico.
 */
function canonicalIdFromEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  return Buffer.from(normalized).toString('base64').replace(/[+/=]/g, c => ({ '+': '-', '/': '_', '=': '' }[c] ?? c));
}

/**
 * Upsert um perfil Big Five com prioridade para o mais completo.
 * Regras:
 *   1. IPIP-120 sempre prevalece sobre 30q.
 *   2. Se ambos forem do mesmo tipo, o mais recente prevalece.
 *   3. Deduplicação por email: busca todos os IDs possíveis para o email
 *      (com ou sem prefixo bf_/ipip_) e mantém apenas um registro canônico.
 */
export async function upsertBigfiveProfile(profile: InsertBigfiveProfile): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert bigfive profile: database not available");
    return;
  }
  try {
    const canonicalId = canonicalIdFromEmail(profile.email);
    const possibleIds = [
      canonicalId,
      'ipip_' + canonicalId,
      'bf_' + canonicalId,
    ];

    // Buscar todos os registros existentes para esse email (por ID ou email direto)
    const existing = await db
      .select()
      .from(bigfiveProfiles)
      .where(or(
        eq(bigfiveProfiles.email, profile.email.trim().toLowerCase()),
        eq(bigfiveProfiles.id, possibleIds[0]),
        eq(bigfiveProfiles.id, possibleIds[1]),
        eq(bigfiveProfiles.id, possibleIds[2]),
      ));

    const incomingWeight = profileCompleteness(profile.testVersion);

    if (existing.length === 0) {
      // Nenhum registro — inserir com ID canônico
      await db.insert(bigfiveProfiles).values({
        ...profile,
        id: canonicalId,
        email: profile.email.trim().toLowerCase(),
      });
      return;
    }

    // Encontrar o registro mais completo/recente entre os existentes
    const best = existing.reduce((a, b) => {
      const wa = profileCompleteness(a.testVersion);
      const wb = profileCompleteness(b.testVersion);
      if (wa !== wb) return wa > wb ? a : b;
      // Mesmo tipo: mais recente
      const ta = new Date(a.updatedAt ?? a.createdAt).getTime();
      const tb = new Date(b.updatedAt ?? b.createdAt).getTime();
      return ta >= tb ? a : b;
    });

    const bestWeight = profileCompleteness(best.testVersion);

    // Remover todos os registros duplicados (exceto o melhor)
    const idsToDelete = existing.filter(r => r.id !== best.id).map(r => r.id);
    for (const idToDelete of idsToDelete) {
      await db.delete(bigfiveProfiles).where(eq(bigfiveProfiles.id, idToDelete));
    }

    // Decidir se atualiza: só atualiza se o incoming for mais completo,
    // ou do mesmo tipo e mais recente
    const shouldUpdate = incomingWeight > bestWeight || (
      incomingWeight === bestWeight
    );

    if (shouldUpdate) {
      // Garantir que o ID final seja o canônico
      if (best.id !== canonicalId) {
        // Deletar o registro com ID antigo e inserir com ID canônico
        await db.delete(bigfiveProfiles).where(eq(bigfiveProfiles.id, best.id));
        await db.insert(bigfiveProfiles).values({
          ...profile,
          id: canonicalId,
          email: profile.email.trim().toLowerCase(),
        });
      } else {
        await db.update(bigfiveProfiles)
          .set({
            name: profile.name,
            email: profile.email.trim().toLowerCase(),
            responseTimestamp: profile.responseTimestamp,
            rawResponses: profile.rawResponses,
            dimensions: profile.dimensions,
            combinationInsights: profile.combinationInsights,
            recommendations: profile.recommendations,
            ipip120Data: profile.ipip120Data ?? null,
            testVersion: profile.testVersion ?? '30q',
            updatedAt: new Date(),
          })
          .where(eq(bigfiveProfiles.id, best.id));
      }
    } else {
      // Incoming é menos completo — apenas normalizar o ID se necessário
      if (best.id !== canonicalId) {
        await db.delete(bigfiveProfiles).where(eq(bigfiveProfiles.id, best.id));
        await db.insert(bigfiveProfiles).values({
          ...best,
          id: canonicalId,
          email: best.email.trim().toLowerCase(),
        });
      }
    }
  } catch (error) {
    console.error("[Database] Failed to upsert bigfive profile:", error);
    throw error;
  }
}

/** Busca todos os perfis, ordenados do mais recente para o mais antigo. */
export async function getAllBigfiveProfiles() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get bigfive profiles: database not available");
    return [];
  }
  return db.select().from(bigfiveProfiles).orderBy(bigfiveProfiles.createdAt);
}

/** Busca um perfil pelo ID. */
export async function getBigfiveProfileById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bigfiveProfiles).where(eq(bigfiveProfiles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/** Remove um perfil pelo ID. */
export async function deleteBigfiveProfile(id: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(bigfiveProfiles).where(eq(bigfiveProfiles.id, id));
}

/** Remove todos os perfis. */
export async function deleteAllBigfiveProfiles() {
  const db = await getDb();
  if (!db) return;
  await db.delete(bigfiveProfiles);
}

/**
 * Limpa duplicatas no banco: para cada email com múltiplos registros,
 * mantém apenas o mais completo (IPIP-120 > 30q) e mais recente.
 * Normaliza todos os IDs para o formato canônico.
 */
export async function deduplicateProfiles(): Promise<{ removed: number; normalized: number }> {
  const db = await getDb();
  if (!db) return { removed: 0, normalized: 0 };

  const all = await db.select().from(bigfiveProfiles);

  // Agrupar por email normalizado
  const byEmail = new Map<string, typeof all>();
  for (const row of all) {
    const key = row.email.trim().toLowerCase();
    if (!byEmail.has(key)) byEmail.set(key, []);
    byEmail.get(key)!.push(row);
  }

  let removed = 0;
  let normalized = 0;

  for (const [email, rows] of Array.from(byEmail.entries())) {
    const canonicalId = canonicalIdFromEmail(email);

    // Encontrar o melhor registro
    type ProfileRow = (typeof rows)[number];
    const best = rows.reduce((a: ProfileRow, b: ProfileRow) => {
      const wa = profileCompleteness(a.testVersion);
      const wb = profileCompleteness(b.testVersion);
      if (wa !== wb) return wa > wb ? a : b;
      const ta = new Date(a.updatedAt ?? a.createdAt).getTime();
      const tb = new Date(b.updatedAt ?? b.createdAt).getTime();
      return ta >= tb ? a : b;
    });

    // Remover os demais
    for (const row of rows) {
      if (row.id !== best.id) {
        await db.delete(bigfiveProfiles).where(eq(bigfiveProfiles.id, row.id));
        removed++;
      }
    }

    // Normalizar o ID do melhor para o canônico
    if (best.id !== canonicalId) {
      await db.delete(bigfiveProfiles).where(eq(bigfiveProfiles.id, best.id));
      await db.insert(bigfiveProfiles).values({ ...best, id: canonicalId, email });
      normalized++;
    }
  }

  return { removed, normalized };
}

// ─── Mentoring Analyses ──────────────────────────────────────────────────────

import { mentoringAnalyses, InsertMentoringAnalysis } from "../drizzle/schema";

/** Salva ou atualiza a análise de mentoring gerada por IA para um perfil. */
export async function saveMentoringAnalysis(data: InsertMentoringAnalysis): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save mentoring analysis: database not available");
    return;
  }
  try {
    // Verificar se já existe análise para este perfil
    const existing = await db
      .select()
      .from(mentoringAnalyses)
      .where(eq(mentoringAnalyses.profileId, data.profileId))
      .limit(1);

    if (existing.length > 0) {
      await db.update(mentoringAnalyses)
        .set({
          ajudas: data.ajudas,
          oportunidades: data.oportunidades,
          riscos: data.riscos,
          sintese: data.sintese,
          fullAnalysis: data.fullAnalysis,
          updatedAt: new Date(),
        })
        .where(eq(mentoringAnalyses.profileId, data.profileId));
    } else {
      await db.insert(mentoringAnalyses).values(data);
    }
  } catch (error) {
    console.error("[Database] Failed to save mentoring analysis:", error);
    throw error;
  }
}

/** Busca a análise de mentoring de um perfil pelo profileId. */
export async function getMentoringAnalysis(profileId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(mentoringAnalyses)
    .where(eq(mentoringAnalyses.profileId, profileId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}
