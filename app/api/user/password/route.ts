import { getSessionUser } from "@/features/auth/lib/session";
import { changePasswordInputSchema } from "@/features/settings/schemas/settings-schema";
import {
  AccountServiceError,
  changeUserPassword,
} from "@/features/settings/services/account";

/** Updates the signed-in user's credential password after validating the payload. */
export async function POST(request: Request) {
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

  const parsed = changePasswordInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid password payload" },
      { status: 400 },
    );
  }

  try {
    await changeUserPassword(parsed.data);
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof AccountServiceError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }
    console.error("Failed to change password:", error);
    return Response.json(
      { error: "Failed to change password" },
      { status: 500 },
    );
  }
}

