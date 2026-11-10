import { createPdfAttachmentResponse } from "@/features/pdf/services/pdf-generator";
import { shareOutcomeErrorResponse } from "@/features/sharing/lib/responses";
import { shareTokenSchema } from "@/features/sharing/schemas/share-schema";
import { getPublicSharedInvoicePdf } from "@/features/sharing/services/shares";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { token } = await params;
  const parsed = shareTokenSchema.safeParse(token);
  if (!parsed.success) {
    return shareOutcomeErrorResponse("not-found");
  }

  try {
    const result = await getPublicSharedInvoicePdf(parsed.data);

    if (result.outcome !== "ok") {
      return shareOutcomeErrorResponse(result.outcome);
    }

    return createPdfAttachmentResponse(result.pdfBytes, result.invoiceNumber);
  } catch (error) {
    console.error("Failed to generate shared invoice PDF:", error);
    return Response.json(
      { error: "Failed to generate invoice PDF" },
      { status: 500 },
    );
  }
}

