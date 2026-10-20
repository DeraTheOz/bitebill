"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import {
  distribution,
  insights,
  revenueByMonth,
  revenueCards,
} from "@/features/landing/data/analytics";
import { Reveal } from "./reveal";

export function AnalyticsSection() {
  return (
    <section id="analytics" className="scroll-mt-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <Reveal>
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] sm:p-7 dark:shadow-none">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[15px] font-bold text-ink">
                  Revenue overview
                </p>
                <p className="text-[13px] font-medium text-muted-light">
                  Last 8 months
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-status-paid/10 px-3 py-1 text-[13px] font-bold text-status-paid">
                +18.4%
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {revenueCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-border bg-canvas p-3.5">
                  <p className="text-[13px] font-medium text-muted-light">
                    {card.label}
                  </p>
                  <p
                    className={`mt-1 text-[17px] font-bold tracking-[-0.25px] sm:text-[19px] ${card.accent}`}>
                    {card.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex h-44 items-end gap-2 sm:gap-3">
              {revenueByMonth.map((bar, index) => (
                <div
                  key={bar.month}
                  className="flex h-full flex-1 flex-col gap-2">
                  <div className="flex flex-1 items-end">
                    <motion.div
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{
                        duration: 0.5,
                        ease: "easeOut",
                        delay: index * 0.06,
                      }}
                      style={{
                        height: `${bar.value}%`,
                        transformOrigin: "bottom",
                      }}
                      className={`w-full rounded-t-md ${
                        index === revenueByMonth.length - 1
                          ? "bg-purple"
                          : "bg-purple/25"
                      }`}
                    />
                  </div>
                  <span className="text-center text-[11px] font-bold text-muted-light">
                    {bar.month}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-[13px] font-bold">
              {distribution.map((item) => (
                <span
                  key={item.label}
                  className="flex items-center gap-2 text-muted">
                  <span className={`size-2 rounded-full ${item.dot}`} />
                  {item.label}
                  <span className="text-ink">{item.share}</span>
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex flex-col items-start gap-5">
            <p className="text-[13px] font-bold uppercase tracking-[0.15em] text-purple">
              Analytics
            </p>
            <h2 className="text-3xl font-bold tracking-[-0.5px] text-ink sm:text-4xl">
              Know exactly where your business stands.
            </h2>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
              A dashboard that answers the real questions: what came in, what is
              still out there, and what is late.
            </p>
            <ul className="mt-1 flex flex-col gap-3">
              {insights.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[15px] font-medium text-ink">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-purple/10">
                    <Check
                      className="size-3.5 text-purple"
                      aria-hidden="true"
                    />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
