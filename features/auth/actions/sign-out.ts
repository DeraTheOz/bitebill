"use server";

import { auth } from "../lib/server";
import { redirect } from "next/navigation";

/**
 * Signs the current user out and redirects to the landing page.
 */
export async function signOut() {
  await auth.signOut();
  redirect("/");
}
