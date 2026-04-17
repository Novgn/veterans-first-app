/**
 * Database module barrel export
 * Re-exports schema definitions, types, client, and queries
 */
export * from "./schema";
export { db, client, getDb, type DbClient } from "./client";
export * from "./queries";
