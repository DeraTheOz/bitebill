"use client";

import { MapPin } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { TextField } from "@/components/forms/text-field";
import type { OnboardingValues } from "../../schemas/onboarding-schema";
import { StepHeader } from "../step-header";

export function AddressStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingValues>();

  return (
    <>
      <StepHeader
        icon={MapPin}
        title="Where are you based?"
        description="Your address prints on invoices so clients know exactly who they are paying."
      />

      <div className="mt-6 flex flex-col gap-5">
        <TextField
          label="Office / Street address"
          id="address-line-1"
          type="text"
          autoComplete="address-line1"
          placeholder="123 Market Street"
          error={errors.addressLine1?.message}
          {...register("addressLine1")}
        />

        <TextField
          label="Address line 2 (optional)"
          id="address-line-2"
          type="text"
          autoComplete="address-line2"
          placeholder="Suite 400"
          error={errors.addressLine2?.message}
          {...register("addressLine2")}
        />

        <div className="grid gap-5 sm:grid-cols-3">
          <TextField
            label="City"
            id="city"
            type="text"
            autoComplete="address-level2"
            placeholder="San Francisco"
            error={errors.city?.message}
            {...register("city")}
          />

          <TextField
            label="State / Region"
            id="state"
            type="text"
            autoComplete="address-level1"
            placeholder="California"
            error={errors.state?.message}
            {...register("state")}
          />

          <TextField
            label="Country"
            id="country"
            type="text"
            autoComplete="country-name"
            placeholder="United States"
            error={errors.country?.message}
            {...register("country")}
          />
        </div>
      </div>
    </>
  );
}
