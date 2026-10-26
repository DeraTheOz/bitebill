"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  FormProvider,
  useForm,
  type FieldPath,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  LoaderCircle,
  MapPin,
  Palette,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { MotionProvider } from "@/components/motion-provider";
import { signOut } from "@/features/auth/actions/sign-out";
import { ThemeToggle } from "@/features/theme/components/theme-toggle";
import { DEFAULT_BRAND_COLOR } from "../lib/brand-colors";
import { finishOnboarding } from "../lib/finish-onboarding";
import {
  onboardingSchema,
  stepSchemas,
  type OnboardingValues,
} from "../schemas/onboarding-schema";
import { InvoicePreview } from "./invoice-preview";
import { StepIndicator } from "./step-indicator";
import { AddressStep } from "./steps/address-step";
import { BrandingStep } from "./steps/branding-step";
import { BusinessStep } from "./steps/business-step";

const steps = [
  { label: "Business", icon: Building2 },
  { label: "Address", icon: MapPin },
  { label: "Branding", icon: Palette },
] as const;

const stepByField: Record<string, number> = {
  businessName: 0,
  businessEmail: 0,
  businessPhone: 0,
  website: 0,
  addressLine1: 1,
  addressLine2: 1,
  city: 1,
  state: 1,
  country: 1,
  logoUrl: 2,
  brandColor: 2,
  currency: 2,
  invoicePrefix: 2,
  pdfTemplate: 2,
  defaultTerms: 2,
};

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
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isFinishing, setIsFinishing] = useState(false);
  const cardRef = useRef<HTMLFormElement>(null);
  const isFirstRender = useRef(true);

  const methods = useForm<OnboardingValues>({
    resolver: zodResolver(
      stepSchemas[step],
    ) as unknown as Resolver<OnboardingValues>,
    defaultValues: {
      businessName: "",
      businessEmail: user.email,
      businessPhone: "",
      website: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "",
      logoUrl: "",
      brandColor: DEFAULT_BRAND_COLOR,
      currency: "USD",
      invoicePrefix: "BB",
      pdfTemplate: "classic",
      defaultTerms: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const goNext = async () => {
    const valid = await methods.trigger(undefined, { shouldFocus: true });
    if (!valid) return;
    setDirection(1);
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const goBack = () => {
    if (isFinishing) return;
    setDirection(-1);
    setStep((current) => Math.max(current - 1, 0));
  };

  const goToStep = (target: number) => {
    if (isFinishing || target >= step) return;
    setDirection(-1);
    setStep(target);
  };

  const onSubmit = async () => {
    if (isFinishing) return;
    const parsed = onboardingSchema.safeParse(methods.getValues());

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        methods.setError(issue.path.join(".") as FieldPath<OnboardingValues>, {
          message: issue.message,
        });
      });
      const targetStep = parsed.error.issues.reduce(
        (earliest, issue) =>
          Math.min(earliest, stepByField[String(issue.path[0])] ?? 0),
        steps.length - 1,
      );
      setDirection(-1);
      setStep(targetStep);
      return;
    }

    setIsFinishing(true);
    try {
      await finishOnboarding(parsed.data);
      router.push("/dashboard");
      // Drop any cached pre-onboarding RSC payload (e.g. an earlier
      // redirect back to /onboarding).
      router.refresh();
    } catch {
      toast.error("We couldn't save your setup. Please try again.");
    } finally {
      setIsFinishing(false);
    }
  };

  const firstName = user.name.trim().split(/\s+/)[0] ?? "";
  const isLastStep = step === steps.length - 1;

  return (
    <MotionProvider>
      <FormProvider {...methods}>
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6 md:pt-32 lg:pt-12 xl:pt-16">
          <div className="mb-4 flex items-center justify-end gap-4">
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
                        Saving…
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
