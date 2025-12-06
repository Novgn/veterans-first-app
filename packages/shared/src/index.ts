/**
 * @veterans-first/shared
 *
 * Shared types, utilities, API client, hooks, and database access for Veterans First application
 */

// Types (includes DB types: User, NewUser, AuditLog, NewAuditLog)
export * from "./types";

// NOTE: Database client is NOT exported from main barrel to avoid eager connection.
// Import directly from "@veterans-first/shared/db" when you need the db client.
// Schema types are available via "./types" re-export above.

// API
export * from "./api";

// Utils
export * from "./utils";

// Hooks
export * from "./hooks";
