import { auth } from "@/features/auth/lib/server";
import { getSessionUser } from "@/features/auth/lib/session";
import {
  deleteAccountSchema,
  profileSettingsSchema,
} from "@/features/settings/schemas/settings-schema";
import {
  AccountServiceError,
  deleteUserAccount,
  getUserAccountsInfo,
  updateUserProfile,
} from "@/features/settings/services/account";

/** Returns the active Neon Auth session user record. */
export async function GET() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ user: session.user });
}

/** Updates the signed-in user's display profile attributes. */
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

  const parsed = profileSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid profile data" },
      { status: 400 },
    );
  }

  try {
    const updatedUser = await updateUserProfile(parsed.data);
    return Response.json({
      user: updatedUser ?? {
        ...user,
        name: parsed.data.name,
      },
    });
  } catch (error) {
    if (error instanceof AccountServiceError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to update user profile:", error);
    return Response.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}

/** Permanently deletes the signed-in user's auth account and all BiteBill workspace data. */
export async function DELETE(request: Request) {
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

  const parsed = deleteAccountSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error:
          parsed.error.issues[0]?.message ?? "Account deletion not confirmed",
      },
      { status: 400 },
    );
  }

  try {
    const accounts = await getUserAccountsInfo();
    if (accounts.hasCredentialAccount && !parsed.data.password) {
      return Response.json(
        {
          error: "Enter your password to delete your account",
          code: "PASSWORD_REQUIRED",
        },
        { status: 400 },
      );
    }

    const result = await deleteUserAccount({
      userId: user.id,
      email: accounts.hasCredentialAccount ? user.email : undefined,
      password: parsed.data.password || undefined,
    });
    return Response.json(result);
  } catch (error) {
    if (error instanceof AccountServiceError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }
    console.error("Failed to delete account:", error);
    return Response.json(
      { error: "Failed to delete account" },
      { status: 500 },
    );
  }
}
