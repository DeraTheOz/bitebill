"use client";

import { KeyRound, ShieldAlert } from "lucide-react";
import { DeleteButton } from "@/components/buttons/delete-button";
import { SaveChangesButton } from "@/components/buttons/save-changes-button";
import { ErrorState } from "@/components/errors/error-state";
import { TextField } from "@/components/forms/text-field";
import { Spinner } from "@/components/loaders/spinner";
import { useAccountSecurity } from "../hooks/use-account-security";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { OtpPasswordFlow } from "./otp-password-flow";

const providerLabels: Record<string, string> = {
  credential: "Email & Password",
  google: "Google",
};

export function AccountSecuritySection({
  userEmail,
}: {
  userEmail: string;
}) {
  const {
    isLoadingAccounts,
    isAccountsError,
    hasCredential,
    providers,
    isDeleteOpen,
    isForgotCurrentMode,
    isChangingPassword,
    isDeletingAccount,
    errors,
    register,
    refetchAccounts,
    setIsDeleteOpen,
    setIsForgotCurrentMode,
    handleForgotSuccess,
    handlePasswordSubmit,
    handleConfirmDelete,
  } = useAccountSecurity();

  if (isLoadingAccounts) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="h-44 animate-pulse rounded-2xl border border-border bg-surface p-6 dark:bg-white/5" />
        <div className="h-40 animate-pulse rounded-2xl border border-border bg-surface p-6 dark:bg-white/5" />
      </div>
    );
  }

  if (isAccountsError) {
    return (
      <div className="max-w-2xl">
        <ErrorState
          title="Could not load security settings"
          description="We couldn't inspect your connected sign-in methods. Please try again."
          onRetry={refetchAccounts}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] sm:p-8 dark:shadow-none">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-purple/10 text-purple">
            <KeyRound className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[18px] font-bold tracking-[-0.25px] text-ink">
              Password & Sign-In Methods
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {providers.length > 0 ? (
                providers.map((provider) => (
                  <span
                    key={provider}
                    className="rounded-full border border-border bg-surface-subtle px-3 py-1 text-[12px] font-bold text-ink">
                    {providerLabels[provider] ?? provider}
                  </span>
                ))
              ) : (
                <span className="text-[13px] font-medium text-muted-light">
                  Standard session
                </span>
              )}
            </div>
          </div>
        </div>

        {!hasCredential ? (
          <OtpPasswordFlow mode="setup" userEmail={userEmail} />
        ) : isForgotCurrentMode ? (
          <OtpPasswordFlow
            mode="reset"
            userEmail={userEmail}
            onCancel={() => setIsForgotCurrentMode(false)}
            onSuccess={handleForgotSuccess}
          />
        ) : (
          <form
            noValidate
            onSubmit={handlePasswordSubmit}
            className="mt-6 space-y-5 border-t border-border pt-6">
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <label
                  htmlFor="current-password"
                  className="text-[13px] font-medium text-muted">
                  Current password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotCurrentMode(true)}
                  disabled={isChangingPassword}
                  className="text-[13px] font-bold text-purple hover:underline disabled:cursor-not-allowed disabled:opacity-50">
                  Forgot current password?
                </button>
              </div>
              <TextField
                id="current-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={isChangingPassword}
                error={errors.currentPassword?.message}
                {...register("currentPassword")}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="New password"
                id="new-password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={isChangingPassword}
                error={errors.newPassword?.message}
                {...register("newPassword")}
              />

              <TextField
                label="Confirm new password"
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={isChangingPassword}
                error={errors.confirmNewPassword?.message}
                {...register("confirmNewPassword")}
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-[13px] font-medium text-muted">
              <input
                type="checkbox"
                disabled={isChangingPassword}
                className="size-4 accent-purple"
                {...register("revokeOtherSessions")}
              />
              Sign out of all other active devices after updating password
            </label>

            <div className="flex justify-end border-t border-border pt-5">
              <SaveChangesButton
                type="submit"
                disabled={isChangingPassword}
                className="inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60">
                {isChangingPassword ? (
                  <>
                    <Spinner className="size-4" tone="currentColor" />
                    Updating…
                  </>
                ) : (
                  "Update Password"
                )}
              </SaveChangesButton>
            </div>
          </form>
        )}
      </section>

      <section className="rounded-2xl border border-danger/30 bg-surface p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] sm:p-8 dark:shadow-none">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-danger/10 text-danger">
            <ShieldAlert className="size-5" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <h2 className="text-[18px] font-bold tracking-[-0.25px] text-ink">
              Danger Zone
            </h2>
            <p className="mt-1 text-[13px] font-medium leading-relaxed text-muted-light">
              Permanently remove your BiteBill account and all associated
              branding, client, invoice, share, and recurring invoice records.
            </p>
            <div className="mt-5">
              <DeleteButton
                onClick={() => setIsDeleteOpen(true)}
                className="w-full sm:w-auto">
                Delete Account
              </DeleteButton>
            </div>
          </div>
        </div>
      </section>

      {isDeleteOpen && (
        <DeleteAccountDialog
          requiresPassword={hasCredential}
          isDeleting={isDeletingAccount}
          onConfirm={handleConfirmDelete}
          onClose={() => setIsDeleteOpen(false)}
        />
      )}
    </div>
  );
}
