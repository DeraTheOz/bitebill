import type { PDFDocument } from "pdf-lib";
import type { TemplateRenderContext } from "../../types/pdf";
import { renderInvoiceTemplate } from "./base-template";

/**
 * Modern Template
 *
 * Renders the Modern invoice design matching the onboarding preview:
 * - Vibrant full brand-color header banner across the top of the card
 * - Header text automatically formatted for high contrast (white or ink)
 * - Translucent white 2-tone logo badge with white BiteBill SVG logo mark
 * - Highlighted Total amount in the brand's primary accent color
 * - Clean structured line items with subtotals, tax, and dashed terms
 */
export async function renderModernTemplate(
  pdfDoc: PDFDocument,
  context: TemplateRenderContext,
) {
  return renderInvoiceTemplate(pdfDoc, context, "modern");
}

