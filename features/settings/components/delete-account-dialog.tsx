"use client";

import { CancelButton } from "@/components/buttons/cancel-button";
import { DeleteButton } from "@/components/buttons/delete-button";
import { TextField } from "@/components/forms/text-field";
import { Spinner } from "@/components/loaders/spinner";
import { useDeleteAccountDialog } from "../hooks/use-delete-account-dialog";
import type { DeleteAccountValues } from "../schemas/settings-schema";

export function DeleteAccountDialog({
  requiresPassword,
  isDeleting,
  onConfirm,
  onClose,
}: {
  requiresPassword: boolean;
  isDeleting: boolean;
  onConfirm: (values: DeleteAccountValues) => Promise<void> | void;
  onClose: () => void;
}) {
  const { panelRef, submitError, errors, register, handleSubmit } =
    useDeleteAccountDialog({
      requiresPassword,
      isDeleting,
      onConfirm,
      onClose,
    });

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
          aria-labelledby="delete-account-title"
          className="my-auto w-full max-w-120 rounded-xl bg-surface p-6 shadow-2xl sm:p-10">
          <h2
            id="delete-account-title"
            className="text-[22px] font-bold tracking-[-0.75px] text-ink sm:text-[24px]">
            Delete Account
          </h2>
          <p className="mt-4 text-[13px] font-medium leading-5.5 text-muted-light">
            This permanently deletes your account, branding settings, clients,
            invoices, public share links, and recurring invoices. This action
            cannot be undone.
          </p>

          <form
            noValidate
            onSubmit={handleSubmit}
            className="mt-5 space-y-4">
            <TextField
              label='Type "DELETE" to confirm'
              id="delete-account-confirmation"
              type="text"
              placeholder="DELETE"
              disabled={isDeleting}
              error={errors.confirmation?.message}
              {...register("confirmation")}
            />

            {requiresPassword && (
              <TextField
                label="Current password"
                id="delete-account-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                disabled={isDeleting}
                error={errors.password?.message}
                {...register("password")}
              />
            )}

            {submitError && (
              <p
                role="alert"
                className="rounded border border-danger/20 bg-danger/10 px-4 py-3 text-[13px] font-medium text-danger">
                {submitError}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <CancelButton
                onClick={onClose}
                disabled={isDeleting}
                className="w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
              />
              <DeleteButton
                type="submit"
                disabled={isDeleting}
                className="inline-flex w-full items-center justify-center gap-2 sm:w-auto disabled:cursor-not-allowed disabled:opacity-60">
                {isDeleting ? (
                  <>
                    <Spinner className="size-4" tone="currentColor" />
                    Deleting…
                  </>
                ) : (
                  "Delete Account"
                )}
              </DeleteButton>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
