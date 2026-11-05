"use client";

import { MapPin } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { CountrySelectField } from "@/components/forms/country-select-field";
import { TextField } from "@/components/forms/text-field";
import { getCurrencyForCountry } from "@/lib/countries";
import type { OnboardingValues } from "../../schemas/onboarding-schema";
import { StepHeader } from "../step-header";

export function AddressStep() {
  const {
    register,
    watch,
    setValue,
    getFieldState,
    formState: { errors },
  } = useFormContext<OnboardingValues>();

  const country = watch("country") ?? "";

  const handleCountryChange = (selectedCountry: string) => {
    setValue("country", selectedCountry, {
      shouldDirty: true,
      shouldValidate: true,
    });

    const currencyState = getFieldState("currency");
    if (!currencyState.isDirty) {
      const suggestedCurrency = getCurrencyForCountry(selectedCountry);
      if (suggestedCurrency) {
        setValue("currency", suggestedCurrency, {
          shouldDirty: false,
          shouldValidate: true,
        });
      }
    }
  };

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

          <CountrySelectField
            label="Country"
            id="country"
            name="country"
            value={country}
            error={errors.country?.message}
            onChange={handleCountryChange}
          />
        </div>
      </div>
    </>
  );
}
