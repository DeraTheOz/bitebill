"use client";

import { useRef } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { TextField } from "@/components/forms/text-field";
import { TextAreaField } from "@/components/forms/text-area-field";
import { SelectField } from "@/components/forms/select-field";
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
import { useClients } from "@/features/clients/hooks/use-client-queries";
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
    fields,
    appendItem,
    removeItem,
    items,
    submit,
    handleSubmit,
    onSubmit,
  } = useInvoiceFormDrawer(mode, onClose, invoiceId);

  // The picker shows the first 50 clients
  const { data: clientsData, isPending: isLoadingClients } = useClients({
    page: 1,
    pageSize: 50,
  });
  const clients = clientsData?.clients ?? [];

  // Prevent closing the drawer mid-save
  useClickOutside(panelRef, isSubmitting ? () => {} : onClose);

  const subtotal = items.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    return sum + quantity * unitPrice;
  }, 0);

  const label =
    mode === "edit"
      ? `Edit #${existingInvoice?.invoiceNumber ?? invoiceId}`
      : "New Invoice";

  const canSend = mode === "edit" && existingInvoice?.status !== "paid";

  return (
    <div className="fixed inset-x-0 bottom-0 top-18 z-40 bg-black/50 md:top-20 lg:inset-y-0 lg:left-64">
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="scrollbar-purple absolute inset-0 w-full overflow-y-auto bg-surface px-6 pb-24 pt-8 shadow-2xl dark:bg-canvas md:w-154 md:rounded-r-[20px] md:px-14 md:pb-28 md:pt-12 lg:right-auto lg:pt-14">
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-busy={isSubmitting}
          className="mt-12 space-y-12">
          {/* Business identity is managed in onboarding/settings. */}
          <FormSection title="Bill From">
            <BillFrom />
          </FormSection>

          <FormSection title="Bill To">
            <SelectField
              label="Client"
              error={errors.clientId?.message}
              disabled={isLoadingClients || clients.length === 0}
              {...register("clientId")}>
              <option value="">
                {isLoadingClients
                  ? "Loading clients…"
                  : clients.length
                    ? "Select a client"
                    : "No clients yet — add one first"}
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company
                    ? `${client.name} — ${client.company}`
                    : client.name}
                </option>
              ))}
            </SelectField>

            {clients.length === 0 && !isLoadingClients && (
              <p className="text-[13px] font-medium text-muted-light">
                Create a client first, then come back to invoice them.
              </p>
            )}
          </FormSection>

          <FormSection title="Invoice Details">
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField
                label="Invoice Date"
                type="date"
                error={errors.issueDate?.message}
                {...register("issueDate")}
              />
              <TextField
                label="Due Date"
                type="date"
                error={errors.dueDate?.message}
                {...register("dueDate")}
              />
            </div>
            <TextAreaField
              label="Project Description"
              placeholder="Graphic Design"
              error={errors.notes?.message}
              {...register("notes")}
            />
          </FormSection>

          <section>
            <h2 className="text-[18px] font-bold text-muted-light">
              Item List
            </h2>
            <div className="mt-4 space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,.6fr)_minmax(0,1fr)_auto] items-start gap-2 sm:gap-3">
                  <TextField
                    label={index === 0 ? "Item Name" : ""}
                    placeholder="Banner Design"
                    error={errors.items?.[index]?.name?.message}
                    {...register(`items.${index}.name`)}
                  />
                  <TextField
                    label={index === 0 ? "Qty." : ""}
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    error={errors.items?.[index]?.quantity?.message}
                    {...register(`items.${index}.quantity`)}
                  />
                  <TextField
                    label={index === 0 ? "Price" : ""}
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    error={errors.items?.[index]?.unitPrice?.message}
                    {...register(`items.${index}.unitPrice`)}
                  />
                  <RemoveItemButton
                    className="mt-7"
                    onClick={() => removeItem(index)}
                    disabled={fields.length === 1}
                  />
                </div>
              ))}
            </div>

            {errors.items?.message && (
              <p className="mt-3 text-[13px] font-medium text-danger">
                {errors.items.message}
              </p>
            )}

            <AddNewItemButton className="mt-5" onClick={appendItem} />

            <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-[15px] font-bold">
              <span className="text-muted">Total</span>
              <span className="text-ink">
                {formatMoney(subtotal, branding.currency)}
              </span>
            </div>
            <p className="mt-1 text-[13px] font-medium text-muted-light">
              Totals are recalculated on the server when saved.
            </p>
          </section>

          <footer className="fixed inset-x-0 bottom-0 flex flex-wrap justify-end gap-2 border-t border-border bg-surface px-6 py-4 dark:bg-canvas md:right-auto md:w-154 md:px-14 lg:left-64">
            {mode === "create" && (
              <DiscardButton
                className="mr-auto disabled:cursor-not-allowed disabled:opacity-60"
                onClick={onClose}
                disabled={isSubmitting}
              />
            )}

            {mode === "create" ? (
              <SaveAsDraftButton
                type="button"
                className={pendingButtonClassName}
                onClick={() => submit("draft")}
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner className="size-4" tone="currentColor" />
                    Saving…
                  </>
                ) : (
                  "Save as Draft"
                )}
              </SaveAsDraftButton>
            ) : (
              <>
                <CancelButton
                  className="disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={onClose}
                  disabled={isSubmitting}
                />
                {canSend && (
                  <SaveAndSendButton
                    type="button"
                    className={pendingButtonClassName}
                    onClick={() => submit("pending")}
                    disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Spinner className="size-4" tone="currentColor" />
                        Saving…
                      </>
                    ) : (
                      "Save & Send"
                    )}
                  </SaveAndSendButton>
                )}
              </>
            )}

            {mode === "create" ? (
              <SaveAndSendButton
                type="button"
                className={pendingButtonClassName}
                onClick={() => submit("pending")}
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner className="size-4" tone="currentColor" />
                    Saving…
                  </>
                ) : (
                  "Save & Send"
                )}
              </SaveAndSendButton>
            ) : (
              <SaveChangesButton
                type="button"
                className={pendingButtonClassName}
                onClick={() => submit("edit")}
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner className="size-4" tone="currentColor" />
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </SaveChangesButton>
            )}
          </footer>
        </form>
      </aside>
    </div>
  );
}
