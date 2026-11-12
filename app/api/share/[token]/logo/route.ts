import { createLogoImageResponse } from "@/features/branding/lib/logo";
import { shareOutcomeErrorResponse } from "@/features/sharing/lib/responses";
import { shareTokenSchema } from "@/features/sharing/schemas/share-schema";
import { getPublicSharedInvoiceLogo } from "@/features/sharing/services/shares";

type RouteContext = { params: Promise<{ token: string }> };

/** Serves the branding logo associated with a valid public invoice share link. */
export async function GET(_request: Request, { params }: RouteContext) {
  const { token } = await params;
  const parsed = shareTokenSchema.safeParse(token);
  if (!parsed.success) {
    return shareOutcomeErrorResponse("not-found");
  }

  try {
    const result = await getPublicSharedInvoiceLogo(parsed.data);

    if (result.outcome === "no-logo") {
      return Response.json({ error: "No logo" }, { status: 404 });
    }
    if (result.outcome !== "ok") {
      return shareOutcomeErrorResponse(result.outcome);
    }

    const response = createLogoImageResponse(
      result.logo,
      "public, max-age=300",
    );
    if (!response) {
      console.error("Stored logo is not a valid data URL");
      return Response.json({ error: "Invalid logo" }, { status: 500 });
    }

    return response;
  } catch (error) {
    console.error("Failed to load shared invoice logo:", error);
    return Response.json({ error: "Failed to load logo" }, { status: 500 });
  }
}

