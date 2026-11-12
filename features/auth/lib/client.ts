"use client";

import { createAuthClient } from "@neondatabase/auth/next";

/** Browser-side Neon Better Auth client used for client authentication actions. */
export const authClient = createAuthClient();
