import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { ApiError } from "../lib/api";
import {
  changePasswordSchema,
  type ChangePasswordInput,
  type ChangePasswordValues,
  type DeleteAccountValues,
} from "../schemas/settings-schema";
import {
  useChangePassword,
  useDeleteAccount,
  useUserAccounts,
} from "./use-settings-queries";

/** Manages connected sign-in inspection, password changes, OTP recovery toggle, and account deletion. */
export function useAccountSecurity() {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isForgotCurrentMode, setIsForgotCurrentMode] = useState(false);

  const {
    data: accounts,
    isPending: isLoadingAccounts,
    isError: isAccountsError,
    refetch,
  } = useUserAccounts();

  const changePassword = useChangePassword();
  const deleteAccount = useDeleteAccount();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput, unknown, ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      revokeOtherSessions: true,
    },
    mode: "onTouched",
  });

  const isChangingPassword = isSubmitting || changePassword.isPending;
  const hasCredential = accounts?.hasCredentialAccount ?? false;
  const providers = accounts?.providers ?? [];

  async function onChangePassword(values: ChangePasswordValues) {
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: values.revokeOtherSessions,
      });
      reset();
      toast.success("Password updated");
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.code === "INVALID_PASSWORD" ||
          /invalid.*password/i.test(error.message))
      ) {
        setError(
          "currentPassword",
          { message: "Current password is incorrect" },
          { shouldFocus: true },
        );
        return;
      }

      toast.error(
        error instanceof Error ? error.message : "Could not change password",
      );
    }
  }

  async function handleConfirmDelete(values: DeleteAccountValues) {
    const result = await deleteAccount.mutateAsync({
      confirmation: values.confirmation,
      password: values.password,
    });

    if (result.outcome === "verification-sent") {
      toast.success("Check your email to confirm permanent account deletion.");
      setIsDeleteOpen(false);
      return;
    }

    toast.success("Account deleted");
  }

  function handleForgotSuccess() {
    reset();
    setIsForgotCurrentMode(false);
  }

  return {
    isLoadingAccounts,
    isAccountsError,
    hasCredential,
    providers,
    isDeleteOpen,
    isForgotCurrentMode,
    isChangingPassword,
    isDeletingAccount: deleteAccount.isPending,
    errors,
    register,
    refetchAccounts: () => void refetch(),
    setIsDeleteOpen,
    setIsForgotCurrentMode,
    handleForgotSuccess,
    handlePasswordSubmit: handleSubmit(onChangePassword),
    handleConfirmDelete,
  };
}

