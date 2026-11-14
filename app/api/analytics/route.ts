import { getSessionUser } from "@/features/auth/lib/session";
import { analyticsQuerySchema } from "@/features/analytics/schemas/analytics-schema";
import { getAnalyticsData } from "@/features/analytics/services/analytics";

export const dynamic = "force-dynamic";

/**
 * Handles GET requests to retrieve business intelligence analytics, trends, client rankings, and AR aging.
 *
 * @param request - Incoming Next.js HTTP request.
 * @returns JSON response containing analytics dataset or error payload.
 */
export async function GET(request: Request): Promise<Response> {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rawRange = searchParams.get("range") || "6m";

  const parsed = analyticsQuerySchema.safeParse({ range: rawRange });
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid range parameter", details: parsed.error.format() },
      { status: 400 },
    );
  }

  try {
    const data = await getAnalyticsData(user.id, parsed.data.range);
    return Response.json(data);
  } catch (error) {
    console.error("Failed to retrieve analytics data:", error);
    return Response.json(
      { error: "Failed to retrieve analytics data" },
      { status: 500 },
    );
  }
}

