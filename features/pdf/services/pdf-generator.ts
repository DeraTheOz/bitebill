import { PDFDocument } from "pdf-lib";
import type { GeneratePdfOptions } from "../types/pdf";
import type { PdfTemplate } from "@/features/branding/types/branding";
import { renderClassicTemplate } from "./templates/classic";
import { renderModernTemplate } from "./templates/modern";
import { renderCorporateTemplate } from "./templates/corporate";

export async function generateInvoicePdf(
  options: GeneratePdfOptions,
): Promise<Uint8Array> {
  const { invoice, branding, logo } = options;

  const pdfDoc = await PDFDocument.create();

  // Set standard PDF document metadata
  pdfDoc.setTitle(`Invoice #${invoice.invoiceNumber}`);
  pdfDoc.setAuthor(branding.businessName);
  pdfDoc.setSubject(`Invoice for ${invoice.client?.name ?? "Customer"}`);
  pdfDoc.setProducer("BiteBill Invoicing (https://bitebill.vercel.app)");
  pdfDoc.setCreationDate(new Date(invoice.createdAt));
  pdfDoc.setModificationDate(new Date(invoice.updatedAt));

  const template: PdfTemplate =
    options.template ??
    ((invoice as { pdfTemplate?: PdfTemplate }).pdfTemplate as PdfTemplate) ??
    branding.defaultPdfTemplate ??
    "classic";

  const context = { invoice, branding, logo };

  switch (template) {
    case "modern":
      await renderModernTemplate(pdfDoc, context);
      break;
    case "corporate":
      await renderCorporateTemplate(pdfDoc, context);
      break;
    case "classic":
    default:
      await renderClassicTemplate(pdfDoc, context);
      break;
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

/**
 * Wraps generated PDF bytes in a non-cacheable attachment download response.
 */
export function createPdfAttachmentResponse(
  pdfBytes: Uint8Array,
  invoiceNumber: string,
): Response {
  const safeName = invoiceNumber.replace(/[^A-Za-z0-9._-]/g, "_");
  const filename = `${safeName}.pdf`;

  return new Response(pdfBytes as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(pdfBytes.byteLength),
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  });
}
