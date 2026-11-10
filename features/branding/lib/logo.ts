import type { BrandingLogo } from "@/features/branding/types/branding";
import type { LogoData } from "@/features/pdf/types/pdf";

const DATA_URL_PATTERN =
  /^data:(image\/(?:png|jpeg|jpg|webp|svg\+xml));base64,(.+)$/i;

export type DecodedLogo = {
  contentType: string;
  bytes: Uint8Array;
};

/**
 * Decodes a base64 data-URL logo into raw bytes and a normalized MIME type.
 */
export function decodeLogoDataUrl(dataUrl: string): DecodedLogo | null {
  const match = DATA_URL_PATTERN.exec(dataUrl);
  if (!match) return null;

  const rawMime = match[1].toLowerCase();
  const contentType = rawMime === "image/jpg" ? "image/jpeg" : rawMime;
  const bytes = new Uint8Array(Buffer.from(match[2], "base64"));

  return { contentType, bytes };
}

/**
 * Extracts PNG/JPEG bytes for pdf-lib embedding. SVG and WebP fall back to null
 * so PDF templates gracefully render the styled text badge instead.
 */
export function toPdfLogoData(rawLogo: BrandingLogo | null): LogoData | null {
  if (!rawLogo?.dataUrl) return null;

  const decoded = decodeLogoDataUrl(rawLogo.dataUrl);
  if (!decoded) return null;

  if (decoded.contentType === "image/png") {
    return { bytes: decoded.bytes, type: "png" };
  }
  if (decoded.contentType === "image/jpeg") {
    return { bytes: decoded.bytes, type: "jpeg" };
  }

  return null;
}

/**
 * Builds a cacheable binary image Response from a stored branding logo.
 */
export function createLogoImageResponse(
  logo: BrandingLogo,
  cacheControl: string,
): Response | null {
  const decoded = decodeLogoDataUrl(logo.dataUrl);
  if (!decoded) return null;

  return new Response(decoded.bytes as unknown as BodyInit, {
    headers: {
      "Content-Type": decoded.contentType,
      "Content-Length": String(decoded.bytes.byteLength),
      "Cache-Control": cacheControl,
      ETag: `"logo-${logo.updatedAt}"`,
      "Last-Modified": new Date(logo.updatedAt).toUTCString(),
    },
  });
}

