import { eq } from "drizzle-orm";
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
 * Upsert um perfil Big Five.
 * Usa o email como chave de deduplicação: se já existir um perfil com o mesmo
 * email, atualiza todos os campos (resposta mais recente prevalece).
 */
export async function upsertBigfiveProfile(profile: InsertBigfiveProfile): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert bigfive profile: database not available");
    return;
  }
  try {
    await db.insert(bigfiveProfiles).values(profile).onDuplicateKeyUpdate({
      set: {
        name: profile.name,
        email: profile.email,
        responseTimestamp: profile.responseTimestamp,
        rawResponses: profile.rawResponses,
        dimensions: profile.dimensions,
        combinationInsights: profile.combinationInsights,
        recommendations: profile.recommendations,
        updatedAt: new Date(),
      },
    });
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
