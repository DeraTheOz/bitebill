"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  useForm,
  type FieldPath,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Palette } from "lucide-react";
import { toast } from "react-hot-toast";
import { DEFAULT_BRAND_COLOR } from "../lib/brand-colors";
import { finishOnboarding } from "../lib/finish-onboarding";
import {
  onboardingSchema,
  stepSchemas,
  type OnboardingValues,
} from "../schemas/onboarding-schema";
import type { OnboardingStep } from "../components/step-indicator";

export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  { label: "Business", icon: Building2 },
  { label: "Address", icon: MapPin },
  { label: "Branding", icon: Palette },
] as const;

export const STEP_BY_FIELD: Record<string, number> = {
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

type UseOnboardingFlowOptions = {
  user: {
    name: string;
    email: string;
  };
};

export type UseOnboardingFlowReturn = {
  methods: UseFormReturn<OnboardingValues>;
  step: number;
  direction: number;
  isFinishing: boolean;
  isNavigating: boolean;
  cardRef: React.RefObject<HTMLFormElement | null>;
  firstName: string;
  isLastStep: boolean;
  steps: readonly OnboardingStep[];
  goNext: () => Promise<void>;
  goBack: () => void;
  goToStep: (target: number) => void;
  onSubmit: () => Promise<void>;
};

export function useOnboardingFlow({
  user,
}: UseOnboardingFlowOptions): UseOnboardingFlowReturn {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isNavigating, startNavigation] = useTransition();
  const cardRef = useRef<HTMLFormElement>(null);
  const isFirstRender = useRef(true);

  const isFinishing = isSaving || isNavigating;

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
    setStep((current) => Math.min(current + 1, ONBOARDING_STEPS.length - 1));
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
          Math.min(earliest, STEP_BY_FIELD[String(issue.path[0])] ?? 0),
        ONBOARDING_STEPS.length - 1,
      );
      setDirection(-1);
      setStep(targetStep);
      return;
    }

    setIsSaving(true);
    try {
      await finishOnboarding(parsed.data);
      toast.success("Workspace setup complete!");
      startNavigation(() => {
        router.push("/dashboard");
        // Drop any cached pre-onboarding RSC payload (e.g. an earlier
        // redirect back to /onboarding).
        router.refresh();
      });
    } catch {
      toast.error("We couldn't save your setup. Please try again.");
      setIsSaving(false);
    }
  };

  const firstName = user.name.trim().split(/\s+/)[0] ?? "";
  const isLastStep = step === ONBOARDING_STEPS.length - 1;

  return {
    methods,
    step,
    direction,
    isFinishing,
    isNavigating,
    cardRef,
    firstName,
    isLastStep,
    steps: ONBOARDING_STEPS,
    goNext,
    goBack,
    goToStep,
    onSubmit,
  };
}
