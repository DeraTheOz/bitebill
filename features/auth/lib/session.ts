import "server-only";

import { auth } from "./server";

/**
 * Returns the authenticated Better Auth user for the current request,
 * or null when there is no valid session. Every data-owning route
 * handler must resolve the user through this helper and scope queries
 * by its id. Never trust ids from the client.
 */
export async function getSessionUser() {
  const { data: session } = await auth.getSession();
  return session?.user ?? null;
}
