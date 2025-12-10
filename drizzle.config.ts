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
  schema: "./packages/shared/src/db/schema.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionUrl,
  },
});
