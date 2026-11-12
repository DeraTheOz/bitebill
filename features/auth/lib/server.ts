import { createNeonAuth } from "@neondatabase/auth/next/server";

/** Server-side Neon Managed Better Auth instance configured from environment secrets. */
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});
