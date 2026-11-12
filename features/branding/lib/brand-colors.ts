/** Fallback primary brand color used before workspace customization. */
export const DEFAULT_BRAND_COLOR = "#7c5dfa";

const WHITE = "#ffffff";
const INK = "#0c0e16";
const HEX_PATTERN = /^#([0-9a-f]{6})$/i;

/** Curated preset brand palette options shown in onboarding and settings. */
export const brandColors = [
  { value: "#7c5dfa", name: "Violet" },
  { value: "#4f46e5", name: "Indigo" },
  { value: "#2563eb", name: "Blue" },
  { value: "#0284c7", name: "Sky" },
  { value: "#0d9488", name: "Teal" },
  { value: "#059669", name: "Emerald" },
  { value: "#16a34a", name: "Green" },
  { value: "#65a30d", name: "Lime" },
  { value: "#d97706", name: "Amber" },
  { value: "#ea580c", name: "Orange" },
  { value: "#dc2626", name: "Red" },
  { value: "#e11d48", name: "Rose" },
  { value: "#db2777", name: "Pink" },
  { value: "#9333ea", name: "Purple" },
  { value: "#475569", name: "Slate" },
  { value: "#1e293b", name: "Navy" },
  { value: "#78350f", name: "Bronze" },
  { value: "#09090b", name: "Charcoal" },
] as const;

/** Supported PDF invoice layout template choices and descriptions. */
export const pdfTemplates = [
  { value: "classic", label: "Classic", description: "Timeless, minimal" },
  { value: "modern", label: "Modern", description: "Bold brand-color header" },
  { value: "corporate", label: "Corporate", description: "Structured accent" },
] as const;

/** Parses a 6-digit hex color into RGB channels (`0-255`), or returns `null` if invalid. */
function parseHex(hex: string): [number, number, number] | null {
  const match = HEX_PATTERN.exec(hex);
  if (!match) return null;

  const value = Number.parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** Converts RGB channels (`0-255`) back into a lowercase 6-digit hex color string. */
function toHex(red: number, green: number, blue: number): string {
  return `#${((1 << 24) | (red << 16) | (green << 8) | blue)
    .toString(16)
    .slice(1)}`;
}

/** Linearly interpolates between two hex colors by `amount` (`0` to `1`). */
function mix(from: string, to: string, amount: number): string {
  const source = parseHex(from);
  const target = parseHex(to);
  if (!source || !target) return from;

  const channel = (index: number) =>
    Math.round(source[index] + (target[index] - source[index]) * amount);

  return toHex(channel(0), channel(1), channel(2));
}

/** Computes WCAG relative luminance (`0` to `1`) for a hex color. */
function luminance(hex: string): number {
  const channels = parseHex(hex);
  if (!channels) return 0;

  const linear = channels.map((value) => {
    const normalized = value / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return (
    0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
  );
}

/** Computes the WCAG contrast ratio between two hex colors. */
function contrast(first: string, second: string): number {
  const light = Math.max(luminance(first), luminance(second));
  const dark = Math.min(luminance(first), luminance(second));
  return (light + 0.05) / (dark + 0.05);
}

/** Returns a lighter tint of `hex` blended toward white by `amount`. */
export function lightenHex(hex: string, amount = 0.45): string {
  return mix(hex, WHITE, amount);
}

/** Darkens `hex` iteratively until it achieves at least a 3:1 contrast ratio on white. */
export function readableOnWhite(hex: string): string {
  let current = hex;
  for (let step = 0; step < 24 && contrast(current, WHITE) < 3; step += 1) {
    current = mix(current, "#000000", 0.08);
  }
  return current;
}

/** Picks white or dark ink text depending on which yields higher contrast against `hex`. */
export function readableTextColor(hex: string): string {
  return contrast(hex, WHITE) >= contrast(hex, INK) ? WHITE : INK;
}

