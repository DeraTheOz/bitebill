"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/features/auth/lib/client";
import { mapOtpError } from "@/features/auth/lib/otp-error";
import { ApiError, settingsApi } from "../lib/api";

/** TanStack Query key factory for user settings queries. */
export const settingsKeys = {
  accounts: ["settings", "accounts"] as const,
};

/** Fetches connected auth providers and credential password availability for the signed-in user. */
export function useUserAccounts() {
  return useQuery({
    queryKey: settingsKeys.accounts,
    queryFn: settingsApi.getAccounts,
    staleTime: 5 * 60 * 1000,
  });
}

/** Updates the signed-in user's display name and refreshes server components. */
export function useUpdateProfile() {
  const router = useRouter();

  return useMutation({
    mutationFn: (values: { name: string }) =>
      settingsApi.updateProfile(values),
    onSuccess: () => {
      router.refresh();
    },
  });
}

/** Updates the user's credential password using their current password. */
export function useChangePassword() {
  return useMutation({
    mutationFn: (values: {
      currentPassword: string;
      newPassword: string;
      revokeOtherSessions: boolean;
    }) => settingsApi.changePassword(values),
  });
}

/** Sends a password setup/reset OTP to the signed-in user's email. */
export function useRequestSetupPasswordOtp() {
  return useMutation({
    mutationFn: () => settingsApi.requestSetupPasswordOtp(),
  });
}

/** Sets or resets the user's password with a verified OTP and checks whether the session stayed active. */
export function useResetPasswordWithOtp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: {
      email: string;
      otp: string;
      password: string;
    }): Promise<{ sessionActive: boolean }> => {
      const { error } = await authClient.emailOtp.resetPassword(values);
      if (error) {
        throw new Error(mapOtpError(error));
      }

      // Verify whether upstream Neon Auth kept or revoked the session on reset.
      try {
        const accounts = await settingsApi.getAccounts();
        queryClient.setQueryData(settingsKeys.accounts, accounts);
        return { sessionActive: true };
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          await authClient.signOut().catch(() => undefined);
          queryClient.clear();
          return { sessionActive: false };
        }
        queryClient.invalidateQueries({ queryKey: settingsKeys.accounts });
        return { sessionActive: true };
      }
    },
  });
}

/** Deletes the user's account and workspace data, then clears caches and redirects home. */
export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (values: { confirmation: string; password?: string }) =>
      settingsApi.deleteAccount(values),
    onSuccess: (result) => {
      if (result.outcome === "deleted") {
        queryClient.clear();
        router.replace("/");
        router.refresh();
      }
    },
  });
}
