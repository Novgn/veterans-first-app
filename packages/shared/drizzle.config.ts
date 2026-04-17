import { defineConfig } from "drizzle-kit";
import "dotenv/config";

// CRITICAL: Use direct connection for migrations, NOT transaction pooler
// Transaction pooler (port 6543) doesn't support prepared statements needed for DDL
// Direct connection (port 5432) is required for schema migrations
const connectionUrl = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;

if (!connectionUrl) {
  throw new Error(
    "Database connection URL required for migrations.\n" +
      "Set DATABASE_URL_DIRECT (recommended) or DATABASE_URL in your environment.\n" +
      "See .env.example for the connection string format.\n" +
      "Use direct connection (port 5432) for migrations, not transaction pooler (port 6543)."
  );
}

export default defineConfig({
  // Paths are relative to this config file (packages/shared/drizzle.config.ts).
  // The schema lives alongside this config; migrations stay under
  // ../../supabase/migrations because the Supabase CLI (used by `supabase
  // start` in CI and local dev) reads from that fixed path. Drizzle Kit
  // generate/migrate writes to the same location so both tools agree.
  schema: "./src/db/schema.ts",
  out: "../../supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionUrl,
  },
  verbose: true,
  strict: true,
});
