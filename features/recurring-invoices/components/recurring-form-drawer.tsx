"use client";

import { useRef } from "react";
import { Controller } from "react-hook-form";
import { motion } from "motion/react";
import { AddNewItemButton } from "@/components/buttons/add-new-item-button";
import { CancelButton } from "@/components/buttons/cancel-button";
import { DiscardButton } from "@/components/buttons/discard-button";
import { RemoveItemButton } from "@/components/buttons/remove-item-button";
import { SaveChangesButton } from "@/components/buttons/save-changes-button";
import { CustomSelectField } from "@/components/forms/custom-select-field";
import { DatePickerField } from "@/components/forms/date-picker-field";
import { FormSection } from "@/components/forms/form-section";
import { TextAreaField } from "@/components/forms/text-area-field";
import { TextField } from "@/components/forms/text-field";
import { Spinner } from "@/components/loaders/spinner";
import { BillFrom } from "@/features/branding/components/bill-from";
import { useBranding } from "@/features/branding/components/branding-provider";
import { ClientPicker } from "@/features/clients/components/client-picker";
import { useClickOutside } from "@/hooks/use-click-outside";
import { formatMoney } from "@/lib/format";
import { useRecurringFormDrawer } from "../hooks/use-recurring-form-drawer";
import { RecurringTaxRateField } from "./recurring-tax-rate-field";

const FREQUENCY_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
] as const;

const PAYMENT_TERMS_OPTIONS = [
  { value: "0", label: "Due on Receipt (Net 0)" },
  { value: "7", label: "Net 7 Days" },
  { value: "14", label: "Net 14 Days" },
  { value: "30", label: "Net 30 Days" },
] as const;

const GENERATED_INVOICE_STATUS_OPTIONS = [
  { value: "pending", label: "Issue as Pending automatically" },
  { value: "draft", label: "Save as Draft for review" },
] as const;

type RecurringFormDrawerProps = {
  mode: "create" | "edit";
  templateId?: string;
  onClose: () => void;
};

export function RecurringFormDrawer({
  mode,
  templateId,
  onClose,
}: RecurringFormDrawerProps) {
  const panelRef = useRef<HTMLElement>(null);
  const branding = useBranding();

  const {
    existingTemplate,
    errors,
    isSubmitting,
    register,
    control,
    setValue,
    fields,
    appendItem,
    removeItem,
    subtotal,
    taxRateValue,
    tax,
    total,
    discard,
    handleSubmit,
    onSubmit,
  } = useRecurringFormDrawer(mode, onClose, templateId);

  useClickOutside(panelRef, isSubmitting ? () => {} : onClose);

  const label =
    mode === "edit"
      ? `Edit ${existingTemplate?.title ?? "Recurring Invoice"}`
      : "New Recurring Invoice";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      className="fixed inset-x-0 bottom-0 top-18 z-40 overflow-hidden bg-black/50 md:top-20 lg:inset-y-0 lg:left-64">
      <motion.aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-y-0 left-0 flex w-full flex-col bg-surface shadow-2xl dark:bg-canvas md:w-154 md:rounded-r-[20px]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-busy={isSubmitting}
          className="flex h-full flex-col overflow-hidden">
          <div className="scrollbar-purple flex-1 overflow-y-auto px-6 pb-8 pt-8 md:px-14 md:pt-12 lg:pt-14">
            <h1 className="text-[24px] font-bold tracking-[-0.75px] text-ink">
              {mode === "create"
                ? "New Recurring Invoice"
                : "Edit Recurring Invoice"}
            </h1>

            <div className="mt-12 space-y-12">
              <FormSection title="Bill From">
                <BillFrom />
              </FormSection>

              <FormSection title="Bill To">
                <Controller
                  control={control}
                  name="clientId"
                  render={({ field, fieldState }) => (
                    <ClientPicker
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      selectedClient={existingTemplate?.client ?? null}
                      error={fieldState.error?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </FormSection>

              <FormSection title="Schedule & Terms">
                <TextField
                  id="recurring-title"
                  label="Invoice Title"
                  placeholder="Monthly Design Retainer"
                  disabled={isSubmitting}
                  error={errors.title?.message}
                  {...register("title")}
                />

                <div className="grid gap-6 sm:grid-cols-2">
                  <Controller
                    control={control}
                    name="frequency"
                    render={({ field, fieldState }) => (
                      <CustomSelectField
                        id="recurring-frequency"
                        name={field.name}
                        label="Frequency"
                        value={field.value ?? "monthly"}
                        onChange={field.onChange}
                        options={FREQUENCY_OPTIONS}
                        error={fieldState.error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="startDate"
                    render={({ field, fieldState }) => (
                      <DatePickerField
                        label="Start Date"
                        name={field.name}
                        value={field.value ?? ""}
                        onChange={(date) =>
                          setValue("startDate", date, { shouldValidate: true })
                        }
                        onBlur={field.onBlur}
                        disabled={isSubmitting}
                        error={fieldState.error?.message}
                        align="start"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="paymentTermsDays"
                    render={({ field, fieldState }) => (
                      <CustomSelectField
                        id="recurring-terms"
                        name={field.name}
                        label="Payment Terms"
                        value={String(field.value ?? 14)}
                        onChange={(nextValue) =>
                          field.onChange(Number(nextValue))
                        }
                        options={PAYMENT_TERMS_OPTIONS}
                        error={fieldState.error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />

                  <RecurringTaxRateField
                    control={control}
                    disabled={isSubmitting}
                  />
                </div>

                <Controller
                  control={control}
                  name="autoSend"
                  render={({ field, fieldState }) => (
                    <CustomSelectField
                      id="recurring-auto-send"
                      name={field.name}
                      label="Generated Invoice Status"
                      value={field.value ? "pending" : "draft"}
                      onChange={(nextValue) =>
                        field.onChange(nextValue === "pending")
                      }
                      options={GENERATED_INVOICE_STATUS_OPTIONS}
                      error={fieldState.error?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />

                <TextAreaField
                  label="Project Description"
                  placeholder="Ongoing design & engineering support"
                  error={errors.publicNotes?.message}
                  disabled={isSubmitting}
                  {...register("publicNotes")}
                />

                <div>
                  <TextAreaField
                    label="Internal Notes (Private)"
                    placeholder="Private notes copied to generated invoices…"
                    error={errors.internalNotes?.message}
                    disabled={isSubmitting}
                    {...register("internalNotes")}
                  />
                  <p className="mt-1.5 text-[12px] font-medium text-muted-light">
                    Only visible to you — never shown on PDFs or shared links.
                  </p>
                </div>
              </FormSection>

              <section>
                <h2 className="text-[18px] font-bold text-muted-light">
                  Item List
                </h2>

                <div className="mt-4 hidden grid-cols-[minmax(0,1.5fr)_minmax(0,.8fr)_minmax(0,1fr)_auto] gap-2 text-[13px] font-medium text-muted sm:grid sm:gap-3">
                  <span>Item Name</span>
                  <span>Quantity</span>
                  <span>Price</span>
                  <span className="w-9" aria-hidden="true" />
                </div>

                <div className="mt-3 space-y-4 sm:mt-2 sm:space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-xl border border-border/60 bg-surface-subtle/30 p-3 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0">
                      <div className="flex flex-col gap-2.5 sm:grid sm:grid-cols-[minmax(0,1.5fr)_minmax(0,.8fr)_minmax(0,1fr)_auto] sm:items-start sm:gap-3">
                        <div>
                          <label
                            htmlFor={`recurring-items.${index}.name`}
                            className="mb-1.5 block text-[12px] font-semibold text-muted sm:hidden">
                            Item Name
                          </label>
                          <TextField
                            id={`recurring-items.${index}.name`}
                            placeholder="Monthly Retainer"
                            error={errors.items?.[index]?.name?.message}
                            {...register(`items.${index}.name`)}
                          />
                        </div>

                        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] items-start gap-2.5 sm:contents">
                          <div>
                            <label
                              htmlFor={`recurring-items.${index}.quantity`}
                              className="mb-1.5 block text-[12px] font-semibold text-muted sm:hidden">
                              Quantity
                            </label>
                            <TextField
                              id={`recurring-items.${index}.quantity`}
                              type="number"
                              inputMode="numeric"
                              step="1"
                              min="1"
                              placeholder="1"
                              error={errors.items?.[index]?.quantity?.message}
                              {...register(`items.${index}.quantity`)}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`recurring-items.${index}.unitPrice`}
                              className="mb-1.5 block text-[12px] font-semibold text-muted sm:hidden">
                              Price
                            </label>
                            <TextField
                              id={`recurring-items.${index}.unitPrice`}
                              type="number"
                              inputMode="decimal"
                              step="0.01"
                              min="0.01"
                              placeholder="0.00"
                              error={errors.items?.[index]?.unitPrice?.message}
                              {...register(`items.${index}.unitPrice`)}
                            />
                          </div>

                          <div className="mt-5.5 flex h-12 w-9 items-center justify-center sm:mt-0">
                            <RemoveItemButton
                              onClick={() => removeItem(index)}
                              disabled={fields.length === 1}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {errors.items?.message && (
                  <p className="mt-3 text-[13px] font-medium text-danger">
                    {errors.items.message}
                  </p>
                )}

                <AddNewItemButton className="mt-5" onClick={appendItem} />

                <div className="mt-6 space-y-2 border-t border-border pt-4 text-[15px] font-bold">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Subtotal</span>
                    <span className="text-ink">
                      {formatMoney(subtotal, branding.currency)}
                    </span>
                  </div>
                  {taxRateValue > 0 && (
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-muted">Tax ({taxRateValue}%)</span>
                      <span className="text-ink">
                        {formatMoney(tax, branding.currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <span className="text-muted">Estimated Total</span>
                    <span className="text-ink">
                      {formatMoney(total, branding.currency)}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <footer className="border-t border-border bg-surface px-4 py-3.5 dark:bg-canvas md:rounded-br-[20px] md:px-14 md:py-4">
            <div className="grid w-full grid-cols-2 gap-2 md:flex md:items-center md:justify-end">
              {mode === "create" ? (
                <DiscardButton
                  className="w-full md:mr-auto md:w-auto disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={discard}
                  disabled={isSubmitting}
                />
              ) : (
                <CancelButton
                  className="w-full md:mr-auto md:w-auto disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={onClose}
                  disabled={isSubmitting}
                />
              )}

              <SaveChangesButton
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 md:w-auto disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? (
                  <>
                    <Spinner className="size-4 shrink-0" tone="currentColor" />
                    <span>Saving…</span>
                  </>
                ) : mode === "create" ? (
                  "Create Recurring"
                ) : (
                  "Save Changes"
                )}
              </SaveChangesButton>
            </div>
          </footer>
        </form>
      </motion.aside>
    </motion.div>
  );
}

