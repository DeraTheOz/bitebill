"use client";

import Image from "next/image";
import Link from "next/link";
import { useVerifyEmail } from "../hooks/use-verify-email";
import { AuthField } from "./auth-field";
import { ThemeToggle } from "@/features/theme/components/theme-toggle";

export function VerifyEmailForm({ email }: { email?: string }) {
  const {
    form,
    email: initialEmail,
    onSubmit,
    submitError,
    isPending,
    sendError,
    isResending,
    cooldown,
    onResend,
  } = useVerifyEmail({ email });
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <ThemeToggle className="absolute right-6 top-6 grid size-11 place-items-center rounded-full" />

      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <Link
          href="/"
          aria-label="bitebill logo"
          className="flex items-center gap-3">
          <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-br-2xl bg-purple">
            <span className="absolute bottom-0 left-0 h-1/2 w-full rounded-br-2xl bg-purple-light mask-[url('/assets/logo-bg.svg')] mask-repeat:no-repeat mask-size-[100%_100%]" />
            <Image
              src="/assets/logo-white.svg"
              width={24}
              height={24}
              alt="BiteBill"
              className="relative"
              priority
            />
          </span>
          <span className="text-xl font-bold tracking-wider text-ink">
            BiteBill
          </span>
        </Link>

        <section className="w-full rounded-lg bg-surface p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] sm:p-8 dark:shadow-none">
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold tracking-[-0.25px] text-ink">
                Verify your email
              </h1>
              <p className="text-[15px] text-muted">
                We sent a 6-digit code to your email address. Enter it below to
                verify your account.
              </p>
            </div>

            <AuthField
              label="Email address"
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              readOnly={!!initialEmail}
              disabled={isPending}
              {...register("email")}
            />

            <AuthField
              label="Verification code"
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              error={errors.otp?.message}
              disabled={isPending}
              {...register("otp")}
            />

            {submitError && (
              <p
                role="alert"
                className="rounded border border-danger/20 bg-danger/10 px-4 py-3 text-[15px] font-medium text-danger">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-1 h-12 w-full rounded-full bg-button-purple text-[15px] font-bold text-white transition-colors hover:bg-button-purple-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple disabled:cursor-not-allowed disabled:opacity-60">
              {isPending ? "Verifying..." : "Verify email"}
            </button>
          </form>

          <div className="mt-4 flex flex-col items-center gap-2">
            {sendError && (
              <p
                role="alert"
                className="w-full rounded border border-danger/20 bg-danger/10 px-4 py-3 text-center text-[15px] font-medium text-danger">
                {sendError}
              </p>
            )}
            <p className="text-center text-[15px] text-muted">
              Didn&apos;t get the code?{" "}
              <button
                type="button"
                disabled={cooldown > 0 || isResending || isPending}
                onClick={onResend}
                className="font-bold text-purple underline underline-offset-2 transition-colors hover:text-purple-light disabled:cursor-not-allowed disabled:text-muted-light disabled:no-underline">
                {isResending
                  ? "Sending..."
                  : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : "Resend code"}
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
