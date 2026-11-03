"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import { ChevronLeft } from "lucide-react";
import { InvoiceStatusBadge } from "./invoice-status";
import { BillFrom } from "@/features/branding/components/bill-from";
import { InvoiceFormDrawer } from "./invoice-form-drawer";
import { DeleteInvoiceDialog } from "./delete-invoice-dialog";
import { InvoiceActivity } from "./invoice-activity";
import { Info } from "./invoice-info";
import { Line } from "./invoice-line";
import { Actions } from "./invoice-actions";
import {
  useDeleteInvoice,
  useDownloadInvoicePdf,
  useMarkInvoicePaid,
} from "../hooks/use-invoice-queries";
import { formatDate, formatMoney } from "@/lib/format";
import type { Invoice } from "../types/invoice";

export function InvoiceDetail({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const deleteInvoice = useDeleteInvoice();
  const markPaid = useMarkInvoicePaid();
  const downloadPdf = useDownloadInvoicePdf();

  const isDeleting = deleteInvoice.isPending;
  const isMarkingPaid = markPaid.isPending;
  const isDownloadingPdf = downloadPdf.isPending;
  const isPaid = invoice.status === "paid";

  const client = invoice.client;
  const addressLines = client
    ? [
        client.address.addressLine1,
        client.address.addressLine2,
        client.address.city,
        client.address.state,
        client.address.country,
      ].filter((line): line is string => Boolean(line))
    : [];

  function handleMarkPaid() {
    markPaid.mutate(invoice.id, {
      onSuccess: () => toast.success("Invoice marked as paid"),
      onError: (error) => toast.error(error.message),
    });
  }

  function handleDownloadPdf() {
    downloadPdf.mutate(
      { id: invoice.id, invoiceNumber: invoice.invoiceNumber },
      {
        onSuccess: () => toast.success("Invoice PDF downloaded"),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function handleDelete() {
    deleteInvoice.mutate(invoice.id, {
      onSuccess: () => {
        toast.success("Invoice deleted");
        router.push("/invoices");
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <main
      className={`px-6 pt-26 md:pb-14 md:pl-[calc((100%-688px)/2)] md:pr-[calc((100%-688px)/2)] md:pt-27.75 lg:pl-[calc((100%-730px)/2)] lg:pr-[calc((100%-730px)/2)] lg:pt-16.25 max-[970px]:md:px-10 ${
        !isPaid ? "pb-38" : "pb-28"
      }`}>
      <section className="mx-auto w-full max-w-182.5">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-4 text-[15px] font-bold tracking-[-0.25px] text-muted hover:text-purple">
          <ChevronLeft size={16} strokeWidth={2} />
          Go back
        </Link>

        <div className="mt-5 flex min-h-22.75 items-center justify-between rounded-lg bg-surface px-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] md:mt-8 md:min-h-22 md:px-8">
          <div className="flex w-full items-center justify-between md:w-auto md:justify-start md:gap-5">
            <span className="text-[13px] text-muted-light">Status</span>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <Actions
            className="hidden md:flex"
            onEdit={() => setIsEditOpen(true)}
            onDelete={() => setIsDeleteOpen(true)}
            onPaid={handleMarkPaid}
            onDownloadPdf={handleDownloadPdf}
            showPaid={!isPaid}
            isMarkingPaid={isMarkingPaid}
            isDeletePending={isDeleting}
            isDownloadingPdf={isDownloadingPdf}
          />
        </div>

        <article className="mt-4 rounded-lg bg-surface px-6 py-7 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] md:mt-6 md:px-8 md:py-8 lg:px-12 lg:py-10">
          <div className="flex flex-col gap-7 min-h-34.75 justify-between md:flex-row md:min-h-0">
            <div>
              <h1 className="text-[15px] font-bold">
                <span className="text-muted-light">#</span>
                {invoice.invoiceNumber}
              </h1>
              {invoice.publicNotes && (
                <p className="mt-2 text-[13px] text-muted">
                  {invoice.publicNotes}
                </p>
              )}
            </div>

            {/* Business identity comes from branding settings. */}
            <BillFrom align="right" />
          </div>

          <div className="mt-7 grid grid-cols-2 grid-rows-[48px_48px_48px] gap-y-7.75 md:mt-10 md:grid-cols-3 md:grid-rows-none">
            <div className="flex flex-col gap-7 justify-between">
              <Info
                label="Invoice Date"
                value={formatDate(invoice.issueDate)}
              />
              <Info label="Payment Due" value={formatDate(invoice.dueDate)} />
            </div>

            <Info
              className="col-start-2 row-span-2 row-start-1 md:col-auto md:row-auto"
              label="Bill To"
              value={client?.name ?? "—"}>
              {addressLines.length > 0 && (
                <p className="mt-2 whitespace-pre-line text-[13px] leading-4.5 text-muted">
                  {addressLines.join("\n")}
                </p>
              )}
            </Info>

            <Info label="Sent to" value={client?.email ?? "—"} />
          </div>

          <div className="mt-10 overflow-hidden rounded-lg">
            <div className="bg-surface-subtle p-6 md:p-8">
              <div className="hidden grid-cols-[1.4fr_.7fr_1fr_1.1fr] text-[13px] text-muted md:grid">
                <span>Item Name</span>
                <span>Quantity</span>
                <span className="text-right">Price</span>
                <span className="text-right">Total</span>
              </div>

              {invoice.items.map((item) => (
                <Line
                  key={item.id}
                  name={item.name}
                  quantity={String(item.quantity)}
                  unitPrice={formatMoney(item.unitPrice, invoice.currency)}
                  total={formatMoney(item.total, invoice.currency)}
                />
              ))}

              <div className="mt-8 space-y-2 border-t border-border pt-4 text-[13px] font-medium text-muted md:mt-10">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <span className="shrink-0">Subtotal</span>
                  <span className="font-bold text-ink text-right wrap-break-word">
                    {formatMoney(invoice.subtotal, invoice.currency)}
                  </span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <span className="shrink-0">Discount</span>
                    <span className="font-bold text-ink text-right wrap-break-word">
                      −{formatMoney(invoice.discount, invoice.currency)}
                    </span>
                  </div>
                )}
                {invoice.tax > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <span className="shrink-0">
                      {invoice.taxRate > 0
                        ? `Tax (${invoice.taxRate}%)`
                        : "Tax"}
                    </span>
                    <span className="font-bold text-ink text-right wrap-break-word">
                      {formatMoney(invoice.tax, invoice.currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 bg-sidebar px-6 py-6 text-white dark:bg-deep md:px-8">
              <span className="text-[13px] text-muted-light sm:text-white shrink-0">
                Amount Due
              </span>
              <strong className="text-[20px] sm:text-[24px] tracking-[-0.5px] wrap-break-word text-right flex-1 sm:flex-initial">
                {formatMoney(invoice.total, invoice.currency)}
              </strong>
            </div>
          </div>
        </article>

        <InvoiceActivity events={invoice.events} />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-surface px-4 py-3.5 shadow-[0_-10px_20px_rgba(var(--shadow-navy),0.08)] md:hidden">
        <Actions
          onEdit={() => setIsEditOpen(true)}
          onDelete={() => setIsDeleteOpen(true)}
          onPaid={handleMarkPaid}
          onDownloadPdf={handleDownloadPdf}
          showPaid={!isPaid}
          isMarkingPaid={isMarkingPaid}
          isDeletePending={isDeleting}
          isDownloadingPdf={isDownloadingPdf}
        />
      </div>

      <AnimatePresence>
        {isEditOpen && (
          <InvoiceFormDrawer
            mode="edit"
            invoiceId={invoice.id}
            onClose={() => setIsEditOpen(false)}
          />
        )}
      </AnimatePresence>

      {isDeleteOpen && (
        <DeleteInvoiceDialog
          invoiceNumber={invoice.invoiceNumber}
          isDeleting={isDeleting}
          onConfirm={handleDelete}
          onClose={() => setIsDeleteOpen(false)}
        />
      )}
    </main>
  );
}
