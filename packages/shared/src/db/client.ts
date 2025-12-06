/**
 * Database client for Veterans First application
 * Uses Drizzle ORM with PostgreSQL (Supabase)
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is required. " +
      "See .env.example for the connection string format.",
  );
}

// CRITICAL: Disable prefetch (prepare) for Supabase Transaction pool mode
// This is required because Transaction pooling doesn't support prepared statements
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
