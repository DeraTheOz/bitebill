import { getSessionUser } from "@/features/auth/lib/session";
import { createLogoImageResponse } from "@/features/branding/lib/logo";
import { getBrandingLogo } from "@/features/branding/services/branding";

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

    // Immutable content is versioned by ?v=<logoUpdatedAt>.
    const response = createLogoImageResponse(logo, "private, max-age=300");
    if (!response) {
      console.error("Stored logo is not a valid data URL");
      return Response.json({ error: "Invalid logo" }, { status: 500 });
    }

    return response;
  } catch (error) {
    console.error("Failed to load branding logo:", error);
    return Response.json({ error: "Failed to load logo" }, { status: 500 });
  }
}
