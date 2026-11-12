"use client";

import { CancelButton } from "@/components/buttons/cancel-button";
import { DeleteButton } from "@/components/buttons/delete-button";
import { Spinner } from "@/components/loaders/spinner";
import { useDialogDismiss } from "@/hooks/use-dialog-dismiss";

export function DeleteRecurringDialog({
  title,
  isDeleting,
  onConfirm,
  onClose,
}: {
  title: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const panelRef = useDialogDismiss(isDeleting, onClose);

  return (
    <div className="fixed inset-0 z-110 overflow-y-auto overscroll-contain bg-black/50 p-4 sm:p-6">
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget && !isDeleting) onClose();
        }}
        className="flex min-h-full items-center justify-center">
        <section
          ref={panelRef}
          role="alertdialog"
          aria-modal="true"
          aria-busy={isDeleting}
          aria-labelledby="delete-recurring-title"
          className="my-auto w-full max-w-120 rounded-xl bg-surface p-6 shadow-2xl sm:p-10">
          <h2
            id="delete-recurring-title"
            className="text-[22px] font-bold tracking-[-0.75px] sm:text-[24px]">
            Delete Recurring Invoice
          </h2>
          <p className="mt-4 text-[13px] font-medium leading-5.5 text-muted-light">
            Are you sure you want to delete{" "}
            <span className="font-bold text-ink">{title}</span>? Future
            invoices will no longer be generated, while previously generated
            invoices remain in your records.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <CancelButton
              onClick={onClose}
              disabled={isDeleting}
              className="w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
            />
            <DeleteButton
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex w-full items-center justify-center gap-2 sm:w-auto disabled:cursor-not-allowed disabled:opacity-60">
              {isDeleting ? (
                <>
                  <Spinner className="size-4" tone="currentColor" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </DeleteButton>
          </div>
        </section>
      </div>
    </div>
  );
}

