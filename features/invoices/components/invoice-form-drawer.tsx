"use client";

import { useRef } from "react";
import { Controller } from "react-hook-form";
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { motion } from "motion/react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { TextField } from "@/components/forms/text-field";
import { SelectField } from "@/components/forms/select-field";
import { TextAreaField } from "@/components/forms/text-area-field";
import { FormSection } from "@/components/forms/form-section";
import { BillFrom } from "@/features/branding/components/bill-from";
import { useBranding } from "@/features/branding/components/branding-provider";
import { AddNewItemButton } from "@/components/buttons/add-new-item-button";
import { RemoveItemButton } from "@/components/buttons/remove-item-button";
import { DiscardButton } from "@/components/buttons/discard-button";
import { CancelButton } from "@/components/buttons/cancel-button";
import { SaveAsDraftButton } from "@/components/buttons/save-as-draft-button";
import { SaveChangesButton } from "@/components/buttons/save-changes-button";
import { SaveAndSendButton } from "@/components/buttons/save-and-send-button";
import { Spinner } from "@/components/loaders/spinner";
import { ClientPicker } from "@/features/clients/components/client-picker";
import { DatePickerField } from "@/components/forms/date-picker-field";
import { formatMoney } from "@/lib/format";
import { useInvoiceFormDrawer } from "../hooks/use-invoice-form-drawer";

const pendingButtonClassName =
  "inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60";

type InvoiceFormDrawerProps = {
  mode: "create" | "edit";
  invoiceId?: string;
  onClose: () => void;
};

export function InvoiceFormDrawer({
  mode,
  invoiceId,
  onClose,
}: InvoiceFormDrawerProps) {
  const panelRef = useRef<HTMLElement>(null);
  const branding = useBranding();

  const {
    existingInvoice,
    errors,
    isSubmitting,
    register,
    control,
    watch,
    setValue,
    fields,
    appendItem,
    removeItem,
    items,
    taxRate,
    submit,
    handleSubmit,
    onSubmit,
  } = useInvoiceFormDrawer(mode, onClose, invoiceId);

  // Prevent closing the drawer mid-save
  useClickOutside(panelRef, isSubmitting ? () => {} : onClose);

  const issueDate = watch("issueDate");
  const dueDate = watch("dueDate");

  const diffDays =
    issueDate && dueDate
      ? differenceInCalendarDays(parseISO(dueDate), parseISO(issueDate))
      : 14;

  const activeTerm = [0, 7, 14, 30].includes(diffDays)
    ? String(diffDays)
    : "custom";

  function handleTermChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (val === "custom") return;
    const days = Number(val);
    if (!issueDate) return;
    const nextDue = format(addDays(parseISO(issueDate), days), "yyyy-MM-dd");
    setValue("dueDate", nextDue, { shouldValidate: true });
  }

  function handleIssueDateChange(newIssueDate: string) {
    setValue("issueDate", newIssueDate, { shouldValidate: true });
    if (activeTerm !== "custom") {
      const days = Number(activeTerm);
      const nextDue = format(
        addDays(parseISO(newIssueDate), days),
        "yyyy-MM-dd",
      );
      setValue("dueDate", nextDue, { shouldValidate: true });
    } else if (dueDate && dueDate < newIssueDate) {
      setValue("dueDate", newIssueDate, { shouldValidate: true });
    }
  }

  const subtotal = items.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    return sum + quantity * unitPrice;
  }, 0);
  const taxRateValue = Math.min(Math.max(Number(taxRate) || 0, 0), 100);
  const tax = (subtotal * taxRateValue) / 100;
  const total = subtotal + tax;

  const label =
    mode === "edit"
      ? `Edit #${existingInvoice?.invoiceNumber ?? invoiceId}`
      : "New Invoice";

  const isDraft = mode === "edit" && existingInvoice?.status === "draft";

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
            {mode === "create" ? (
              <h1 className="text-[24px] text-ink font-bold tracking-[-0.75px]">
                New Invoice
              </h1>
            ) : (
              <h1 className="text-[24px] text-ink font-bold tracking-[-0.75px]">
                Edit <span className="text-muted-light">#</span>
                {existingInvoice?.invoiceNumber ?? invoiceId}
              </h1>
            )}

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
                      selectedClient={existingInvoice?.client ?? null}
                      error={fieldState.error?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </FormSection>

              <FormSection title="Invoice Details">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Controller
                    control={control}
                    name="issueDate"
                    render={({ field, fieldState }) => (
                      <DatePickerField
                        label="Invoice Date"
                        name={field.name}
                        value={field.value ?? ""}
                        onChange={handleIssueDateChange}
                        onBlur={field.onBlur}
                        disabled={isSubmitting}
                        error={fieldState.error?.message}
                        align="start"
                      />
                    )}
                  />
                  <SelectField
                    label="Payment Terms"
                    value={activeTerm}
                    onChange={handleTermChange}
                    disabled={isSubmitting}>
                    <option value="0">Due on Receipt (Net 0)</option>
                    <option value="7">Net 7 Days</option>
                    <option value="14">Net 14 Days</option>
                    <option value="30">Net 30 Days</option>
                    {activeTerm === "custom" && (
                      <option value="custom">
                        Custom {diffDays > 0 ? `(${diffDays} days)` : ""}
                      </option>
                    )}
                  </SelectField>
                  <Controller
                    control={control}
                    name="dueDate"
                    render={({ field, fieldState }) => (
                      <DatePickerField
                        label="Due Date"
                        name={field.name}
                        value={field.value ?? ""}
                        min={issueDate}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={isSubmitting}
                        error={fieldState.error?.message}
                        align="start"
                      />
                    )}
                  />
                  <TextField
                    label="Tax Rate (%)"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0"
                    error={errors.taxRate?.message}
                    disabled={isSubmitting}
                    {...register("taxRate")}
                  />
                </div>
                <TextAreaField
                  label="Project Description"
                  placeholder="Graphic Design"
                  error={errors.notes?.message}
                  disabled={isSubmitting}
                  {...register("notes")}
                />
              </FormSection>

              <section>
                <h2 className="text-[18px] font-bold text-muted-light">
                  Item List
                </h2>

                {/* Column Headers (Desktop only - mobile uses clear inline labels) */}
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
                            htmlFor={`items.${index}.name`}
                            className="mb-1.5 block text-[12px] font-semibold text-muted sm:hidden">
                            Item Name
                          </label>
                          <TextField
                            id={`items.${index}.name`}
                            placeholder="Banner Design"
                            error={errors.items?.[index]?.name?.message}
                            {...register(`items.${index}.name`)}
                          />
                        </div>

                        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] items-start gap-2.5 sm:contents">
                          <div>
                            <label
                              htmlFor={`items.${index}.quantity`}
                              className="mb-1.5 block text-[12px] font-semibold text-muted sm:hidden">
                              Quantity
                            </label>
                            <TextField
                              id={`items.${index}.quantity`}
                              type="number"
                              inputMode="decimal"
                              step="any"
                              min="0"
                              placeholder="1"
                              error={errors.items?.[index]?.quantity?.message}
                              {...register(`items.${index}.quantity`)}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`items.${index}.unitPrice`}
                              className="mb-1.5 block text-[12px] font-semibold text-muted sm:hidden">
                              Price
                            </label>
                            <TextField
                              id={`items.${index}.unitPrice`}
                              type="number"
                              inputMode="decimal"
                              step="0.01"
                              min="0.01"
                              placeholder="0.00"
                              error={errors.items?.[index]?.unitPrice?.message}
                              {...register(`items.${index}.unitPrice`)}
                            />
                          </div>

                          <div className="flex h-12 w-9 items-center justify-center mt-5.5 sm:mt-0">
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
                    <span className="text-muted">Total</span>
                    <span className="text-ink">
                      {formatMoney(total, branding.currency)}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-[13px] font-medium text-muted-light">
                  Totals are recalculated on the server when saved.
                </p>
              </section>
            </div>
          </div>

          <footer className="border-t border-border bg-surface px-4 py-3.5 dark:bg-canvas md:px-14 md:py-4 md:rounded-br-[20px]">
            {mode === "create" ? (
              <div className="flex flex-col md:flex-row md:items-center gap-2.5 md:gap-2 w-full">
                {/* On mobile: Save & Send is prominent full-width on top. On desktop: far right */}
                <div className="order-1 md:order-3 w-full md:w-auto">
                  <SaveAndSendButton
                    type="button"
                    className={`w-full md:w-auto ${pendingButtonClassName}`}
                    onClick={() => submit("pending")}
                    disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Spinner
                          className="size-4 shrink-0"
                          tone="currentColor"
                        />
                        <span>Saving…</span>
                      </>
                    ) : (
                      "Save & Send"
                    )}
                  </SaveAndSendButton>
                </div>

                {/* Secondary buttons: Discard on left, Save as Draft on right */}
                <div className="order-2 md:order-1 grid grid-cols-2 md:contents gap-2 w-full md:w-auto">
                  <DiscardButton
                    className="w-full md:w-auto md:mr-auto disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={onClose}
                    disabled={isSubmitting}
                  />

                  <SaveAsDraftButton
                    type="button"
                    className={`w-full md:w-auto md:order-2 ${pendingButtonClassName}`}
                    onClick={() => submit("draft")}
                    disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Spinner
                          className="size-4 shrink-0"
                          tone="currentColor"
                        />
                        <span>Saving…</span>
                      </>
                    ) : (
                      "Save as Draft"
                    )}
                  </SaveAsDraftButton>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center gap-2.5 md:gap-2 w-full">
                {isDraft ? (
                  <>
                    {/* On mobile: Save Changes is full-width hero button on top. On desktop: far right */}
                    <div className="order-1 md:order-3 w-full md:w-auto">
                      <SaveChangesButton
                        type="button"
                        className={`w-full md:w-auto ${pendingButtonClassName}`}
                        onClick={() => submit("edit")}
                        disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Spinner
                              className="size-4 shrink-0"
                              tone="currentColor"
                            />
                            <span>Saving…</span>
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </SaveChangesButton>
                    </div>

                    {/* On mobile: Cancel and Save & Send are 50/50 equal-width in a clean 2-column row */}
                    <div className="order-2 md:order-1 grid grid-cols-2 md:contents gap-2 w-full md:w-auto">
                      <CancelButton
                        className="w-full md:w-auto md:mr-auto disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={onClose}
                        disabled={isSubmitting}
                      />

                      <SaveAndSendButton
                        type="button"
                        className={`w-full md:w-auto md:order-2 ${pendingButtonClassName}`}
                        onClick={() => submit("pending")}
                        disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Spinner
                              className="size-4 shrink-0"
                              tone="currentColor"
                            />
                            <span>Saving…</span>
                          </>
                        ) : (
                          "Save & Send"
                        )}
                      </SaveAndSendButton>
                    </div>
                  </>
                ) : (
                  /* When invoice is already published/pending/paid: 2 buttons (Cancel and Save Changes) */
                  <div className="grid grid-cols-2 md:flex md:items-center md:justify-end gap-2 w-full">
                    <CancelButton
                      className="w-full md:w-auto md:mr-auto disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={onClose}
                      disabled={isSubmitting}
                    />

                    <SaveChangesButton
                      type="button"
                      className={`w-full md:w-auto ${pendingButtonClassName}`}
                      onClick={() => submit("edit")}
                      disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Spinner
                            className="size-4 shrink-0"
                            tone="currentColor"
                          />
                          <span>Saving…</span>
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </SaveChangesButton>
                  </div>
                )}
              </div>
            )}
          </footer>
        </form>
      </motion.aside>
    </motion.div>
  );
}
