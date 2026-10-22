"use client";

import { useRef } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { CancelButton } from "@/components/buttons/cancel-button";
import { DeleteButton } from "@/components/buttons/delete-button";
import { Spinner } from "@/components/loaders/spinner";

export function DeleteClientDialog({
  clientName,
  isDeleting,
  onConfirm,
  onClose,
}: {
  clientName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLElement>(null);

  // Prevent dismissing the modal mid-delete
  useClickOutside(panelRef, isDeleting ? () => {} : onClose);

  return (
    <div className="fixed inset-0 z-110 grid place-items-center bg-black/50 px-6">
      <section
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-busy={isDeleting}
        aria-labelledby="delete-client-title"
        className="w-full max-w-120 rounded-lg bg-surface p-8 md:p-12">
        <h2
          id="delete-client-title"
          className="text-[24px] font-bold tracking-[-0.75px]">
          Confirm Deletion
        </h2>
        <p className="mt-4 text-[13px] font-medium leading-5.5 text-muted-light">
          Are you sure you want to delete your client,{" "}
          <span className="font-bold">{clientName}</span>? This action cannot be
          undone and will remove this client from your records.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <CancelButton
            onClick={onClose}
            disabled={isDeleting}
            className="disabled:cursor-not-allowed disabled:opacity-60"
          />
          <DeleteButton
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60">
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
  );
}
