import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import {
  brandingSettings,
  clients,
  invoiceEvents,
  invoices,
  recurringInvoiceTemplates,
} from "@/db/schema";
import { mapOtpError } from "@/features/auth/lib/otp-error";
import { auth } from "@/features/auth/lib/server";
import type {
  DeleteAccountResult,
  UserAccountsInfo,
} from "../types/settings";

/** Service-layer error carrying an HTTP status code and optional structured error code. */
export class AccountServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "AccountServiceError";
  }
}

/** Detects invalid-password errors across Better Auth codes and message strings. */
function isInvalidPasswordError(error: {
  code?: string;
  message?: string;
}): boolean {
  const code = error.code?.toUpperCase() ?? "";
  if (
    code === "INVALID_PASSWORD" ||
    code === "INVALID_EMAIL_OR_PASSWORD"
  ) {
    return true;
  }
  return /invalid.*password/i.test(error.message ?? "");
}

/** Lists linked Neon Auth providers and whether the user has a credential password set. */
export async function getUserAccountsInfo(): Promise<UserAccountsInfo> {
  const { data, error } = await auth.listAccounts();

  if (error) {
    throw new AccountServiceError(
      error.message || "Could not load connected accounts",
      error.status >= 400 && error.status < 600 ? error.status : 500,
      error.code,
    );
  }

  const accounts = Array.isArray(data) ? data : [];
  const providers = Array.from(
    new Set(
      accounts
        .map((account) =>
          typeof account?.providerId === "string" ? account.providerId : null,
        )
        .filter((provider): provider is string => Boolean(provider)),
    ),
  );

  return {
    hasCredentialAccount: providers.includes("credential"),
    providers,
  };
}

/** Updates the user's profile name in Neon Auth and returns the uncached session user. */
export async function updateUserProfile(input: { name: string }) {
  const { error } = await auth.updateUser({
    name: input.name.trim(),
  });

  if (error) {
    throw new AccountServiceError(
      error.message || "Failed to update profile",
      error.status >= 400 && error.status < 600 ? error.status : 400,
      error.code,
    );
  }

  const { data: freshSession } = await auth.getSession({
    query: { disableCookieCache: "true" },
  });

  return freshSession?.user ?? null;
}

/** Sends a password setup/reset OTP to the user's verified email via Neon Auth. */
export async function sendSetupPasswordOtp(email: string) {
  const { error } = await auth.emailOtp.sendVerificationOtp({
    email,
    type: "forget-password",
  });

  if (error) {
    const status =
      error.status >= 400 && error.status < 600 ? error.status : 400;
    throw new AccountServiceError(mapOtpError(error), status, error.code);
  }
}

/** Changes the user's credential password, mapping wrong current password errors to `INVALID_PASSWORD`. */
export async function changeUserPassword(input: {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions: boolean;
}) {
  const { error } = await auth.changePassword({
    currentPassword: input.currentPassword,
    newPassword: input.newPassword,
    revokeOtherSessions: input.revokeOtherSessions,
  });

  if (error) {
    if (isInvalidPasswordError(error)) {
      throw new AccountServiceError(
        "Current password is incorrect",
        400,
        "INVALID_PASSWORD",
      );
    }

    const status =
      error.status >= 400 && error.status < 600 ? error.status : 400;
    throw new AccountServiceError(
      error.message || "Could not update password",
      status,
      error.code,
    );
  }
}

interface NeonAuthDeletionConfig {
  apiKey: string;
  projectId: string;
  branchId: string;
}

/** Reads and validates the required Neon Management API credentials for user deletion. */
function getNeonAuthDeletionConfig(): NeonAuthDeletionConfig {
  const apiKey = process.env.NEON_API_KEY?.trim();
  const projectId = process.env.NEON_PROJECT_ID?.trim();
  const branchId = process.env.NEON_BRANCH_ID?.trim();

  if (!apiKey || !projectId || !branchId) {
    throw new AccountServiceError(
      "Account deletion is not configured.",
      500,
      "DELETE_USER_NOT_CONFIGURED",
    );
  }

  return { apiKey, projectId, branchId };
}

/** Removes the user from Neon Managed Auth through the Neon Management REST API. */
async function deleteNeonAuthUser(
  userId: string,
  config: NeonAuthDeletionConfig,
): Promise<void> {
  const endpoint = `https://console.neon.tech/api/v2/projects/${encodeURIComponent(config.projectId)}/branches/${encodeURIComponent(config.branchId)}/auth/users/${encodeURIComponent(userId)}`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch {
    throw new AccountServiceError(
      "Could not reach authentication provider to delete account.",
      502,
      "NEON_UNREACHABLE",
    );
  }

  if (response.ok) {
    return;
  }

  let upstreamMessage: string | undefined;
  try {
    const payload = (await response.json()) as {
      message?: unknown;
      error?: unknown;
    };
    if (typeof payload.message === "string" && payload.message.trim()) {
      upstreamMessage = payload.message.trim();
    } else if (typeof payload.error === "string" && payload.error.trim()) {
      upstreamMessage = payload.error.trim();
    }
  } catch {
    // Ignore non-JSON error responses from Neon Management API.
  }

  const status = response.status >= 500 ? 502 : response.status;
  throw new AccountServiceError(
    upstreamMessage || "Failed to delete authentication account.",
    status,
    "NEON_DELETE_FAILED",
  );
}

/**
 * Deletes the user's Neon Auth account via the Neon Management API, purges all
 * user-owned BiteBill data in PostgreSQL, and clears the active session cookies.
 */
export async function deleteUserAccount(input: {
  userId: string;
  email?: string;
  password?: string;
}): Promise<DeleteAccountResult> {
  if (input.email && input.password) {
    const { error: verifyError } = await auth.signIn.email({
      email: input.email,
      password: input.password,
    });

    if (verifyError) {
      if (isInvalidPasswordError(verifyError)) {
        throw new AccountServiceError(
          "Current password is incorrect",
          400,
          "INVALID_PASSWORD",
        );
      }

      const verifyStatus =
        verifyError.status >= 400 && verifyError.status < 600
          ? verifyError.status
          : 400;
      throw new AccountServiceError(
        verifyError.message || "Could not verify password",
        verifyStatus,
        verifyError.code,
      );
    }
  }

  const config = getNeonAuthDeletionConfig();

  // Delete in Neon Auth first so app data stays intact if the upstream call fails.
  await deleteNeonAuthUser(input.userId, config);

  // Purge user-owned app records in case Neon soft-deletes auth users or omits cascades.
  await db.batch([
    db.delete(invoiceEvents).where(eq(invoiceEvents.userId, input.userId)),
    db.delete(invoices).where(eq(invoices.userId, input.userId)),
    db
      .delete(recurringInvoiceTemplates)
      .where(eq(recurringInvoiceTemplates.userId, input.userId)),
    db.delete(clients).where(eq(clients.userId, input.userId)),
    db
      .delete(brandingSettings)
      .where(eq(brandingSettings.userId, input.userId)),
  ]);

  // Clear local session cookies after account removal.
  await auth.signOut().catch(() => undefined);

  return { outcome: "deleted" };
}
