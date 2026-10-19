import { auth } from "@/features/auth/lib/server";

export async function GET() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ user: session.user });
}
