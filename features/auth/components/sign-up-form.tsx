"use client";

import Image from "next/image";
import Link from "next/link";
import { useSignUp } from "../hooks/use-sign-up";
import { GoogleButton } from "./google-button";
import { AuthField } from "./auth-field";
import { ThemeToggle } from "@/features/theme/components/theme-toggle";

export function SignUpForm() {
  const { form, onSubmit, submitError, isPending } = useSignUp();
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
                Create your account
              </h1>
              <p className="text-[15px] text-muted">
                Get started with BiteBill in seconds.
              </p>
            </div>

            <AuthField
              label="Name"
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Appleseed"
              error={errors.name?.message}
              disabled={isPending}
              {...register("name")}
            />

            <AuthField
              label="Email address"
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              disabled={isPending}
              {...register("email")}
            />

            <AuthField
              label="Password"
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              error={errors.password?.message}
              disabled={isPending}
              {...register("password")}
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
              {isPending ? "Creating account..." : "Create Account"}
            </button>

            <div className="flex items-center gap-3 text-[13px] font-medium text-muted-light">
              <span className="h-px flex-1 bg-border" />
              OR
              <span className="h-px flex-1 bg-border" />
            </div>

            <GoogleButton />

            <p className="text-center text-[15px] text-muted">
              Already have an account?{" "}
              <Link
                href="/auth/sign-in"
                className="font-bold text-purple underline underline-offset-2 transition-colors hover:text-purple-light">
                Sign in
              </Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
