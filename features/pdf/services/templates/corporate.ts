import type { PDFDocument } from "pdf-lib";
import type { TemplateRenderContext } from "../../types/pdf";
import { renderInvoiceTemplate } from "./base-template";

/**
 * Corporate Template
 *
 * Renders the Corporate invoice design matching the onboarding preview:
 * - Thick 5pt dark sidebar bar running down the entire left edge (matching `border-l-4 border-l-sidebar`)
 * - Subtle surface background (`#f9fafe`) in the header
 * - 2-tone brand color logo badge with the white BiteBill SVG logo mark
 * - Clean structured line items with subtotals, tax, and dashed terms
 */
export async function renderCorporateTemplate(
  pdfDoc: PDFDocument,
  context: TemplateRenderContext,
) {
  return renderInvoiceTemplate(pdfDoc, context, "corporate");
}

