"use client";

import { type ChangeEvent } from "react";
import Image from "next/image";
import { useFormContext } from "react-hook-form";
import { Palette, Upload, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { ColorSelectField } from "@/components/forms/color-select-field";
import { SelectField } from "@/components/forms/select-field";
import { TextAreaField } from "@/components/forms/text-area-field";
import { TextField } from "@/components/forms/text-field";
import {
  brandColors,
  lightenHex,
  readableOnWhite,
} from "../../lib/brand-colors";
import type { OnboardingValues } from "../../schemas/onboarding-schema";
import { StepHeader } from "../step-header";

const currencies = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "CAD", symbol: "C$" },
  { code: "AUD", symbol: "A$" },
  { code: "INR", symbol: "₹" },
  { code: "NGN", symbol: "₦" },
  { code: "JPY", symbol: "¥" },
  { code: "GHS", symbol: "₵" },
  { code: "KES", symbol: "KSh" },
  { code: "EGP", symbol: "E£" },
  { code: "ZAR", symbol: "R" },
];

const templates = [
  { value: "classic", label: "Classic", description: "Timeless, minimal" },
  { value: "modern", label: "Modern", description: "Bold brand-color header" },
  { value: "corporate", label: "Corporate", description: "Structured accent" },
] as const;

export function BrandingStep() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<OnboardingValues>();

  const logoUrl = watch("logoUrl");
  const brandColor = watch("brandColor");
  const prefix = watch("invoicePrefix") || "BB";

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Choose a PNG, JPG, SVG, or WebP file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Keep the logo under 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () =>
      setValue("logoUrl", String(reader.result), { shouldDirty: true });
    reader.readAsDataURL(file);
  };

  return (
    <>
      <StepHeader
        icon={Palette}
        title="Make it yours"
        description="Logo, colors, currency, and numbering. The details that make every invoice feel professional."
      />

      <div className="mt-6 flex flex-col gap-7">
        <div className="flex flex-wrap items-center gap-4">
          <span
            className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border"
            style={{ backgroundColor: brandColor }}>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Your logo preview"
                width={64}
                height={64}
                unoptimized
                className="relative size-16 object-contain p-1.5"
              />
            ) : (
              <>
                <span
                  className="absolute bottom-0 left-0 h-1/2 w-full rounded-br-xl mask-[url('/assets/logo-bg.svg')] mask-repeat:no-repeat mask-size-[100%_100%]"
                  style={{ backgroundColor: lightenHex(brandColor) }}
                />
                <Image
                  src="/assets/logo-white.svg"
                  width={26}
                  height={26}
                  alt=""
                  className="relative"
                />
              </>
            )}
          </span>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="logo-upload"
              className="inline-flex h-10 w-fit cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 text-[13px] font-bold text-ink transition-colors hover:border-purple hover:text-purple focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-purple">
              <Upload className="size-3.5" aria-hidden="true" />
              {logoUrl ? "Replace logo" : "Upload logo"}
              <input
                id="logo-upload"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleLogoChange}
                className="sr-only"
              />
            </label>
            <p className="text-[13px] font-medium text-muted-light">
              PNG, JPG, SVG, or WebP. Up to 2 MB.
            </p>
          </div>

          {logoUrl && (
            <button
              type="button"
              onClick={() => setValue("logoUrl", "", { shouldDirty: true })}
              aria-label="Remove logo"
              className="grid size-9 place-items-center rounded-full border border-border bg-surface text-muted-light transition-colors hover:border-danger hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple">
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Currency"
            id="currency"
            error={errors.currency?.message}
            {...register("currency")}>
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} ({currency.symbol})
              </option>
            ))}
          </SelectField>

          <ColorSelectField
            label="Brand color"
            id="brand-color"
            colors={brandColors}
            value={brandColor}
            error={errors.brandColor?.message}
            onChange={(event) =>
              setValue("brandColor", event.currentTarget.value, {
                shouldDirty: true,
              })
            }
          />
        </div>

        <div className="max-w-xs">
          <TextField
            label="Invoice prefix"
            id="invoice-prefix"
            type="text"
            maxLength={6}
            placeholder="BB"
            className="uppercase"
            error={errors.invoicePrefix?.message}
            {...register("invoicePrefix")}
          />
          <p className="mt-2 text-[13px] font-medium text-muted-light">
            Your next invoice will read{" "}
            <span
              className="font-bold"
              style={{ color: readableOnWhite(brandColor) }}>
              {prefix.toUpperCase()}-0001
            </span>
          </p>
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-[13px] font-medium text-muted">
            PDF template
          </legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {templates.map((template) => (
              <label key={template.value} className="cursor-pointer">
                <input
                  type="radio"
                  value={template.value}
                  {...register("pdfTemplate")}
                  className="peer sr-only"
                />
                <span className="flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-colors peer-checked:border-purple peer-checked:bg-purple/5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-purple">
                  <span
                    aria-hidden="true"
                    className={`flex h-16 flex-col gap-1.5 rounded-md border border-border bg-canvas p-2 ${
                      template.value === "corporate"
                        ? "border-l-4 border-l-sidebar"
                        : ""
                    }`}>
                    <span
                      className={`h-3 w-2/3 rounded-sm ${
                        template.value === "modern"
                          ? ""
                          : template.value === "classic"
                            ? "mx-auto bg-border"
                            : "bg-sidebar"
                      }`}
                      style={
                        template.value === "modern"
                          ? { backgroundColor: brandColor }
                          : undefined
                      }
                    />
                    <span className="h-1.5 w-full rounded-sm bg-border/70" />
                    <span className="h-1.5 w-5/6 rounded-sm bg-border/70" />
                    <span className="mt-auto h-2 w-1/3 self-end rounded-sm border border-border bg-surface" />
                  </span>
                  <span>
                    <span className="block text-[15px] font-bold text-ink">
                      {template.label}
                    </span>
                    <span className="block text-[13px] font-medium text-muted-light">
                      {template.description}
                    </span>
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <TextAreaField
          label="Default terms (optional)"
          id="default-terms"
          rows={3}
          maxLength={500}
          placeholder="Payment due within 14 days of issue."
          error={errors.defaultTerms?.message}
          {...register("defaultTerms")}
        />
      </div>
    </>
  );
}
