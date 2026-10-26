import { getSessionUser } from "@/features/auth/lib/session";
import { getBrandingLogo } from "@/features/branding/services/branding";

const DATA_URL_PATTERN = /^data:(image\/(?:png|jpeg|webp|svg\+xml));base64,(.+)$/;

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const logo = await getBrandingLogo(user.id);
    if (!logo) {
      return Response.json({ error: "No logo" }, { status: 404 });
    }

    const match = DATA_URL_PATTERN.exec(logo.dataUrl);
    if (!match) {
      console.error("Stored logo is not a valid data URL");
      return Response.json({ error: "Invalid logo" }, { status: 500 });
    }

    const [, contentType, base64] = match;
    const bytes = Buffer.from(base64, "base64");

    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(bytes.byteLength),
        // Immutable content is versioned by ?v=<logoUpdatedAt>.
        "Cache-Control": "private, max-age=300",
        ETag: `"logo-${logo.updatedAt}"`,
        "Last-Modified": new Date(logo.updatedAt).toUTCString(),
      },
    });
  } catch (error) {
    console.error("Failed to load branding logo:", error);
    return Response.json({ error: "Failed to load logo" }, { status: 500 });
  }
}
