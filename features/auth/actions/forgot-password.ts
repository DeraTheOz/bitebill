"use server";

import { auth } from "../lib/server";
import { sendOtpSchema } from "../schemas/validation";
import { mapOtpError } from "../lib/otp-error";
import { redirect } from "next/navigation";

/**
 * Result returned by the email OTP server actions.
 * `null` means success; otherwise `error` holds a user-facing message.
 */
export type OtpActionState = { error: string | null } | null;

/**
 * Sends a password-reset OTP for the given email through Better Auth.
 *
 * @param email - Address the reset code is sent to.
 * @returns `null` on success, or an error state with a mapped message.
 */
async function requestPasswordResetOtp(email: string): Promise<OtpActionState> {
  const { error } = await auth.emailOtp.sendVerificationOtp({
    email,
    type: "forget-password",
  });

  return error ? { error: mapOtpError(error) } : null;
}

/**
 * Validates the submitted email and requests a password-reset code.
 *
 * Never throws for expected failures: validation/delivery errors are returned as
 * state so the caller can render them inline. Redirects to the reset-password
 * page on success.
 *
 * @param _prevState - Unused previous state, kept for the action signature.
 * @param formData - Submitted form data containing `email`.
 * @returns An error state on invalid input or delivery failure; otherwise never returns (redirects).
 */
export async function sendPasswordResetOtp(
  _prevState: OtpActionState,
  formData: FormData,
): Promise<OtpActionState> {
  const parsed = sendOtpSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const email = parsed.data.email;
  const state = await requestPasswordResetOtp(email);

  if (state?.error) return state;

  redirect(`/auth/reset-password?email=${encodeURIComponent(email)}`);
}

/**
 * Re-requests a password-reset code without navigating.
 * Used by the "resend code" control on the reset-password form.
 *
 * @param formData - Submitted form data containing `email`.
 * @returns `null` on success, or an error state on invalid input or delivery failure.
 */
export async function resendPasswordResetOtp(
  formData: FormData,
): Promise<OtpActionState> {
  const parsed = sendOtpSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  return requestPasswordResetOtp(parsed.data.email);
}
