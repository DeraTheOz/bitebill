import {
  type PDFDocument,
  type PDFImage,
  StandardFonts,
} from "pdf-lib";
import type { TemplateRenderContext } from "../../types/pdf";
import {
  formatPdfCurrency,
  formatPdfDate,
  hexToRgb,
  PDF_COLORS,
  sanitizePdfText,
  wrapText,
} from "../helpers";
import { renderWatermark } from "../watermark";
import {
  DEFAULT_BRAND_COLOR,
  lightenHex,
  readableOnWhite,
  readableTextColor,
} from "@/features/branding/lib/brand-colors";

export const BITEBILL_LOGO_SVG_PATH =
  "M10.6942 0L20 18.7078L29.3058 0C35.6645 3.34856 40 10.0219 40 17.7078C40 28.7535 31.0457 37.7078 20 37.7078C8.9543 37.7078 0 28.7535 0 17.7078C0 10.0219 4.33546 3.34856 10.6942 0Z";

export type InvoiceTemplateType = "classic" | "modern" | "corporate";

/**
 * Renders the invoice template matching the exact layout and visual design
 * of the onboarding invoice preview (`features/onboarding/components/invoice-preview.tsx`).
 */
export async function renderInvoiceTemplate(
  pdfDoc: PDFDocument,
  context: TemplateRenderContext,
  template: InvoiceTemplateType,
) {
  const { invoice, branding, logo } = context;
  const page = pdfDoc.addPage([595.28, 841.89]); // Standard A4 (595.28 x 841.89 pt)
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const brandColorHex = branding.brandColor || DEFAULT_BRAND_COLOR;
  const brandColorRgb = hexToRgb(brandColorHex, PDF_COLORS.purple);
  const brandAccentRgb = hexToRgb(readableOnWhite(brandColorHex), PDF_COLORS.purple);
  const headerTextHex = readableTextColor(brandColorHex);
  const headerTextRgb = hexToRgb(headerTextHex, PDF_COLORS.white);

  const sidebarDarkRgb = hexToRgb("#373b53"); // matches border-l-sidebar
  const surfaceSubtleRgb = hexToRgb("#f9fafe"); // matches bg-surface-subtle

  const isModern = template === "modern";
  const isCorporate = template === "corporate";

  // Embed logo image if provided
  let embeddedImage: PDFImage | null = null;
  if (logo) {
    try {
      if (logo.type === "png") {
        embeddedImage = await pdfDoc.embedPng(logo.bytes);
      } else if (logo.type === "jpeg") {
        embeddedImage = await pdfDoc.embedJpg(logo.bytes);
      }
    } catch {
      embeddedImage = null;
    }
  }

  // --- Document Card Container ---
  // In the onboarding preview, the invoice is an article card that hugs its content with p-5 padding
  const cardX = 40;
  const cardWidth = width - 80; // 515.28 pt
  const cardTop = height - 44; // 797.89 pt
  const headerHeight = 74;

  const contentX = cardX + 22;
  const contentWidth = cardWidth - 44; // 471.28 pt
  const contentRightX = contentX + contentWidth;

  // Pre-calculate exact content height so the card hugs its content
  let bodyHeight = 26 + 44 + (invoice.client?.email ? 13 : 0) + 16;
  for (const item of invoice.items) {
    const itemName = sanitizePdfText(item.name);
    const itemTotalText = formatPdfCurrency(
      item.total ?? item.quantity * item.unitPrice,
      invoice.currency,
    );
    const itemTotalWidth = fontBold.widthOfTextAtSize(itemTotalText, 10.5);
    const maxItemNameWidth = contentWidth - itemTotalWidth - 40;
    const wrappedName = wrapText(itemName, fontBold, 10, maxItemNameWidth);
    bodyHeight += wrappedName.length * 13;
    if (item.quantity > 1 || item.unitPrice > 0) {
      bodyHeight += 13;
    }
    bodyHeight += 26;
  }
  bodyHeight += 4 + 16 + (invoice.taxRate > 0 || invoice.tax > 0 ? 16 : 0) + 20 + 24;
  const rawTerms =
    invoice.publicNotes?.trim() ||
    (invoice as { notes?: string | null }).notes?.trim() ||
    branding.defaultTerms?.trim() ||
    "Payment due within 14 days of issue.";
  const termsText = sanitizePdfText(rawTerms);
  const wrappedTerms = wrapText(termsText, fontRegular, 8.5, contentWidth);
  bodyHeight += 14 + wrappedTerms.length * 12 + 24; // terms + bottom padding

  const totalCardHeight = headerHeight + bodyHeight;
  const cardBottom = Math.max(44, cardTop - totalCardHeight);
  const cardHeight = cardTop - cardBottom;

  // 1. Card background
  page.drawRectangle({
    x: cardX,
    y: cardBottom,
    width: cardWidth,
    height: cardHeight,
    color: PDF_COLORS.white,
  });

  // 2. Card outer border (1pt #dfe3fa)
  page.drawRectangle({
    x: cardX,
    y: cardBottom,
    width: cardWidth,
    height: cardHeight,
    borderColor: PDF_COLORS.border,
    borderWidth: 1,
  });

  // 3. Corporate template: 5pt dark sidebar bar on the left (border-l-4 border-l-sidebar)
  if (isCorporate) {
    page.drawRectangle({
      x: cardX,
      y: cardBottom,
      width: 5,
      height: cardHeight,
      color: sidebarDarkRgb,
    });
  }

  // --- Header Section ---
  const headerY = cardTop - headerHeight;

  if (isModern) {
    // Modern: Vibrant full brand-color banner
    page.drawRectangle({
      x: cardX,
      y: headerY,
      width: cardWidth,
      height: headerHeight,
      color: brandColorRgb,
    });
  } else if (isCorporate) {
    // Corporate: Subtle surface background (#f9fafe) with border-b
    page.drawRectangle({
      x: cardX,
      y: headerY,
      width: cardWidth,
      height: headerHeight,
      color: surfaceSubtleRgb,
    });
    page.drawLine({
      start: { x: cardX, y: headerY },
      end: { x: cardX + cardWidth, y: headerY },
      thickness: 1,
      color: PDF_COLORS.border,
    });
  } else {
    // Classic: White header with bottom divider line
    page.drawLine({
      start: { x: cardX, y: headerY },
      end: { x: cardX + cardWidth, y: headerY },
      thickness: 1,
      color: PDF_COLORS.border,
    });
  }

  // Header Left: Logo Badge
  const badgeSize = 36;
  const badgeX = cardX + 20;
  const badgeY = cardTop - 55;

  if (embeddedImage) {
    // Render uploaded custom logo
    const dims = embeddedImage.scaleToFit(badgeSize, badgeSize);
    const offsetX = (badgeSize - dims.width) / 2;
    const offsetY = (badgeSize - dims.height) / 2;
    page.drawImage(embeddedImage, {
      x: badgeX + offsetX,
      y: badgeY + offsetY,
      width: dims.width,
      height: dims.height,
    });
  } else {
    // Render signature 2-tone BiteBill logo badge from onboarding preview
    if (isModern) {
      // Modern: Translucent white badge on brand banner
      page.drawRectangle({
        x: badgeX,
        y: badgeY + badgeSize / 2,
        width: badgeSize,
        height: badgeSize / 2,
        color: PDF_COLORS.white,
        opacity: 0.18,
      });
      page.drawRectangle({
        x: badgeX,
        y: badgeY,
        width: badgeSize,
        height: badgeSize / 2,
        color: PDF_COLORS.white,
        opacity: 0.12,
      });
    } else {
      // Classic & Corporate: Brand color top half, lightened bottom half
      const lighterBrandRgb = hexToRgb(lightenHex(brandColorHex), PDF_COLORS.purple);
      page.drawRectangle({
        x: badgeX,
        y: badgeY + badgeSize / 2,
        width: badgeSize,
        height: badgeSize / 2,
        color: brandColorRgb,
      });
      page.drawRectangle({
        x: badgeX,
        y: badgeY,
        width: badgeSize,
        height: badgeSize / 2,
        color: lighterBrandRgb,
      });
    }

    // Centered BiteBill white vector logo mark
    const logoScale = 0.44;
    const logoW = 40 * logoScale;
    const logoH = 37.7 * logoScale;
    const markX = badgeX + (badgeSize - logoW) / 2;
    const markTopY = badgeY + badgeSize - (badgeSize - logoH) / 2;

    page.drawSvgPath(BITEBILL_LOGO_SVG_PATH, {
      x: markX,
      y: markTopY,
      scale: logoScale,
      color: PDF_COLORS.white,
    });
  }

  // Header Left: Business Name & Email
  const textX = cardX + 66;
  const businessName = sanitizePdfText(branding.businessName || "Your business name");
  const businessEmail = sanitizePdfText(branding.businessEmail || "you@example.com");

  page.drawText(businessName, {
    x: textX,
    y: cardTop - 34,
    size: 14,
    font: fontBold,
    color: isModern ? headerTextRgb : PDF_COLORS.dark,
  });

  page.drawText(businessEmail, {
    x: textX,
    y: cardTop - 48,
    size: 9.5,
    font: fontRegular,
    color: isModern ? headerTextRgb : PDF_COLORS.mutedLight,
    opacity: isModern ? 0.75 : 1,
  });

  // Header Right: "INVOICE" label & Invoice Number
  const rightAlignX = cardX + cardWidth - 22;
  const invLabel = "INVOICE";
  const invLabelWidth = fontBold.widthOfTextAtSize(invLabel, 9.5);

  page.drawText(invLabel, {
    x: rightAlignX - invLabelWidth,
    y: cardTop - 34,
    size: 9.5,
    font: fontBold,
    color: isModern ? headerTextRgb : PDF_COLORS.mutedLight,
    opacity: isModern ? 0.8 : 1,
  });

  const invoiceNumber = invoice.invoiceNumber.startsWith("#")
    ? invoice.invoiceNumber
    : `#${invoice.invoiceNumber}`;
  const invNumWidth = fontBold.widthOfTextAtSize(invoiceNumber, 14);

  page.drawText(invoiceNumber, {
    x: rightAlignX - invNumWidth,
    y: cardTop - 50,
    size: 14,
    font: fontBold,
    color: isModern ? headerTextRgb : brandAccentRgb,
  });

  // --- Body Section ---
  let cursorY = headerY - 26;

  // 1. "Billed to" & "Due" Row
  page.drawText("Billed to", {
    x: contentX,
    y: cursorY,
    size: 9,
    font: fontRegular,
    color: PDF_COLORS.mutedLight,
  });

  const clientName = sanitizePdfText(invoice.client?.name ?? "Customer");
  page.drawText(clientName, {
    x: contentX,
    y: cursorY - 14,
    size: 11.5,
    font: fontBold,
    color: PDF_COLORS.dark,
  });

  let clientInfoExtra = 0;
  if (invoice.client?.email) {
    page.drawText(sanitizePdfText(invoice.client.email), {
      x: contentX,
      y: cursorY - 27,
      size: 9.5,
      font: fontRegular,
      color: PDF_COLORS.muted,
    });
    clientInfoExtra = 13;
  }

  // Right: Due date & Issue date
  const dueLabel = "Due";
  const dueLabelWidth = fontRegular.widthOfTextAtSize(dueLabel, 9);
  page.drawText(dueLabel, {
    x: contentRightX - dueLabelWidth,
    y: cursorY,
    size: 9,
    font: fontRegular,
    color: PDF_COLORS.mutedLight,
  });

  const rawDueDate =
    (invoice as { paymentDue?: string }).paymentDue ?? invoice.dueDate;
  const dueDateText = rawDueDate ? formatPdfDate(rawDueDate) : "";
  const dueDateWidth = fontBold.widthOfTextAtSize(dueDateText, 11.5);
  page.drawText(dueDateText, {
    x: contentRightX - dueDateWidth,
    y: cursorY - 14,
    size: 11.5,
    font: fontBold,
    color: PDF_COLORS.dark,
  });

  const issueDateText = `Issued: ${formatPdfDate(invoice.issueDate)}`;
  const issueDateWidth = fontRegular.widthOfTextAtSize(issueDateText, 8.5);
  page.drawText(issueDateText, {
    x: contentRightX - issueDateWidth,
    y: cursorY - 27,
    size: 8.5,
    font: fontRegular,
    color: PDF_COLORS.mutedLight,
  });

  cursorY -= 44 + clientInfoExtra;

  // 2. Line Items Section
  // Top border line
  page.drawLine({
    start: { x: contentX, y: cursorY },
    end: { x: contentRightX, y: cursorY },
    thickness: 1,
    color: PDF_COLORS.border,
  });

  cursorY -= 16;

  for (const item of invoice.items) {
    const itemName = sanitizePdfText(item.name);
    const itemTotalText = formatPdfCurrency(
      item.total ?? item.quantity * item.unitPrice,
      invoice.currency,
    );
    const itemTotalWidth = fontBold.widthOfTextAtSize(itemTotalText, 10.5);

    // Right-aligned item total
    page.drawText(itemTotalText, {
      x: contentRightX - itemTotalWidth,
      y: cursorY,
      size: 10.5,
      font: fontBold,
      color: PDF_COLORS.dark,
    });

    // Left-aligned item name (wrapped if necessary to guarantee 40pt clearance from amount)
    const maxItemNameWidth = contentWidth - itemTotalWidth - 40;
    const wrappedName = wrapText(itemName, fontBold, 10, maxItemNameWidth);

    for (let i = 0; i < wrappedName.length; i++) {
      page.drawText(wrappedName[i], {
        x: contentX,
        y: cursorY - i * 13,
        size: 10,
        font: fontBold,
        color: PDF_COLORS.dark,
      });
    }

    cursorY -= (wrappedName.length - 1) * 13;

    // Optional subtle quantity meta if multiple units or price differs
    if (item.quantity > 1 || item.unitPrice > 0) {
      cursorY -= 13;
      const metaText = `Quantity: ${item.quantity} × ${formatPdfCurrency(item.unitPrice, invoice.currency)}`;
      page.drawText(metaText, {
        x: contentX,
        y: cursorY,
        size: 8.5,
        font: fontRegular,
        color: PDF_COLORS.mutedLight,
      });
    }

    // Bottom item divider line
    cursorY -= 10;
    page.drawLine({
      start: { x: contentX, y: cursorY },
      end: { x: contentRightX, y: cursorY },
      thickness: 1,
      color: PDF_COLORS.border,
    });

    cursorY -= 16;
  }

  // 3. Totals Block (Subtotal, Tax, Total)
  cursorY -= 4;

  // Subtotal row
  page.drawText("Subtotal", {
    x: contentX,
    y: cursorY,
    size: 9.5,
    font: fontRegular,
    color: PDF_COLORS.muted,
  });

  const subtotalText = formatPdfCurrency(invoice.subtotal, invoice.currency);
  const subtotalWidth = fontRegular.widthOfTextAtSize(subtotalText, 9.5);
  page.drawText(subtotalText, {
    x: contentRightX - subtotalWidth,
    y: cursorY,
    size: 9.5,
    font: fontRegular,
    color: PDF_COLORS.muted,
  });

  cursorY -= 16;

  // Tax row (if applicable)
  if (invoice.taxRate > 0 || invoice.tax > 0) {
    const taxLabel = `Tax (${invoice.taxRate}%)`;
    page.drawText(taxLabel, {
      x: contentX,
      y: cursorY,
      size: 9.5,
      font: fontRegular,
      color: PDF_COLORS.muted,
    });

    const taxText = formatPdfCurrency(invoice.tax, invoice.currency);
    const taxWidth = fontRegular.widthOfTextAtSize(taxText, 9.5);
    page.drawText(taxText, {
      x: contentRightX - taxWidth,
      y: cursorY,
      size: 9.5,
      font: fontRegular,
      color: PDF_COLORS.muted,
    });

    cursorY -= 16;
  }

  // Divider before Total
  cursorY -= 2;
  page.drawLine({
    start: { x: contentX, y: cursorY },
    end: { x: contentRightX, y: cursorY },
    thickness: 1,
    color: PDF_COLORS.border,
  });

  cursorY -= 16;

  // Total Row
  page.drawText("Total", {
    x: contentX,
    y: cursorY,
    size: 13,
    font: fontBold,
    color: PDF_COLORS.dark,
  });

  const totalText = formatPdfCurrency(invoice.total, invoice.currency);
  const totalWidth = fontBold.widthOfTextAtSize(totalText, 13.5);

  page.drawText(totalText, {
    x: contentRightX - totalWidth,
    y: cursorY,
    size: 13.5,
    font: fontBold,
    // Modern highlights the total with the readable brand color, matching invoice-preview.tsx
    color: isModern ? brandAccentRgb : PDF_COLORS.dark,
  });

  cursorY -= 24;

  // 4. Terms / Notes Section
  // Dashed top divider line
  page.drawLine({
    start: { x: contentX, y: cursorY },
    end: { x: contentRightX, y: cursorY },
    thickness: 1,
    color: PDF_COLORS.border,
    dashArray: [4, 4],
  });

  cursorY -= 14;

  for (let i = 0; i < wrappedTerms.length; i++) {
    page.drawText(wrappedTerms[i], {
      x: contentX,
      y: cursorY - i * 12,
      size: 8.5,
      font: fontRegular,
      color: PDF_COLORS.mutedLight,
    });
  }

  // 5. Render diagonal audit watermark (PAID, OVERDUE, DRAFT) centered in the invoice card
  const cardCenterY = cardBottom + cardHeight / 2;
  renderWatermark(page, fontBold, invoice.status, cardCenterY);
}
