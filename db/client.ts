import "server-only";

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
/** Drizzle ORM client connected to Neon PostgreSQL via HTTP driver. */
export const db = drizzle(sql, { schema });
