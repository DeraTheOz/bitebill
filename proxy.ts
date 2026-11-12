import { NextRequest } from "next/server";
import { auth } from "@/features/auth/lib/server";

const authMiddleware = auth.middleware({ loginUrl: "/auth/sign-in" });

/** Runs Neon Auth session middleware on protected routes while bypassing Next Server Action requests. */
export default async function middleware(request: NextRequest) {
  if (request.headers.has("Next-Action")) return;
  return authMiddleware(request);
}

export const config = {
  matcher: [
    "/onboarding/:path*",
    "/dashboard/:path*",
    "/clients/:path*",
    "/invoices/:path*",
    "/recurring-invoices/:path*",
    "/settings/:path*",
  ],
};
