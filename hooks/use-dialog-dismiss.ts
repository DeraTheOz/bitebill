import { useEffect, useRef } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";

/**
 * Dismisses a modal dialog on outside click or Escape press unless `disabled`
 * is true (e.g., while a destructive mutation is in flight).
 */
export function useDialogDismiss(disabled: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLElement>(null);

  useClickOutside(panelRef, disabled ? () => {} : onClose);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !disabled) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, onClose]);

  return panelRef;
}

