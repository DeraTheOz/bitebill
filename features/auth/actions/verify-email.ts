"use server";

import { auth } from "../lib/server";
import { sendOtpSchema, verifyEmailSchema } from "../schemas/validation";
import { mapOtpError } from "../lib/otp-error";
import { redirect } from "next/navigation";

/**
 * Result returned by the email OTP server actions.
 * `null` means success; otherwise `error` holds a user-facing message.
 */
export type OtpActionState = { error: string | null } | null;

/**
 * Validates the submitted email and sends an email-verification code.
 *
 * @param _prevState - Unused previous state, kept for the action signature.
 * @param formData - Submitted form data containing `email`.
 * @returns `null` on success, or an error state with a mapped message.
 */
export async function sendVerificationOtp(
  _prevState: OtpActionState,
  formData: FormData,
): Promise<OtpActionState> {
  const parsed = sendOtpSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { error } = await auth.emailOtp.sendVerificationOtp({
    email: parsed.data.email,
    type: "email-verification",
  });

  return { error: error ? mapOtpError(error) : null };
}

/**
 * Validates the submitted email and OTP, then verifies the account.
 * Redirects to onboarding on success.
 *
 * @param _prevState - Unused previous state, kept for the action signature.
 * @param formData - Submitted form data containing `email` and `otp`.
 * @returns An error state on invalid input or failed verification; otherwise never returns (redirects).
 */
export async function verifyEmailWithOtp(
  _prevState: OtpActionState,
  formData: FormData,
): Promise<OtpActionState> {
  const parsed = verifyEmailSchema.safeParse({
    email: formData.get("email"),
    otp: formData.get("otp"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { error } = await auth.emailOtp.verifyEmail({
    email: parsed.data.email,
    otp: parsed.data.otp,
  });

  if (error) return { error: mapOtpError(error) };

  redirect("/onboarding");
}
