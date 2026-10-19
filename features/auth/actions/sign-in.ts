"use server";

import { auth } from "../lib/server";
import { signInSchema } from "../schemas/validation";
import { redirect } from "next/navigation";

/**
 * Validates credentials and signs the user in with email/password.
 * Redirects to the dashboard on success.
 *
 * @param _prevState - Unused previous state, kept for the action signature.
 * @param formData - Submitted form data containing `email` and `password`.
 * @returns An error state on invalid input or failed sign-in; otherwise never returns (redirects).
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

  redirect("/dashboard");
}
