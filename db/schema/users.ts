import { pgSchema, uuid } from "drizzle-orm/pg-core";

// Neon Managed Better Auth owns these tables in the `neon_auth` schema
// (`user`, `session`, `account`, …). This minimal stub exists ONLY so
// our tables can declare foreign keys and infer relation types. It is
// never created by our migrations. Do not add columns without first
// confirming they match Better Auth's actual schema (verified via
// information_schema on the live database).
const neonAuth = pgSchema("neon_auth");

export const users = neonAuth.table("user", {
  // neon_auth."user".id is uuid, NOT text.
  id: uuid("id").primaryKey(),
});
