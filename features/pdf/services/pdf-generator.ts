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
