import { auth } from "@/features/auth/lib/server";

/** Delegates Better Auth GET and POST requests to Neon Auth handlers. */
export const { GET, POST } = auth.handler();
