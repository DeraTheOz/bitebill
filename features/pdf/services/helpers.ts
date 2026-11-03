import { rgb, type PDFFont, type RGB } from "pdf-lib";
import { formatDate } from "@/lib/format";

/**
 * Parses a hex color string like "#7C5DFA" or "7C5DFA" into pdf-lib RGB values (0-1).
 */
export function hexToRgb(hex: string | null | undefined, fallback: RGB = rgb(0.486, 0.365, 0.98)): RGB {
  if (!hex) return fallback;
  const clean = hex.replace("#", "").trim();
  if (clean.length !== 3 && clean.length !== 6) return fallback;

  let r = 0;
  let g = 0;
  let b = 0;

  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else {
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) return fallback;

  return rgb(r / 255, g / 255, b / 255);
}

/**
 * Standard colors used across PDF templates.
 */
export const PDF_COLORS = {
  purple: rgb(0.486, 0.365, 0.98), // #7c5dfa
  dark: rgb(0.047, 0.055, 0.086), // #0c0e16
  navy: rgb(0.114, 0.133, 0.224), // #1e2139
  muted: rgb(0.494, 0.533, 0.765), // #7e88c3
  mutedLight: rgb(0.533, 0.588, 0.8), // #888eb0
  lightBg: rgb(0.969, 0.969, 0.988), // #f8f8fb
  border: rgb(0.875, 0.89, 0.98), // #dfe3fa
  white: rgb(1, 1, 1),
  paid: rgb(0.2, 0.78, 0.56), // #33d69f
  overdue: rgb(0.925, 0.345, 0.345), // #ec5757
  draft: rgb(0.55, 0.58, 0.68),
};

/**
 * Replaces non-WinAnsi characters to prevent encoding crashes with StandardFonts.
 */
export function sanitizePdfText(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[^\x00-\xFF]/g, " ")
    .trim();
}

/**
 * Formats a currency amount safely for PDF rendering.
 */
export function formatPdfCurrency(amount: number, currency = "GBP"): string {
  const code = (currency || "GBP").toUpperCase();
  const symbolMap: Record<string, string> = {
    USD: "$",
    GBP: "£",
    EUR: "€",
    CAD: "CA$",
    AUD: "AU$",
  };

  const symbol = symbolMap[code];
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return symbol ? `${symbol}${formatted}` : `${code} ${formatted}`;
}

export { formatDate as formatPdfDate };

/**
 * Splits text into lines that fit within maxWidth.
 */
export function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

