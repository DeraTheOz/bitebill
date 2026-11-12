import { auth } from "@/features/auth/lib/server";
import type { LandingUser } from "./types";

/** Returns minimal user identity for the marketing landing page header, or `null` when signed out. */
export async function getLandingUser(): Promise<LandingUser | null> {
  const { data: session } = await auth.getSession();

  if (!session) return null;

  return {
    name: session.user.name,
    email: session.user.email,
  };
}
