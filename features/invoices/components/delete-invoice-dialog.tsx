"use client";

import { useEffect, useRef } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { CancelButton } from "@/components/buttons/cancel-button";
import { DeleteButton } from "@/components/buttons/delete-button";
import { Spinner } from "@/components/loaders/spinner";

export function DeleteInvoiceDialog({
  invoiceNumber,
  isDeleting,
  onConfirm,
  onClose,
}: {
  invoiceNumber: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLElement>(null);

  // Prevent dismissing the modal mid-delete
  useClickOutside(panelRef, isDeleting ? () => {} : onClose);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDeleting) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDeleting, onClose]);

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
          aria-labelledby="delete-invoice-title"
          className="my-auto w-full max-w-120 rounded-xl bg-surface p-6 shadow-2xl sm:p-10">
          <h2
            id="delete-invoice-title"
            className="text-[22px] font-bold tracking-[-0.75px] sm:text-[24px]">
            Confirm Deletion
          </h2>
          <p className="mt-4 text-[13px] font-medium leading-5.5 text-muted-light">
            Are you sure you want to delete invoice{" "}
            <span className="font-bold text-ink">#{invoiceNumber}</span>? This
            action cannot be undone and will remove this invoice from your
            records.
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
