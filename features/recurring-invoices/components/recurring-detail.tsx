"use client";

import Link from "next/link";
import { AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Lock,
  Pause,
  Play,
  Zap,
} from "lucide-react";
import { Button } from "@/components/buttons/button";
import { DeleteButton } from "@/components/buttons/delete-button";
import { EditButton } from "@/components/buttons/edit-button";
import { Spinner } from "@/components/loaders/spinner";
import { BillFromView } from "@/features/branding/components/bill-from-view";
import { Info } from "@/features/invoices/components/invoice-info";
import { Line } from "@/features/invoices/components/invoice-line";
import { InvoiceStatusBadge } from "@/features/invoices/components/invoice-status";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { useRecurringDetail } from "../hooks/use-recurring-detail";
import type { RecurringTemplate } from "../types/recurring";
import { DeleteRecurringDialog } from "./delete-recurring-dialog";
import { RecurringFormDrawer } from "./recurring-form-drawer";
import {
  RecurringFrequencyBadge,
  RecurringStatusBadge,
} from "./recurring-status";

export function RecurringDetail({
  template,
}: {
  template: RecurringTemplate;
}) {
  const {
    branding,
    logoUrl,
    client,
    addressLines,
    clientDeleted,
    isEditOpen,
    isDeleteOpen,
    isBusy,
    isToggling,
    isGenerating,
    isDeleting,
    setIsEditOpen,
    setIsDeleteOpen,
    handleToggle,
    handleGenerateNow,
    handleDelete,
  } = useRecurringDetail(template);

  return (
    <main className="px-4 pb-20 pt-24 sm:px-6 md:px-10 md:pb-14 md:pt-28 lg:px-8 lg:pt-14">
      <section className="mx-auto w-full max-w-205">
        <Link
          href="/recurring-invoices"
          className="inline-flex items-center gap-4 text-[15px] font-bold tracking-[-0.25px] text-muted hover:text-purple">
          <ChevronLeft size={16} strokeWidth={2} />
          Go back
        </Link>

        {/* Action Bar */}
        <div className="mt-5 rounded-lg bg-surface p-5 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none md:mt-8 md:px-7 md:py-5.5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[13px] text-muted-light">Status</span>
              <RecurringStatusBadge active={template.active} />
              <RecurringFrequencyBadge frequency={template.frequency} />
            </div>

            <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center md:justify-end">
              <Button
                onClick={handleToggle}
                disabled={isBusy || (!template.active && clientDeleted)}
                className="inline-flex w-full items-center justify-center gap-2 bg-button-surface-subtle text-button-muted hover:bg-button-secondary hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 md:w-auto">
                {isToggling ? (
                  <Spinner className="size-4" tone="currentColor" />
                ) : template.active ? (
                  <Pause className="size-4" aria-hidden="true" />
                ) : (
                  <Play className="size-4" aria-hidden="true" />
                )}
                <span>{template.active ? "Pause" : "Resume"}</span>
              </Button>

              <Button
                onClick={handleGenerateNow}
                disabled={isBusy || clientDeleted}
                className="inline-flex w-full items-center justify-center gap-2 bg-button-purple text-white hover:bg-button-purple-light disabled:cursor-not-allowed disabled:opacity-50 md:w-auto">
                {isGenerating ? (
                  <Spinner className="size-4" tone="currentColor" />
                ) : (
                  <Zap className="size-4" aria-hidden="true" />
                )}
                <span>Generate Now</span>
              </Button>

              <EditButton
                onClick={() => setIsEditOpen(true)}
                disabled={isBusy}
                className="w-full md:w-auto"
              />

              <DeleteButton
                onClick={() => setIsDeleteOpen(true)}
                disabled={isBusy}
                className="w-full md:w-auto disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {clientDeleted && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 p-4 text-[13px] font-medium text-danger">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              The client assigned to this recurring invoice has been deleted.
              Choose an active client in <strong>Edit</strong> before resuming
              or generating invoices.
            </p>
          </div>
        )}

        {/* Template Details Card */}
        <article className="mt-4 rounded-lg bg-surface px-6 py-7 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none md:mt-6 md:px-8 md:py-8 lg:px-12 lg:py-10">
          <div className="flex flex-col justify-between gap-7 md:flex-row">
            <div>
              <h1 className="text-[20px] font-bold tracking-[-0.5px] text-ink">
                {template.title}
              </h1>
              {template.publicNotes && (
                <p className="mt-2 text-[13px] text-muted">
                  {template.publicNotes}
                </p>
              )}
              <p className="mt-3 text-[12px] font-bold text-purple">
                {template.autoSend
                  ? "Issues invoices as Pending automatically"
                  : "Creates invoices as Draft for review"}
              </p>
            </div>

            <BillFromView branding={branding} logoUrl={logoUrl} align="right" />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
            <Info label="Start Date" value={formatDate(template.startDate)} />
            <Info label="Next Run" value={formatDate(template.nextRunDate)} />
            <Info
              label="Payment Terms"
              value={
                template.paymentTermsDays === 0
                  ? "Due on Receipt"
                  : `Net ${template.paymentTermsDays} Days`
              }
            />
            <Info
              label="Bill To"
              value={client?.name ?? "—"}>
              {addressLines.length > 0 && (
                <p className="mt-2 whitespace-pre-line text-[13px] leading-4.5 text-muted">
                  {addressLines.join("\n")}
                </p>
              )}
            </Info>
            <Info label="Sent to" value={client?.email ?? "—"} />
            <Info
              label="Last Run"
              value={
                template.lastRunAt ? formatDateTime(template.lastRunAt) : "Never"
              }
            />
          </div>

          <div className="mt-10 overflow-hidden rounded-lg">
            <div className="bg-surface-subtle p-6 md:p-8">
              <div className="hidden grid-cols-[1.4fr_.7fr_1fr_1.1fr] text-[13px] text-muted md:grid">
                <span>Item Name</span>
                <span>Quantity</span>
                <span className="text-right">Price</span>
                <span className="text-right">Total</span>
              </div>

              {template.items.map((item) => (
                <Line
                  key={item.id}
                  name={item.name}
                  quantity={String(item.quantity)}
                  unitPrice={formatMoney(item.unitPrice, template.currency)}
                  total={formatMoney(item.total, template.currency)}
                />
              ))}

              <div className="mt-8 space-y-2 border-t border-border pt-4 text-[13px] font-medium text-muted md:mt-10">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <span>Subtotal</span>
                  <span className="font-bold text-ink">
                    {formatMoney(template.subtotal, template.currency)}
                  </span>
                </div>
                {template.taxRate > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <span>Tax ({template.taxRate}%)</span>
                    <span className="font-bold text-ink">
                      {formatMoney(template.tax, template.currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 bg-sidebar px-6 py-6 text-white dark:bg-deep md:px-8">
              <span className="text-[13px] text-muted-light sm:text-white">
                Estimated Invoice Total
              </span>
              <strong className="text-[20px] tracking-[-0.5px] sm:text-[24px]">
                {formatMoney(template.total, template.currency)}
              </strong>
            </div>
          </div>
        </article>

        {template.internalNotes && (
          <section
            aria-labelledby="recurring-internal-notes-heading"
            className="mt-6 rounded-lg border border-dashed border-border bg-surface p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none md:p-8">
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-purple" aria-hidden="true" />
              <h2
                id="recurring-internal-notes-heading"
                className="text-[15px] font-bold text-ink">
                Internal Notes
              </h2>
              <span className="ml-auto rounded-full bg-purple/10 px-2.5 py-0.5 text-[11px] font-bold text-purple dark:bg-purple/15 dark:text-purple-light">
                Private
              </span>
            </div>
            <p className="mt-3 whitespace-pre-line text-[13px] leading-5.5 text-muted">
              {template.internalNotes}
            </p>
          </section>
        )}

        {/* Generated Invoices History */}
        <section
          aria-labelledby="generated-invoices-heading"
          className="mt-6 rounded-lg bg-surface p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none md:p-8">
          <div className="flex items-center justify-between gap-4">
            <h2
              id="generated-invoices-heading"
              className="text-[15px] font-bold text-purple">
              Generated Invoices ({template.generatedInvoices.length})
            </h2>
            <span className="text-[12px] font-medium text-muted-light">
              Scheduled runs completed: {template.runCount}
            </span>
          </div>

          {template.generatedInvoices.length === 0 ? (
            <p className="mt-4 text-[13px] font-medium text-muted-light">
              No invoices have been generated from this recurring schedule yet.
              Use <strong className="text-ink">Generate Now</strong> or wait for
              the next scheduled run on{" "}
              <strong className="text-ink">
                {formatDate(template.nextRunDate)}
              </strong>
              .
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {template.generatedInvoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface-subtle/50 px-4 py-3.5 transition-colors hover:border-purple">
                  <div>
                    <p className="text-[14px] font-bold text-ink">
                      <span className="text-muted">#</span>
                      {inv.invoiceNumber}
                    </p>
                    <p className="mt-0.5 text-[12px] font-medium text-muted-light">
                      Issued {formatDate(inv.issueDate)} · Due{" "}
                      {formatDate(inv.dueDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[14px] font-bold text-ink">
                      {formatMoney(inv.total, inv.currency)}
                    </span>
                    <InvoiceStatusBadge status={inv.status} />
                    <ChevronRight
                      className="size-4 text-purple"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </section>

      <AnimatePresence>
        {isEditOpen && (
          <RecurringFormDrawer
            mode="edit"
            templateId={template.id}
            onClose={() => setIsEditOpen(false)}
          />
        )}
      </AnimatePresence>

      {isDeleteOpen && (
        <DeleteRecurringDialog
          title={template.title}
          isDeleting={isDeleting}
          onConfirm={handleDelete}
          onClose={() => setIsDeleteOpen(false)}
        />
      )}
    </main>
  );
}
