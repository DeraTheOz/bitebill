"use client";

import { motion } from "motion/react";
import { Link2, X } from "lucide-react";
import { CustomSelectField } from "@/components/forms/custom-select-field";
import { Spinner } from "@/components/loaders/spinner";
import {
  CREATE_EXPIRATION_OPTIONS,
  useShareInvoiceDialog,
  type ExpirationPreset,
} from "../hooks/use-share-invoice-dialog";
import { ActiveSharePanel } from "./active-share-panel";

export function ShareInvoiceDialog({
  invoiceId,
  invoiceNumber,
  onClose,
}: {
  invoiceId: string;
  invoiceNumber: string;
  onClose: () => void;
}) {
  const {
    panelRef,
    share,
    isLoadingShare,
    isShareError,
    isMutating,
    isCreating,
    createPreset,
    setCreatePreset,
    copied,
    confirmAction,
    setConfirmAction,
    fullShareUrl,
    refetch,
    handleCopy,
    handleCreate,
    handleRegenerate,
    handleExpirationUpdate,
    handleRevoke,
  } = useShareInvoiceDialog({ invoiceId, onClose });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-110 overflow-y-auto overscroll-contain bg-black/50 p-4 sm:p-6">
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget && !isMutating) onClose();
        }}
        className="flex min-h-full items-center justify-center">
        <motion.section
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-busy={isMutating}
          aria-labelledby="share-invoice-title"
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="my-auto w-full max-w-132 rounded-xl bg-surface p-5 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-purple/10 text-purple">
                <Link2 className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2
                  id="share-invoice-title"
                  className="text-[19px] font-bold tracking-[-0.5px] text-ink sm:text-[20px]">
                  Share Invoice <span className="text-muted-light">#</span>
                  {invoiceNumber}
                </h2>
                <p className="mt-1 text-[13px] font-medium leading-5 text-muted">
                  Anyone with this link can view the invoice and download its
                  PDF. Internal notes remain private.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isMutating}
              aria-label="Close share dialog"
              className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface-subtle hover:text-ink disabled:cursor-not-allowed disabled:opacity-50">
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6 min-w-0">
            {isLoadingShare ? (
              <div className="flex items-center justify-center py-10">
                <Spinner className="size-6" />
              </div>
            ) : isShareError ? (
              <div className="rounded-lg border border-border bg-surface-subtle p-5 text-center">
                <p className="text-[13px] font-medium text-muted">
                  Could not load share link status.
                </p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-3 text-[13px] font-bold text-purple hover:underline">
                  Try again
                </button>
              </div>
            ) : !share ? (
              <div className="space-y-5">
                <CustomSelectField
                  id="share-expiration"
                  label="Link Expiration"
                  value={createPreset}
                  onChange={(val) => setCreatePreset(val as ExpirationPreset)}
                  options={CREATE_EXPIRATION_OPTIONS}
                  disabled={isMutating}
                />

                <div className="grid grid-cols-2 items-center gap-2 sm:flex sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isMutating}
                    className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full bg-surface-subtle px-5 text-[14px] font-bold text-muted transition-colors hover:bg-border/60 disabled:cursor-not-allowed disabled:opacity-60">
                    <span className="translate-y-[1.5px]">Cancel</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={isMutating}
                    className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-purple px-5 text-[14px] font-bold text-white transition-colors hover:bg-purple-light disabled:cursor-not-allowed disabled:opacity-60 sm:px-6">
                    {isCreating ? (
                      <>
                        <Spinner
                          className="size-4 shrink-0"
                          tone="currentColor"
                        />
                        <span className="translate-y-[1.5px]">Creating…</span>
                      </>
                    ) : (
                      <span className="translate-y-[1.5px]">
                        Create Share Link
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <ActiveSharePanel
                share={share}
                fullShareUrl={fullShareUrl}
                copied={copied}
                isMutating={isMutating}
                confirmAction={confirmAction}
                onCopy={handleCopy}
                onExpirationChange={handleExpirationUpdate}
                onRequestConfirm={setConfirmAction}
                onConfirmRegenerate={handleRegenerate}
                onConfirmRevoke={handleRevoke}
              />
            )}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
