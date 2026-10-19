import { auth } from "@/features/auth/lib/server";
import type { LandingUser } from "./types";

export async function getLandingUser(): Promise<LandingUser | null> {
  const { data: session } = await auth.getSession();

  if (!session) return null;

  return {
    name: session.user.name,
    email: session.user.email,
  };
}
