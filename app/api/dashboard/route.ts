import { getSessionUser } from "@/features/auth/lib/session";
import { getDashboardData } from "@/features/dashboard/services/dashboard";

export const dynamic = "force-dynamic";

/** Returns revenue analytics, status counts, and trend series for the requested period. */
export async function GET(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "6m";

  try {
    const data = await getDashboardData(user.id, period);
    return Response.json(data);
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
    return Response.json(
      { error: "Failed to load dashboard data" },
      { status: 500 },
    );
  }
}

