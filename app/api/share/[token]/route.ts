import { getSessionUser } from "@/features/auth/lib/session";
import { shareOutcomeErrorResponse } from "@/features/sharing/lib/responses";
import { shareTokenSchema } from "@/features/sharing/schemas/share-schema";
import { getPublicSharedInvoice } from "@/features/sharing/services/shares";

type RouteContext = { params: Promise<{ token: string }> };

/** Returns sanitized public invoice data for a valid, unexpired share token. */
export async function GET(_request: Request, { params }: RouteContext) {
  const { token } = await params;
  const parsed = shareTokenSchema.safeParse(token);
  if (!parsed.success) {
    return shareOutcomeErrorResponse("not-found");
  }

  try {
    const sessionUser = await getSessionUser();
    const result = await getPublicSharedInvoice(parsed.data, sessionUser?.id);

    if (result.outcome !== "ok") {
      return shareOutcomeErrorResponse(result.outcome);
    }

    return Response.json(result.data, {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Failed to load shared invoice:", error);
    return Response.json(
      { error: "Failed to load shared invoice" },
      { status: 500 },
    );
  }
}

