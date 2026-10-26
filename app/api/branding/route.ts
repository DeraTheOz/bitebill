import { getSessionUser } from "@/features/auth/lib/session";
import { brandingSettingsSchema } from "@/features/branding/schemas/branding-schema";
import {
  getBrandingSettings,
  saveBrandingSettings,
} from "@/features/branding/services/branding";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await getBrandingSettings(user.id);
    return Response.json({ settings });
  } catch (error) {
    console.error("Failed to load branding settings:", error);
    return Response.json(
      { error: "Failed to load branding settings" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = brandingSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid branding data" }, { status: 400 });
  }

  try {
    const settings = await saveBrandingSettings(user.id, parsed.data);
    return Response.json({ settings });
  } catch (error) {
    console.error("Failed to save branding settings:", error);
    return Response.json(
      { error: "Failed to save branding settings" },
      { status: 500 },
    );
  }
}
