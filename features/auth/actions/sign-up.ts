"use server";

import { auth } from "../lib/server";
import { signUpSchema } from "../schemas/validation";
import { generateAvatar } from "@/lib/avatar";
import { redirect } from "next/navigation";

/**
 * Validates the submitted details and creates a new email/password account.
 * Redirects to the email-verification page on success.
 *
 * @param _prevState - Unused previous state, kept for the action signature.
 * @param formData - Submitted form data containing `name`, `email` and `password`.
 * @returns An error state on invalid input or failed registration; otherwise never returns (redirects).
 */
export async function signUpWithEmail(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { error } = await auth.signUp.email({
    ...parsed.data,
    image: generateAvatar({ seed: parsed.data.email }),
  });
  if (error) return { error: error.message || "Failed to create account" };

  redirect(`/auth/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
}
