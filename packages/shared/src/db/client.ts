// Drizzle client factory for veterans-first.
//
// Two access patterns are supported:
//
//   1. `getDb()` — lazy-initialized factory (rell-template style).
//      Reads `DATABASE_URL` and opens the connection pool on first
//      call; subsequent calls reuse the same pool. Importing this
//      module does NOT touch the database, so `next build` and other
//      non-runtime contexts work without the env var set.
//
//   2. `db` / `client` — eagerly-initialized singletons (legacy).
//      Throws on first read of `db` if `DATABASE_URL` is missing.
//      Kept for backwards compatibility with existing consumers; new
//      code should prefer `getDb()`.
//
// `prepare: false` disables prepared statements for compatibility with
// Supabase pgbouncer in transaction mode (no session-level state).

import "dotenv/config";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

type SchemaType = typeof schema;
type DrizzleDb = PostgresJsDatabase<SchemaType>;

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env at the repo root " +
        "and fill in the Supabase connection string."
    );
  }
  return url;
}

let cachedDb: DrizzleDb | null = null;

/**
 * Lazy-initialized Drizzle client. Opens the connection pool on the
 * first call and reuses it thereafter. Safe to import without a DB env.
 */
export function getDb(): DrizzleDb {
  if (cachedDb === null) {
    const queryClient = postgres(getDatabaseUrl(), { prepare: false });
    cachedDb = drizzle(queryClient, { schema });
  }
  return cachedDb;
}

export type DbClient = DrizzleDb;

// Legacy eager singleton — throws if DATABASE_URL is missing at
// module-load time. Prefer `getDb()` for new code, which defers the
// connection until first use.
export const client = postgres(getDatabaseUrl(), { prepare: false });
export const db = drizzle(client, { schema });
