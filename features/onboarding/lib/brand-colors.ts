export const DEFAULT_BRAND_COLOR = "#7c5dfa";

const WHITE = "#ffffff";
const INK = "#0c0e16";
const HEX_PATTERN = /^#([0-9a-f]{6})$/i;

export const brandColors = [
  { value: "#7c5dfa", name: "Violet" },
  { value: "#4f46e5", name: "Indigo" },
  { value: "#2563eb", name: "Blue" },
  { value: "#0ea5e9", name: "Sky" },
  { value: "#0d9488", name: "Teal" },
  { value: "#10b981", name: "Emerald" },
  { value: "#16a34a", name: "Green" },
  { value: "#f59e0b", name: "Amber" },
  { value: "#ea580c", name: "Orange" },
  { value: "#e11d48", name: "Rose" },
  { value: "#db2777", name: "Pink" },
  { value: "#475569", name: "Slate" },
] as const;

function parseHex(hex: string): [number, number, number] | null {
  const match = HEX_PATTERN.exec(hex);
  if (!match) return null;

  const value = Number.parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function toHex(red: number, green: number, blue: number): string {
  return `#${((1 << 24) | (red << 16) | (green << 8) | blue)
    .toString(16)
    .slice(1)}`;
}

function mix(from: string, to: string, amount: number): string {
  const source = parseHex(from);
  const target = parseHex(to);
  if (!source || !target) return from;

  const channel = (index: number) =>
    Math.round(source[index] + (target[index] - source[index]) * amount);

  return toHex(channel(0), channel(1), channel(2));
}

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

function contrast(first: string, second: string): number {
  const light = Math.max(luminance(first), luminance(second));
  const dark = Math.min(luminance(first), luminance(second));
  return (light + 0.05) / (dark + 0.05);
}

export function lightenHex(hex: string, amount = 0.45): string {
  return mix(hex, WHITE, amount);
}

export function readableOnWhite(hex: string): string {
  let current = hex;
  for (let step = 0; step < 24 && contrast(current, WHITE) < 3; step += 1) {
    current = mix(current, "#000000", 0.08);
  }
  return current;
}

export function readableTextColor(hex: string): string {
  return contrast(hex, WHITE) >= contrast(hex, INK) ? WHITE : INK;
}
