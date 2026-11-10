"use client";

import { useController, type Control } from "react-hook-form";
import { TextField } from "@/components/forms/text-field";
import { useTaxRateInput } from "../hooks/use-tax-rate-input";
import type {
  InvoiceFormInput,
  InvoiceFormValues,
} from "../schemas/invoice-schema";

export function TaxRateField({
  control,
  disabled,
}: {
  control: Control<InvoiceFormInput, unknown, InvoiceFormValues>;
  disabled: boolean;
}) {
  const { field, fieldState } = useController({
    control,
    name: "taxRate",
  });

  const { displayValue, handleChange, handlePaste, handleBlur } =
    useTaxRateInput({
      value: field.value,
      onChange: field.onChange,
      onBlur: field.onBlur,
    });

  return (
    <TextField
      id="taxRate"
      label="Tax Rate (%)"
      type="text"
      inputMode="decimal"
      placeholder="0"
      value={displayValue}
      error={fieldState.error?.message}
      disabled={disabled}
      onChange={handleChange}
      onPaste={handlePaste}
      onBlur={handleBlur}
    />
  );
}

