"use client";

import { MailCheck } from "lucide-react";
import { SaveChangesButton } from "@/components/buttons/save-changes-button";
import { TextField } from "@/components/forms/text-field";
import { Spinner } from "@/components/loaders/spinner";
import { useOtpPasswordFlow } from "../hooks/use-otp-password-flow";

export function OtpPasswordFlow({
  mode,
  userEmail,
  onCancel,
  onSuccess,
}: {
  mode: "setup" | "reset";
  userEmail: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  const {
    isSetup,
    isCodeSent,
    resendCooldown,
    isSendingOtp,
    isSaving,
    errors,
    register,
    handleSendCode,
    handleSubmit,
  } = useOtpPasswordFlow({ mode, userEmail, onSuccess });

  return (
    <div className="mt-6 space-y-5 border-t border-border pt-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-[15px] font-bold text-ink">
            {isSetup ? "Set a Password" : "Reset Password via Email"}
          </h3>
          <p className="mt-1 text-[13px] font-medium leading-relaxed text-muted-light">
            {isSetup ? (
              <>
                You currently sign in with Google. Verify your email with a
                one-time code to add a password so you can also sign in with{" "}
                <span className="font-bold text-ink">{userEmail}</span> and a
                password.
              </>
            ) : (
              <>
                Forgot your current password? We&apos;ll send a 6-digit
                verification code to{" "}
                <span className="font-bold text-ink">{userEmail}</span> so you
                can set a new one.
              </>
            )}
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSendingOtp || isSaving}
            className="text-[13px] font-bold text-purple hover:underline disabled:cursor-not-allowed disabled:opacity-50">
            Use current password instead
          </button>
        )}
      </div>

      {!isCodeSent ? (
        <div className="flex justify-end">
          <SaveChangesButton
            type="button"
            onClick={handleSendCode}
            disabled={isSendingOtp}
            className="inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60">
            {isSendingOtp ? (
              <>
                <Spinner className="size-4" tone="currentColor" />
                Sending code…
              </>
            ) : (
              <>
                <MailCheck className="size-4" aria-hidden="true" />
                Send Verification Code
              </>
            )}
          </SaveChangesButton>
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-lg border border-purple/25 bg-purple/5 px-4 py-3 text-[13px] font-medium text-ink">
            We sent a 6-digit verification code to{" "}
            <strong>{userEmail}</strong>.
          </div>

          <TextField
            label="Verification code"
            id="otp-password-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            disabled={isSaving}
            error={errors.otp?.message}
            {...register("otp")}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="New password"
              id="otp-new-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              disabled={isSaving}
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />

            <TextField
              label="Confirm new password"
              id="otp-confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              disabled={isSaving}
              error={errors.confirmNewPassword?.message}
              {...register("confirmNewPassword")}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={handleSendCode}
              disabled={resendCooldown > 0 || isSendingOtp || isSaving}
              className="text-[13px] font-bold text-purple hover:underline disabled:cursor-not-allowed disabled:text-muted-light disabled:no-underline">
              {isSendingOtp
                ? "Sending…"
                : resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : "Resend code"}
            </button>

            <SaveChangesButton
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60">
              {isSaving ? (
                <>
                  <Spinner className="size-4" tone="currentColor" />
                  {isSetup ? "Setting password…" : "Resetting password…"}
                </>
              ) : isSetup ? (
                "Set Password"
              ) : (
                "Reset Password"
              )}
            </SaveChangesButton>
          </div>
        </form>
      )}
    </div>
  );
}

