import { getSessionUser } from "@/features/auth/lib/session";
import {
  getBrandingLogo,
  getBrandingSettings,
} from "@/features/branding/services/branding";
import {
  getInvoice,
  logInvoiceDownloadEvent,
} from "@/features/invoices/services/invoices";
import { generateInvoicePdf } from "@/features/pdf/services/pdf-generator";
import type { LogoData } from "@/features/pdf/types/pdf";

type RouteContext = { params: Promise<{ id: string }> };

const DATA_URL_PATTERN = /^data:(image\/(?:png|jpeg|jpg|webp|svg\+xml));base64,(.+)$/i;

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

    // Extract logo bytes for PNG/JPEG; fallback to text for SVG/WebP or invalid data
    let logo: LogoData | null = null;
    if (rawLogo?.dataUrl) {
      const match = DATA_URL_PATTERN.exec(rawLogo.dataUrl);
      if (match) {
        const mime = match[1].toLowerCase();
        const base64 = match[2];
        const bytes = new Uint8Array(Buffer.from(base64, "base64"));

        if (mime === "image/png") {
          logo = { bytes, type: "png" };
        } else if (mime === "image/jpeg" || mime === "image/jpg") {
          logo = { bytes, type: "jpeg" };
        }
        // SVG and WebP gracefully remain null, triggering styled text fallback
      }
    }

    const pdfBytes = await generateInvoicePdf({
      invoice,
      branding,
      logo,
      template: invoice.pdfTemplate,
    });

    // Append to audit trail
    await logInvoiceDownloadEvent(user.id, invoice.id, invoice.invoiceNumber);

    const filename = `${invoice.invoiceNumber}.pdf`;

    return new Response(pdfBytes as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBytes.byteLength),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Failed to generate invoice PDF:", error);
    return Response.json(
      { error: "Failed to generate invoice PDF" },
      { status: 500 },
    );
  }
}

