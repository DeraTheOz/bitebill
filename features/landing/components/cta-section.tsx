import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LandingUser } from "../lib/types";
import { Reveal } from "./reveal";

export function CtaSection({ user }: { user: LandingUser | null }) {
  return (
    <section aria-labelledby="cta-heading">
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20 lg:pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-purple px-6 py-14 text-center sm:px-14 sm:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0">
              <div className="absolute -right-16 -top-16 size-56 rounded-full bg-white/10" />
              <div className="absolute -bottom-20 -left-12 size-64 rounded-full bg-white/10" />
              <div className="absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-purple-light/50 blur-3xl" />
            </div>

            <div className="relative flex flex-col items-center gap-5">
              <h2
                id="cta-heading"
                className="text-3xl font-bold tracking-[-0.5px] text-white sm:text-4xl">
                {user
                  ? "Pick up where you left off."
                  : "Create your first invoice in minutes."}
              </h2>
              <p className="max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-base">
                {user
                  ? "Your clients, invoices, and insights are ready whenever you are."
                  : "Sign up with email or Google, add a client, and send a professional invoice today. The dashboard takes it from there."}
              </p>

              <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-[15px] font-bold text-purple transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                    Go to dashboard
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/sign-up"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-[15px] font-bold text-purple transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                      Get started
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/auth/sign-in"
                      className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 px-7 text-[15px] font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                      Sign in
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
