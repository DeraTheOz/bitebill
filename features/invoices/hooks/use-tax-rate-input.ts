"use client";

import type { ChangeEvent, ClipboardEvent } from "react";

/**
 * Normalizes pasted content for the tax rate field:
 * - Replaces commas with decimal points
 * - Strips any non-numeric and non-dot characters (e.g. '%' or letters)
 * - Limits decimal precision to at most 2 places
 * - Clamps values between 0 and 100
 */
export function sanitizeTaxRatePaste(raw: string): string {
  const cleaned = raw.replace(/,/g, ".").replace(/[^0-9.]/g, "");
  if (!cleaned) return "";

  const firstDot = cleaned.indexOf(".");
  let intPart = cleaned;
  let decPart: string | undefined;

  if (firstDot !== -1) {
    intPart = cleaned.slice(0, firstDot);
    decPart = cleaned.slice(firstDot + 1).replace(/\./g, "").slice(0, 2);
  }

  if (!intPart && decPart !== undefined) {
    intPart = "0";
  }

  if (intPart.length > 1 && /^0\d/.test(intPart)) {
    intPart = String(parseInt(intPart, 10));
  }

  const formatted = decPart !== undefined ? `${intPart}.${decPart}` : intPart;
  const num = Number(formatted);

  if (Number.isNaN(num)) return "";
  if (num > 100) return "100";
  if (num < 0) return "0";

  return formatted;
}

export type UseTaxRateInputOptions = {
  value: unknown;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

/** Controls percentage tax-rate input formatting, decimal precision, paste sanitization, and blur normalization. */
export function useTaxRateInput({
  value,
  onChange,
  onBlur,
}: UseTaxRateInputOptions) {
  const displayValue =
    typeof value === "string" || typeof value === "number" ? String(value) : "";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const currentVal = displayValue;
    const raw = e.target.value.replace(/,/g, ".");

    if (raw === "") {
      onChange("");
      return;
    }

    if (raw === ".") {
      onChange("0.");
      return;
    }

    // If there are invalid characters, attempt sanitization if multi-char paste/drop, else reject
    if (!/^\d*\.?\d*$/.test(raw)) {
      const sanitized = sanitizeTaxRatePaste(raw);
      if (sanitized !== "" && sanitized !== currentVal) {
        e.target.value = sanitized;
        onChange(sanitized);
        return;
      }
      e.target.value = currentVal;
      return;
    }

    const [intPart, decPart] = raw.split(".");

    // Disallow more than 2 decimal places
    if (decPart !== undefined && decPart.length > 2) {
      if (raw.length - currentVal.length > 1) {
        const sanitized = sanitizeTaxRatePaste(raw);
        e.target.value = sanitized;
        onChange(sanitized);
        return;
      }
      e.target.value = currentVal;
      return;
    }

    // Disallow values exceeding 100%
    const num = Number(raw);
    if (!Number.isNaN(num) && num > 100) {
      e.target.value = currentVal;
      return;
    }

    // Disallow leading zeros like "05" unless decimal like "0.5"
    if (
      intPart.length > 1 &&
      intPart.startsWith("0") &&
      decPart === undefined
    ) {
      const normalized = String(parseInt(intPart, 10));
      e.target.value = normalized;
      onChange(normalized);
      return;
    }

    onChange(raw);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    const input = e.currentTarget;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const prev = input.value;
    const nextRaw = prev.slice(0, start) + text + prev.slice(end);
    const sanitized = sanitizeTaxRatePaste(nextRaw);
    onChange(sanitized);
  };

  const handleBlur = () => {
    const currentVal = displayValue;
    let normalized = currentVal.trim();

    if (normalized.endsWith(".")) {
      normalized = normalized.slice(0, -1);
    }

    if (normalized === "." || normalized === "0.") {
      normalized = "";
    } else if (/^0\d/.test(normalized)) {
      const num = Number(normalized);
      normalized = Number.isNaN(num) ? "" : String(num);
    }

    if (normalized !== currentVal) {
      onChange(normalized);
    }
    onBlur?.();
  };

  return {
    displayValue,
    handleChange,
    handlePaste,
    handleBlur,
  };
}

