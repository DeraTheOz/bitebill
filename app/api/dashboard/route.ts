import { getSessionUser } from "@/features/auth/lib/session";
import { getDashboardData } from "@/features/dashboard/services/dashboard";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getDashboardData(user.id);
    return Response.json(data);
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
    return Response.json(
      { error: "Failed to load dashboard data" },
      { status: 500 },
    );
  }
}

