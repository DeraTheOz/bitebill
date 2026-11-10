"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import { Check, ChevronLeft, Clock, Copy, Eye, Link2, Lock } from "lucide-react";
import { DownloadPdfButton } from "@/components/buttons/download-pdf-button";
import { ShareButton } from "@/components/buttons/share-button";
import {
  brandingLogoUrl,
  useBranding,
} from "@/features/branding/components/branding-provider";
import { ShareInvoiceDialog } from "@/features/sharing/components/share-invoice-dialog";
import { useInvoiceShare } from "@/features/sharing/hooks/use-share-queries";
import { formatDate } from "@/lib/format";
import { InvoiceStatusBadge } from "./invoice-status";
import { InvoiceFormDrawer } from "./invoice-form-drawer";
import { DeleteInvoiceDialog } from "./delete-invoice-dialog";
import { InvoiceActivity } from "./invoice-activity";
import { InvoiceDocument } from "./invoice-document";
import { Actions } from "./invoice-actions";
import {
  useDeleteInvoice,
  useDownloadInvoicePdf,
  useMarkInvoicePaid,
} from "../hooks/use-invoice-queries";
import type { Invoice } from "../types/invoice";

export function InvoiceDetail({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const branding = useBranding();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  const deleteInvoice = useDeleteInvoice();
  const markPaid = useMarkInvoicePaid();
  const downloadPdf = useDownloadInvoicePdf();
  const { data: share } = useInvoiceShare(invoice.id);

  const isDeleting = deleteInvoice.isPending;
  const isMarkingPaid = markPaid.isPending;
  const isDownloadingPdf = downloadPdf.isPending;
  const isPaid = invoice.status === "paid";
  const isActivelyShared = Boolean(share && !share.isExpired);

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

  async function handleCopyShareLink() {
    if (!share) return;
    try {
      const url = `${window.location.origin}${share.sharePath}`;
      await navigator.clipboard.writeText(url);
      setCopiedShareLink(true);
      toast.success("Share link copied");
      window.setTimeout(() => setCopiedShareLink(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  }

  return (
    <main
      className={`px-4 pt-24 sm:px-6 md:px-10 md:pt-28 md:pb-14 lg:px-8 lg:pt-14 ${
        !isPaid ? "pb-38" : "pb-26"
      }`}>
      <section className="mx-auto w-full max-w-205">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-4 text-[15px] font-bold tracking-[-0.25px] text-muted hover:text-purple">
          <ChevronLeft size={16} strokeWidth={2} />
          Go back
        </Link>

        <div className="mt-5 rounded-lg bg-surface p-5 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none md:mt-8 md:px-7 md:py-5.5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center justify-between gap-4 xl:justify-start">
              <span className="text-[13px] text-muted-light">Status</span>
              <InvoiceStatusBadge status={invoice.status} />
            </div>

            <Actions
              className="hidden md:block"
              onEdit={() => setIsEditOpen(true)}
              onDelete={() => setIsDeleteOpen(true)}
              onPaid={handleMarkPaid}
              onDownloadPdf={handleDownloadPdf}
              onShare={() => setIsShareOpen(true)}
              showPaid={!isPaid}
              isMarkingPaid={isMarkingPaid}
              isDeletePending={isDeleting}
              isDownloadingPdf={isDownloadingPdf}
              isShared={isActivelyShared}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-border/70 pt-4 md:hidden">
            <DownloadPdfButton
              onClick={handleDownloadPdf}
              isDownloading={isDownloadingPdf}
              className="w-full"
            />
            <ShareButton
              onClick={() => setIsShareOpen(true)}
              isShared={isActivelyShared}
              className="w-full"
            />
          </div>

          {share && (
            <div className="mt-4 flex flex-col gap-3 border-t border-border/70 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] font-medium text-muted">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold ${
                    share.isExpired
                      ? "bg-danger/10 text-danger"
                      : "bg-status-paid/10 text-status-paid"
                  }`}>
                  <Link2 className="size-3 shrink-0" aria-hidden="true" />
                  <span className="translate-y-[1.5px]">
                    {share.isExpired
                      ? "Share link expired"
                      : "Public link active"}
                  </span>
                </span>

                <span className="inline-flex items-center gap-1 font-bold text-ink">
                  <Eye
                    className="size-3.5 shrink-0 text-purple"
                    aria-hidden="true"
                  />
                  <span className="translate-y-[1.5px]">
                    {share.viewCount === 1
                      ? "1 view"
                      : `${share.viewCount} views`}
                  </span>
                </span>

                {share.expiresAt && (
                  <span className="inline-flex items-center gap-1 text-muted-light">
                    <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="translate-y-[1.5px]">
                      {share.isExpired ? "Expired" : "Expires"}{" "}
                      {formatDate(share.expiresAt.slice(0, 10))}
                    </span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!share.isExpired && (
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-border bg-surface-subtle px-3 text-[12px] font-bold text-ink transition-colors hover:border-purple hover:text-purple">
                    {copiedShareLink ? (
                      <>
                        <Check
                          className="size-3.5 shrink-0 text-status-paid"
                          aria-hidden="true"
                        />
                        <span className="translate-y-[1.5px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy
                          className="size-3.5 shrink-0 text-muted"
                          aria-hidden="true"
                        />
                        <span className="translate-y-[1.5px]">Copy link</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsShareOpen(true)}
                  className="inline-flex h-8 items-center justify-center rounded-full bg-purple/10 px-3 text-[12px] font-bold text-purple transition-colors hover:bg-purple/15">
                  <span className="translate-y-[1.5px]">Manage</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <InvoiceDocument
          invoice={invoice}
          branding={branding}
          logoUrl={brandingLogoUrl(branding)}
        />

        {invoice.internalNotes && (
          <section
            aria-labelledby="internal-notes-heading"
            className="mt-6 rounded-lg border border-border bg-surface p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Lock className="size-4 shrink-0 text-purple" aria-hidden="true" />
                <h2
                  id="internal-notes-heading"
                  className="translate-y-[1.5px] text-[15px] font-bold text-ink">
                  Internal Notes
                </h2>
              </div>
              <span className="rounded-full bg-surface-subtle px-2.5 py-0.5 text-[11px] font-bold text-muted">
                Private — only visible to you
              </span>
            </div>
            <p className="mt-3 whitespace-pre-line text-[13px] leading-5.5 text-muted">
              {invoice.internalNotes}
            </p>
          </section>
        )}

        <InvoiceActivity events={invoice.events} />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-surface px-4 py-3 shadow-[0_-10px_20px_rgba(var(--shadow-navy),0.08)] md:hidden">
        <Actions
          onEdit={() => setIsEditOpen(true)}
          onDelete={() => setIsDeleteOpen(true)}
          onPaid={handleMarkPaid}
          showPaid={!isPaid}
          isMarkingPaid={isMarkingPaid}
          isDeletePending={isDeleting}
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

      <AnimatePresence>
        {isShareOpen && (
          <ShareInvoiceDialog
            invoiceId={invoice.id}
            invoiceNumber={invoice.invoiceNumber}
            onClose={() => setIsShareOpen(false)}
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
