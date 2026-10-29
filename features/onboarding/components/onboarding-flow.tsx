"use client";

import { AnimatePresence, motion } from "motion/react";
import { FormProvider } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { MotionProvider } from "@/components/motion-provider";
import { signOut } from "@/features/auth/actions/sign-out";
import { ThemeToggle } from "@/features/theme/components/theme-toggle";
import { useOnboardingFlow } from "../hooks/use-onboarding-flow";
import { InvoicePreview } from "./invoice-preview";
import { StepIndicator } from "./step-indicator";
import { AddressStep } from "./steps/address-step";
import { BrandingStep } from "./steps/branding-step";
import { BusinessStep } from "./steps/business-step";

const stepVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 40 : -40,
  }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -40 : 40,
  }),
};

const primaryButtonClasses =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-button-purple px-7 text-[15px] font-bold text-white transition-colors hover:bg-button-purple-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple disabled:cursor-not-allowed disabled:opacity-60";

const ghostButtonClasses =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-surface px-6 text-[15px] font-bold text-ink transition-colors hover:border-purple hover:text-purple focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-ink";

type OnboardingFlowProps = {
  user: { name: string; email: string };
};

export function OnboardingFlow({ user }: OnboardingFlowProps) {
  const {
    methods,
    step,
    direction,
    isFinishing,
    isNavigating,
    cardRef,
    firstName,
    isLastStep,
    steps,
    goNext,
    goBack,
    goToStep,
    onSubmit,
  } = useOnboardingFlow({ user });

  return (
    <MotionProvider>
      <FormProvider {...methods}>
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
          <div className="mb-10 flex items-center justify-end gap-4">
            <ThemeToggle className="grid size-10 place-items-center" />
            <form action={signOut}>
              <button
                type="submit"
                className="text-[13px] font-bold text-muted-light transition-colors hover:text-purple focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple">
                Sign out
              </button>
            </form>
          </div>
          <header className="flex max-w-3xl flex-col items-start gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] font-bold text-purple">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Setting up your workspace
            </span>
            <h1 className="max-w-90 text-3xl font-bold tracking-[-0.5px] text-ink sm:text-4xl">
              Welcome{firstName ? `, ${firstName}` : ""}. Let&apos;s get you
              started.
            </h1>
            <p className="max-w-90 text-[15px] leading-relaxed text-muted sm:text-base">
              Three quick steps and your invoice setup is ready. You can change
              everything later in settings.
            </p>
            <div className="mt-2 w-full">
              <StepIndicator
                steps={steps}
                current={step}
                onSelect={goToStep}
                disabled={isFinishing}
              />
            </div>
          </header>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_440px]">
            <form
              ref={cardRef}
              noValidate
              onSubmit={methods.handleSubmit(onSubmit)}
              className="scroll-mt-24 rounded-2xl border border-border bg-surface p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] sm:p-8 dark:shadow-none">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: "easeOut" }}>
                  {step === 0 && <BusinessStep />}
                  {step === 1 && <AddressStep />}
                  {step === 2 && <BrandingStep />}
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={step === 0 || isFinishing}
                    aria-label="Previous step"
                    className={ghostButtonClasses}>
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Back</span>
                  </button>
                  <p className="text-[13px] font-medium text-muted-light sm:hidden">
                    Step {step + 1} of {steps.length}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={isLastStep}
                    className={isLastStep ? "hidden" : primaryButtonClasses}>
                    Continue
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="submit"
                    disabled={!isLastStep || isFinishing}
                    className={isLastStep ? primaryButtonClasses : "hidden"}>
                    {isFinishing ? (
                      <>
                        <LoaderCircle
                          className="size-4 animate-spin"
                          aria-hidden="true"
                        />
                        {isNavigating ? "Redirecting…" : "Saving…"}
                      </>
                    ) : (
                      <>
                        Finish setup
                        <Check className="size-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            <aside aria-label="Invoice preview">
              <div className="lg:sticky lg:top-24">
                <InvoicePreview />
              </div>
            </aside>
          </div>
        </div>
      </FormProvider>
    </MotionProvider>
  );
}
