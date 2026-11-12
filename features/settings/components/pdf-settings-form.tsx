"use client";

import { SaveChangesButton } from "@/components/buttons/save-changes-button";
import { CurrencySelectField } from "@/components/forms/currency-select-field";
import { TextAreaField } from "@/components/forms/text-area-field";
import { TextField } from "@/components/forms/text-field";
import { Spinner } from "@/components/loaders/spinner";
import { InvoicePreviewCard } from "@/features/branding/components/invoice-preview";
import {
  pdfTemplates,
  readableOnWhite,
} from "@/features/branding/lib/brand-colors";
import { CURRENCIES } from "@/lib/currencies";
import { usePdfSettingsForm } from "../hooks/use-pdf-settings-form";

export function PdfSettingsForm() {
  const {
    branding,
    logoSrc,
    watched,
    errors,
    isDirty,
    isPending,
    register,
    handleCurrencyChange,
    handleSubmit,
  } = usePdfSettingsForm();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_410px]">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="space-y-8 rounded-2xl border border-border bg-surface p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] sm:p-8 dark:shadow-none">
        <div>
          <h2 className="text-[18px] font-bold tracking-[-0.25px] text-ink">
            Numbering & Currency
          </h2>
          <p className="mt-1 text-[13px] font-medium text-muted-light">
            Applied automatically to all newly created and recurring invoices.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <CurrencySelectField
              label="Default currency"
              id="settings-currency"
              name="currency"
              currencies={CURRENCIES}
              value={watched.currency}
              error={errors.currency?.message}
              onChange={handleCurrencyChange}
            />

            <div>
              <TextField
                label="Invoice prefix"
                id="settings-invoice-prefix"
                type="text"
                maxLength={6}
                placeholder="BB"
                className="uppercase"
                disabled={isPending}
                error={errors.invoicePrefix?.message}
                {...register("invoicePrefix")}
              />
              <p className="mt-2 text-[13px] font-medium text-muted-light">
                Next invoice format:{" "}
                <span
                  className="font-bold"
                  style={{ color: readableOnWhite(branding.brandColor) }}>
                  {(watched.invoicePrefix || "BB").toUpperCase()}-0001
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <fieldset className="flex flex-col gap-3">
            <legend className="text-[16px] font-bold text-ink">
              Default PDF Template
            </legend>
            <p className="text-[13px] font-medium text-muted-light">
              Choose the layout style rendered on exported PDF documents.
            </p>

            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {pdfTemplates.map((template) => (
                <label key={template.value} className="cursor-pointer">
                  <input
                    type="radio"
                    value={template.value}
                    disabled={isPending}
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
                            ? { backgroundColor: branding.brandColor }
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
        </div>

        <div className="border-t border-border pt-6">
          <TextAreaField
            label="Default payment terms (optional)"
            id="settings-default-terms"
            rows={3}
            maxLength={500}
            placeholder="Payment due within 14 days of issue."
            disabled={isPending}
            error={errors.defaultTerms?.message}
            {...register("defaultTerms")}
          />
          <p className="mt-1.5 text-[12px] font-medium text-muted-light">
            Printed in the footer of every PDF and shared invoice view.
          </p>
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
            businessName={branding.businessName}
            businessEmail={branding.businessEmail}
            logoSrc={logoSrc}
            brandColor={branding.brandColor}
            currency={watched.currency}
            invoicePrefix={watched.invoicePrefix}
            pdfTemplate={watched.pdfTemplate}
            defaultTerms={watched.defaultTerms}
          />
        </div>
      </aside>
    </div>
  );
}
