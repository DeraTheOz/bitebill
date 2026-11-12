"use client";

import { useFormContext } from "react-hook-form";
import { InvoicePreviewCard } from "@/features/branding/components/invoice-preview";
import type { OnboardingValues } from "../schemas/onboarding-schema";

export function InvoicePreview() {
  const { watch } = useFormContext<OnboardingValues>();
  const values = watch();

  return (
    <InvoicePreviewCard
      businessName={values.businessName}
      businessEmail={values.businessEmail}
      logoSrc={values.logoUrl || null}
      brandColor={values.brandColor}
      currency={values.currency}
      invoicePrefix={values.invoicePrefix}
      pdfTemplate={values.pdfTemplate}
      defaultTerms={values.defaultTerms}
    />
  );
}
