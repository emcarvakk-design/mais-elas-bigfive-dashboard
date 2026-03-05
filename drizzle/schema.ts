import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de perfis Big Five.
 * Armazena os resultados do teste de personalidade de cada respondente.
 * O campo `dimensions` armazena o JSON completo calculado pelo frontend.
 * O campo `sourceEmail` é usado como chave de deduplicação — cada email
 * corresponde a um único perfil (o mais recente sobrescreve o anterior).
 */
export const bigfiveProfiles = mysqlTable("bigfive_profiles", {
  id: varchar("id", { length: 64 }).primaryKey(), // nanoid gerado no frontend
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  /** Timestamp original da resposta no Google Forms (string ISO ou formato BR) */
  responseTimestamp: varchar("responseTimestamp", { length: 64 }).notNull(),
  /** Respostas brutas (array de 30 números 1-5) para recalcular se necessário */
  rawResponses: json("rawResponses").$type<number[]>().notNull(),
  /** Dimensões calculadas (objeto com openness, conscientiousness, etc.) */
  dimensions: json("dimensions").notNull(),
  /** Insights de combinação de traços */
  combinationInsights: json("combinationInsights").$type<string[]>().notNull(),
  /** Recomendações geradas */
  recommendations: json("recommendations").$type<string[]>().notNull(),
  /** Quando o perfil foi salvo no banco */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BigfiveProfile = typeof bigfiveProfiles.$inferSelect;
export type InsertBigfiveProfile = typeof bigfiveProfiles.$inferInsert;
