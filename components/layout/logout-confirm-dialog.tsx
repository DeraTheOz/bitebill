"use client";

import { CancelButton } from "@/components/buttons/cancel-button";
import { DeleteButton } from "@/components/buttons/delete-button";
import { Spinner } from "@/components/loaders/spinner";
import { useLogoutConfirmDialog } from "@/hooks/use-logout-confirm-dialog";

export function LogoutConfirmDialog({ onClose }: { onClose: () => void }) {
  const { panelRef, isPending, handleConfirmLogout } =
    useLogoutConfirmDialog(onClose);

  return (
    <div className="fixed inset-0 z-110 overflow-y-auto overscroll-contain bg-black/50 p-4 sm:p-6">
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget && !isPending) onClose();
        }}
        className="flex min-h-full items-center justify-center">
        <section
          ref={panelRef}
          role="alertdialog"
          aria-modal="true"
          aria-busy={isPending}
          aria-labelledby="logout-confirm-title"
          className="my-auto w-full max-w-md rounded-xl bg-surface p-6 shadow-2xl sm:p-9">
          <h2
            id="logout-confirm-title"
            className="text-[22px] font-bold tracking-[-0.75px] text-ink sm:text-[24px]">
            Log out?
          </h2>
          <p className="mt-3 text-[13px] font-medium leading-5.5 text-muted-light">
            Are you sure you want to log out of your BiteBill workspace? You can
            sign back in at any time.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <CancelButton
              onClick={onClose}
              disabled={isPending}
              className="w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
            />
            <DeleteButton
              onClick={handleConfirmLogout}
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 sm:w-auto disabled:cursor-not-allowed disabled:opacity-60">
              {isPending ? (
                <>
                  <Spinner className="size-4" tone="currentColor" />
                  Logging out…
                </>
              ) : (
                "Log out"
              )}
            </DeleteButton>
          </div>
        </section>
      </div>
    </div>
  );
}
