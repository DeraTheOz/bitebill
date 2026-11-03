import type { PDFDocument } from "pdf-lib";
import type { TemplateRenderContext } from "../../types/pdf";
import { renderInvoiceTemplate } from "./base-template";

/**
 * Classic Template
 *
 * Renders the Classic invoice design matching the onboarding preview:
 * - Clean white card frame with 1pt border
 * - White header with subtle bottom divider
 * - 2-tone brand color logo badge with the white BiteBill SVG logo mark
 * - Elegant typography with dark ink text and muted metadata
 * - Structured line items table with subtotals, tax, and total
 * - Dashed divider for terms and conditions
 */
export async function renderClassicTemplate(
  pdfDoc: PDFDocument,
  context: TemplateRenderContext,
) {
  return renderInvoiceTemplate(pdfDoc, context, "classic");
}

