"use client";

import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import type { LandingUser } from "../lib/types";
import { InvoiceMockup } from "./invoice-mockup";

export function Hero({ user }: { user: LandingUser | null }) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-32 h-104 w-104 rounded-full bg-purple/15 blur-3xl" />
        <div className="absolute top-40 left-40 h-80 w-80 rounded-full bg-purple/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[26px_26px] mask-[linear-gradient(to_bottom,black,transparent_75%)] opacity-70" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-28 lg:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-start gap-6 max-w-125 z-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-[13px] font-bold text-purple">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Everything you need to invoice &amp; get paid
          </span>

          <h1 className="text-4xl font-bold leading-[1.05] tracking-[-0.75px] text-ink sm:text-5xl lg:text-[56px]">
            Send beautiful invoices.{" "}
            <span className="text-purple">Get paid faster.</span>
          </h1>

          <p className="max-w-xl text-[16px] leading-relaxed text-muted sm:text-[17px]">
            BiteBill gives freelancers, consultants, and small businesses
            everything to create branded invoices, manage clients, and track
            every payment in one fast, focused dashboard.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href={user ? "/dashboard" : "/auth/sign-up"}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-button-purple px-7 text-[15px] font-bold text-white transition-colors hover:bg-button-purple-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple">
              {user ? "Go to dashboard" : "Start invoicing"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-surface px-7 text-[15px] font-bold text-ink transition-colors hover:border-purple hover:text-purple focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple">
              Explore features
            </Link>
          </div>

          <p className="text-[13px] font-medium text-muted-light">
            Email & Google sign-in · Ready in under a minute
          </p>
        </motion.div>

        <InvoiceMockup />
      </div>
    </section>
  );
}
