"use client";

import Image from "next/image";
import { Upload, X } from "lucide-react";
import { SaveChangesButton } from "@/components/buttons/save-changes-button";
import { ColorSelectField } from "@/components/forms/color-select-field";
import { CountrySelectField } from "@/components/forms/country-select-field";
import { TextField } from "@/components/forms/text-field";
import { Spinner } from "@/components/loaders/spinner";
import { InvoicePreviewCard } from "@/features/branding/components/invoice-preview";
import { brandColors, lightenHex } from "@/features/branding/lib/brand-colors";
import { useBrandingSettingsForm } from "../hooks/use-branding-settings-form";

export function BrandingSettingsForm() {
  const {
    branding,
    watched,
    logoPreviewSrc,
    errors,
    isDirty,
    isPending,
    register,
    handleSubmit,
    handleLogoChange,
    handleRemoveLogo,
    handleBrandColorChange,
    handleCountryChange,
  } = useBrandingSettingsForm();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_410px]">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="space-y-8 rounded-2xl border border-border bg-surface p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] sm:p-8 dark:shadow-none">
        <div>
          <h2 className="text-[18px] font-bold tracking-[-0.25px] text-ink">
            Brand Identity & Logo
          </h2>
          <p className="mt-1 text-[13px] font-medium text-muted-light">
            Shown in the Bill From section of invoices, public share links, and
            PDFs.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            {logoPreviewSrc ? (
              <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoPreviewSrc}
                  alt="Business logo"
                  className="max-h-full max-w-full object-contain"
                />
              </span>
            ) : (
              <span
                className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border"
                style={{ backgroundColor: watched.brandColor }}>
                <span
                  className="absolute bottom-0 left-0 h-1/2 w-full rounded-br-xl mask-[url('/assets/logo-bg.svg')] mask-repeat:no-repeat mask-size-[100%_100%]"
                  style={{ backgroundColor: lightenHex(watched.brandColor) }}
                />
                <Image
                  src="/assets/logo-white.svg"
                  width={26}
                  height={26}
                  alt=""
                  className="relative"
                />
              </span>
            )}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="settings-logo-upload"
                className="inline-flex h-10 w-fit cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 text-[13px] font-bold text-ink transition-colors hover:border-purple hover:text-purple focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-purple">
                <Upload className="size-3.5" aria-hidden="true" />
                {logoPreviewSrc ? "Replace logo" : "Upload logo"}
                <input
                  id="settings-logo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleLogoChange}
                  disabled={isPending}
                  className="sr-only"
                />
              </label>
              <p className="text-[13px] font-medium text-muted-light">
                PNG, JPG, SVG, or WebP. Up to 2 MB.
              </p>
            </div>

            {logoPreviewSrc && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                disabled={isPending}
                aria-label="Remove logo"
                className="grid size-9 place-items-center rounded-full border border-border bg-surface text-muted-light transition-colors hover:border-danger hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple disabled:cursor-not-allowed disabled:opacity-50">
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="mt-6 max-w-xs">
            <ColorSelectField
              label="Brand color"
              id="settings-brand-color"
              name="brandColor"
              colors={brandColors}
              value={watched.brandColor}
              align="left"
              error={errors.brandColor?.message}
              onChange={handleBrandColorChange}
            />
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="text-[16px] font-bold text-ink">
            Business Contact Info
          </h3>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField
                label="Business name"
                id="settings-business-name"
                type="text"
                autoComplete="organization"
                disabled={isPending}
                error={errors.businessName?.message}
                {...register("businessName")}
              />
            </div>

            <TextField
              label="Business email"
              id="settings-business-email"
              type="email"
              autoComplete="email"
              disabled={isPending}
              error={errors.businessEmail?.message}
              {...register("businessEmail")}
            />

            <TextField
              label="Business phone (optional)"
              id="settings-business-phone"
              type="tel"
              autoComplete="tel"
              disabled={isPending}
              error={errors.businessPhone?.message}
              {...register("businessPhone")}
            />

            <div className="sm:col-span-2">
              <TextField
                label="Website (optional)"
                id="settings-website"
                type="url"
                autoComplete="url"
                placeholder="https://yoursite.com"
                disabled={isPending}
                error={errors.website?.message}
                {...register("website")}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="text-[16px] font-bold text-ink">Business Address</h3>

          <div className="mt-5 flex flex-col gap-5">
            <TextField
              label="Office / Street address"
              id="settings-address-line-1"
              type="text"
              autoComplete="address-line1"
              disabled={isPending}
              error={errors.addressLine1?.message}
              {...register("addressLine1")}
            />

            <TextField
              label="Address line 2 (optional)"
              id="settings-address-line-2"
              type="text"
              autoComplete="address-line2"
              disabled={isPending}
              error={errors.addressLine2?.message}
              {...register("addressLine2")}
            />

            <div className="grid gap-5 sm:grid-cols-3">
              <TextField
                label="City"
                id="settings-city"
                type="text"
                autoComplete="address-level2"
                disabled={isPending}
                error={errors.city?.message}
                {...register("city")}
              />

              <TextField
                label="State / Region"
                id="settings-state"
                type="text"
                autoComplete="address-level1"
                disabled={isPending}
                error={errors.state?.message}
                {...register("state")}
              />

              <CountrySelectField
                label="Country"
                id="settings-country"
                name="country"
                value={watched.country}
                error={errors.country?.message}
                onChange={handleCountryChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-6">
          <SaveChangesButton
            type="submit"
            disabled={!isDirty || isPending}
            className="inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60">
            {isPending ? (
              <>
                <Spinner className="size-4" tone="currentColor" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </SaveChangesButton>
        </div>
      </form>

      <aside aria-label="Invoice preview">
        <div className="lg:sticky lg:top-8">
          <InvoicePreviewCard
            businessName={watched.businessName}
            businessEmail={watched.businessEmail}
            logoSrc={logoPreviewSrc}
            brandColor={watched.brandColor}
            currency={branding.currency}
            invoicePrefix={branding.invoicePrefix}
            pdfTemplate={branding.defaultPdfTemplate}
            defaultTerms={branding.defaultTerms ?? ""}
          />
        </div>
      </aside>
    </div>
  );
}
