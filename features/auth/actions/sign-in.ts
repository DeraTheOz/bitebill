"use server";

import { auth } from "../lib/server";
import { signInSchema } from "../schemas/validation";

/**
 * Validates credentials and signs the user in with email/password.
 *
 * @param _prevState - Unused previous state, kept for the action signature.
 * @param formData - Submitted form data containing `email` and `password`.
 * @returns An error state on invalid input or failed sign-in; otherwise `null` on success.
 */
export async function signInWithEmail(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { error } = await auth.signIn.email(parsed.data);
  if (error) return { error: error.message || "Failed to sign in. Try again." };

  return null;
}
