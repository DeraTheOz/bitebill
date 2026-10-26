"use client";

import { Building2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { TextField } from "@/components/forms/text-field";
import type { OnboardingValues } from "../../schemas/onboarding-schema";
import { StepHeader } from "../step-header";

export function BusinessStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingValues>();

  return (
    <>
      <StepHeader
        icon={Building2}
        title="Tell us about your business"
        description="This is the info that appears at the top of every invoice and PDF you send."
      />

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextField
            label="Business name"
            id="business-name"
            type="text"
            autoComplete="organization"
            placeholder="Acme Studio"
            error={errors.businessName?.message}
            {...register("businessName")}
          />
        </div>

        <TextField
          label="Business email"
          id="business-email"
          type="email"
          autoComplete="email"
          placeholder="billing@acme.studio"
          error={errors.businessEmail?.message}
          {...register("businessEmail")}
        />

        <TextField
          label="Business phone"
          id="business-phone"
          type="tel"
          autoComplete="tel"
          placeholder="+1 (555) 000-0000"
          error={errors.businessPhone?.message}
          {...register("businessPhone")}
        />

        <div className="sm:col-span-2">
          <TextField
            label="Website (optional)"
            id="website"
            type="url"
            autoComplete="url"
            placeholder="https://acme.studio"
            error={errors.website?.message}
            {...register("website")}
          />
        </div>
      </div>
    </>
  );
}
