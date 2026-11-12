import { getSessionUser } from "@/features/auth/lib/session";
import {
  AccountServiceError,
  sendSetupPasswordOtp,
} from "@/features/settings/services/account";

/** Sends a password setup or reset verification OTP to the signed-in user's email address. */
export async function POST() {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await sendSetupPasswordOtp(user.email);
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof AccountServiceError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to send setup password OTP:", error);
    return Response.json(
      { error: "Failed to send verification code" },
      { status: 500 },
    );
  }
}

