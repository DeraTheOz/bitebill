import { auth } from "@/features/auth/lib/server";
import { getSessionUser } from "@/features/auth/lib/session";
import { generateAvatar } from "@/lib/avatar";
import {
  brandingPatchSchema,
  brandingSettingsSchema,
} from "@/features/branding/schemas/branding-schema";
import {
  getBrandingSettings,
  saveBrandingSettings,
  updateBrandingSettings,
} from "@/features/branding/services/branding";

/** Returns the authenticated user's workspace branding settings. */
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

/** Saves full branding settings during onboarding and backfills a default avatar if missing. */
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
    if (!user.image) {
      await auth.updateUser({ image: generateAvatar() }).catch(() => undefined);
    }
    return Response.json({ settings });
  } catch (error) {
    console.error("Failed to save branding settings:", error);
    return Response.json(
      { error: "Failed to save branding settings" },
      { status: 500 },
    );
  }
}

/** Applies partial branding or PDF default updates while preserving omitted logo data. */
export async function PATCH(request: Request) {
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

  const parsed = brandingPatchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error:
          parsed.error.issues[0]?.message ?? "Invalid branding settings data",
      },
      { status: 400 },
    );
  }

  try {
    const settings = await updateBrandingSettings(user.id, parsed.data);
    if (!settings) {
      return Response.json(
        { error: "Branding settings not found" },
        { status: 404 },
      );
    }
    return Response.json({ settings });
  } catch (error) {
    console.error("Failed to update branding settings:", error);
    return Response.json(
      { error: "Failed to update branding settings" },
      { status: 500 },
    );
  }
}
