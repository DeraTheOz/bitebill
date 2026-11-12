import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDialogDismiss } from "@/hooks/use-dialog-dismiss";
import { ApiError } from "../lib/api";
import {
  deleteAccountSchema,
  type DeleteAccountInput,
  type DeleteAccountValues,
} from "../schemas/settings-schema";

/** Manages delete account confirmation validation, inline password errors, and modal dismissal. */
export function useDeleteAccountDialog({
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const panelRef = useDialogDismiss(isDeleting, onClose);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DeleteAccountInput, unknown, DeleteAccountValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { confirmation: "", password: "" },
  });

  async function onSubmit(values: DeleteAccountValues) {
    setSubmitError(null);

    if (requiresPassword && !values.password?.trim()) {
      setError(
        "password",
        { message: "Enter your current password" },
        { shouldFocus: true },
      );
      return;
    }

    try {
      await onConfirm(values);
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.code === "INVALID_PASSWORD" ||
          error.code === "PASSWORD_REQUIRED")
      ) {
        setError(
          "password",
          { message: error.message },
          { shouldFocus: true },
        );
        return;
      }

      setSubmitError(
        error instanceof Error ? error.message : "Could not delete account",
      );
    }
  }

  return {
    panelRef,
    submitError,
    errors,
    register,
    handleSubmit: handleSubmit(onSubmit),
  };
}

