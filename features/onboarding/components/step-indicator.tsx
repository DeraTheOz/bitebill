"use client";

import { Fragment } from "react";
import { motion } from "motion/react";
import { Check, type LucideIcon } from "lucide-react";

export type OnboardingStep = {
  label: string;
  icon: LucideIcon;
};

type StepIndicatorProps = {
  steps: readonly OnboardingStep[];
  current: number;
  onSelect: (step: number) => void;
  disabled?: boolean;
};

export function StepIndicator({
  steps,
  current,
  onSelect,
  disabled = false,
}: StepIndicatorProps) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {steps.map((step, index) => {
        const isComplete = index < current;
        const isCurrent = index === current;
        const Icon = step.icon;

        return (
          <Fragment key={step.label}>
            {index > 0 && (
              <li
                aria-hidden="true"
                className="relative h-0.5 min-w-4 flex-1 overflow-hidden rounded-full bg-border">
                <motion.span
                  initial={false}
                  animate={{ width: current >= index ? "100%" : "0%" }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 bg-purple"
                />
              </li>
            )}
            <li className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(index)}
                disabled={disabled || index > current}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Step ${index + 1}: ${step.label}`}
                className="flex items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple disabled:cursor-default"
              >
                <span
                  className={`grid size-10 place-items-center rounded-full border-2 transition-colors ${
                    isComplete
                      ? "border-purple bg-purple text-white"
                      : isCurrent
                        ? "border-purple bg-purple/10 text-purple"
                        : "border-border bg-surface text-muted-light"
                  }`}>
                  {isComplete ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    <Icon className="size-4" aria-hidden="true" />
                  )}
                </span>
                <span className="hidden flex-col items-start sm:flex">
                  <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted-light">
                    Step {index + 1}
                  </span>
                  <span
                    className={`text-[15px] font-bold ${
                      index <= current ? "text-ink" : "text-muted-light"
                    }`}>
                    {step.label}
                  </span>
                </span>
              </button>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
