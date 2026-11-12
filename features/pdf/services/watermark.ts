import { degrees, type PDFPage, type PDFFont } from "pdf-lib";
import { PDF_COLORS } from "./helpers";
import type { InvoiceStatus } from "@/features/invoices/types/invoice";

/** Draws a diagonal translucent status watermark (`PAID`, `OVERDUE`, or `DRAFT`) across a PDF page. */
export function renderWatermark(
  page: PDFPage,
  font: PDFFont,
  status: InvoiceStatus,
  centerY?: number,
) {
  let text = "";
  let color = PDF_COLORS.muted;

  if (status === "paid") {
    text = "PAID";
    color = PDF_COLORS.paid;
  } else if (status === "overdue") {
    text = "OVERDUE";
    color = PDF_COLORS.overdue;
  } else if (status === "draft") {
    text = "DRAFT";
    color = PDF_COLORS.draft;
  } else {
    // Pending without being overdue does not show an intrusive watermark
    return;
  }

  const { width, height } = page.getSize();
  const fontSize = 58;
  const textWidth = font.widthOfTextAtSize(text, fontSize);
  const targetY = centerY ?? height / 2;

  // Position in center rotated diagonally
  page.drawText(text, {
    x: (width - textWidth) / 2 + 30,
    y: targetY - 20,
    size: fontSize,
    font,
    color,
    opacity: 0.18,
    rotate: degrees(-30),
  });
}
