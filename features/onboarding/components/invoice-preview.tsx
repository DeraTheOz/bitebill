"use client";

import Image from "next/image";
import { useFormContext } from "react-hook-form";
import { Sparkles } from "lucide-react";
import { formatMoney } from "@/lib/format";
import {
  DEFAULT_BRAND_COLOR,
  lightenHex,
  readableOnWhite,
  readableTextColor,
} from "../lib/brand-colors";
import type { OnboardingValues } from "../schemas/onboarding-schema";

const sampleItems = [
  { name: "Brand identity & logo design", amount: 1850 },
  { name: "Landing page design", amount: 1920 },
];

const subtotal = sampleItems.reduce((sum, item) => sum + item.amount, 0);
const tax = subtotal * 0.1;
const total = subtotal + tax;

const templateLabels: Record<OnboardingValues["pdfTemplate"], string> = {
  classic: "Classic",
  modern: "Modern",
  corporate: "Corporate",
};

export function InvoicePreview() {
  const { watch } = useFormContext<OnboardingValues>();
  const values = watch();

  const businessName = values.businessName || "Your business name";
  const currency = values.currency || "USD";
  const brandColor = values.brandColor || DEFAULT_BRAND_COLOR;
  const headerText = readableTextColor(brandColor);
  const invoiceNumber = `${(values.invoicePrefix || "BB").toUpperCase()}-0001`;
  const template = values.pdfTemplate;
  const isModern = template === "modern";
  const isCorporate = template === "corporate";

  return (
    <div className="rounded-2xl border border-border bg-surface-subtle p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.15em] text-muted-light">
          <Sparkles className="size-3.5 text-purple" aria-hidden="true" />
          Live preview
        </p>
        <span className="rounded-full bg-purple/10 px-3 py-1 text-[13px] font-bold text-purple">
          {templateLabels[template]}
        </span>
      </div>

      <article
        className={`overflow-hidden rounded-xl border border-border bg-surface shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none ${
          isCorporate ? "border-l-4 border-l-sidebar" : ""
        }`}>
        <header
          style={
            isModern
              ? { backgroundColor: brandColor, color: headerText }
              : undefined
          }
          className={`flex items-start justify-between gap-4 p-5 ${
            isModern
              ? ""
              : isCorporate
                ? "border-b border-border bg-surface-subtle"
                : "border-b border-border"
          }`}>
          <div className="flex items-center gap-2.5">
            <span
              className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-br-xl"
              style={{
                backgroundColor: isModern
                  ? "rgba(255,255,255,0.15)"
                  : brandColor,
              }}>
              {values.logoUrl ? (
                <Image
                  src={values.logoUrl}
                  alt=""
                  width={36}
                  height={36}
                  unoptimized
                  className="size-9 object-contain p-1"
                />
              ) : (
                <>
                  <span
                    className="absolute bottom-0 left-0 h-1/2 w-full rounded-br-xl"
                    style={{
                      backgroundColor: isModern
                        ? "rgba(255,255,255,0.14)"
                        : lightenHex(brandColor),
                    }}
                  />
                  <Image
                    src="/assets/logo-white.svg"
                    width={18}
                    height={18}
                    alt=""
                    className="relative"
                  />
                </>
              )}
            </span>
            <div className="min-w-0">
              <p className="wrap-anywhere text-[15px] font-bold leading-tight">
                {businessName}
              </p>
              <p
                className={`wrap-anywhere text-[13px] font-medium ${
                  isModern
                    ? headerText === "#ffffff"
                      ? "text-white/70"
                      : "text-ink/70"
                    : "text-muted-light"
                }`}>
                {values.businessEmail || "you@example.com"}
              </p>
            </div>
          </div>
          <div className="shrink-0 max[325px]:text-start min-[326px]:text-right">
            <p className="text-[13px] font-bold uppercase tracking-[0.12em]">
              Invoice
            </p>
            <p
              className="text-[15px] font-bold"
              style={
                isModern ? undefined : { color: readableOnWhite(brandColor) }
              }>
              {invoiceNumber}
            </p>
          </div>
        </header>

        <div className="p-5">
          <div className="flex flex-wrap justify-between gap-4 text-[13px]">
            <div>
              <p className="font-medium text-muted-light">Billed to</p>
              <p className="mt-0.5 font-bold text-ink">Jensen Harris</p>
              <p className="text-muted">harris@apexco.com</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-muted-light">Due</p>
              <p className="mt-0.5 font-bold text-ink">Oct 15, 2026</p>
            </div>
          </div>

          <div className="mt-4 border-t border-border">
            {sampleItems.map((item) => (
              <div
                key={item.name}
                className="flex flex-wrap items-start justify-between gap-4 border-b border-border py-2.5 text-[13px]">
                <span className="font-medium text-ink">{item.name}</span>
                <span className="shrink-0 font-bold text-ink">
                  {formatMoney(item.amount, currency)}
                </span>
              </div>
            ))}
          </div>

          <dl className="mt-4 flex flex-wrap flex-col gap-1.5 text-[13px]">
            <div className="flex justify-between text-muted">
              <dt>Subtotal</dt>
              <dd>{formatMoney(subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Tax (10%)</dt>
              <dd>{formatMoney(tax, currency)}</dd>
            </div>
            <div className="mt-1 flex justify-between border-t border-border pt-2 text-[15px] font-bold text-ink">
              <dt>Total</dt>
              <dd
                style={
                  isModern ? { color: readableOnWhite(brandColor) } : undefined
                }>
                {formatMoney(total, currency)}
              </dd>
            </div>
          </dl>

          <p className="mt-4 border-t border-dashed border-border pt-3 text-[13px] font-medium text-muted-light">
            {values.defaultTerms || "Payment due within 14 days of issue."}
          </p>
        </div>
      </article>

      <p className="mt-4 text-[13px] font-medium leading-relaxed text-muted-light">
        Updates as you type. This is how your invoices and PDFs will look.
      </p>
    </div>
  );
}
