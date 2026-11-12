import { getSessionUser } from "@/features/auth/lib/session";
import { toPdfLogoData } from "@/features/branding/lib/logo";
import {
  getBrandingLogo,
  getBrandingSettings,
} from "@/features/branding/services/branding";
import {
  getInvoice,
  logInvoiceDownloadEvent,
} from "@/features/invoices/services/invoices";
import {
  createPdfAttachmentResponse,
  generateInvoicePdf,
} from "@/features/pdf/services/pdf-generator";

type RouteContext = { params: Promise<{ id: string }> };

/** Generates and downloads a PDF for an owned invoice, appending a download audit event. */
export async function GET(_request: Request, { params }: RouteContext) {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const invoice = await getInvoice(user.id, id);
    if (!invoice) {
      return Response.json({ error: "Invoice not found" }, { status: 404 });
    }

    const [branding, rawLogo] = await Promise.all([
      getBrandingSettings(user.id),
      getBrandingLogo(user.id),
    ]);

    if (!branding) {
      return Response.json(
        { error: "Branding settings not found" },
        { status: 400 },
      );
    }

    const pdfBytes = await generateInvoicePdf({
      invoice,
      branding,
      logo: toPdfLogoData(rawLogo),
      template: invoice.pdfTemplate,
    });

    // Append to audit trail
    await logInvoiceDownloadEvent(user.id, invoice.id, invoice.invoiceNumber);

    return createPdfAttachmentResponse(pdfBytes, invoice.invoiceNumber);
  } catch (error) {
    console.error("Failed to generate invoice PDF:", error);
    return Response.json(
      { error: "Failed to generate invoice PDF" },
      { status: 500 },
    );
  }
}
