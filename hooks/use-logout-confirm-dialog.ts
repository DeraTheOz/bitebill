import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "@/features/auth/actions/sign-out";
import { useDialogDismiss } from "@/hooks/use-dialog-dismiss";

/** Manages logout confirmation state, query cache cleanup, and dialog dismissal. */
export function useLogoutConfirmDialog(onClose: () => void) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const panelRef = useDialogDismiss(isPending, onClose);

  function handleConfirmLogout() {
    startTransition(async () => {
      queryClient.clear();
      await signOut();
    });
  }

  return {
    panelRef,
    isPending,
    handleConfirmLogout,
  };
}

