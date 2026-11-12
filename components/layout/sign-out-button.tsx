"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { LogoutConfirmDialog } from "./logout-confirm-dialog";

type SignOutButtonProps = {
  className?: string;
  onSignOut?: () => void;
  compact?: boolean;
};

export function SignOutButton({
  className = "",
  onSignOut,
  compact = false,
}: SignOutButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function handleClick() {
    if (onSignOut) {
      onSignOut();
      return;
    }
    setIsConfirmOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={compact ? "Log out" : undefined}
        className={
          compact
            ? `grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-sidebar-border/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple ${className}`
            : `flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-muted-light transition-colors hover:bg-sidebar-border/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple ${className}`
        }>
        <LogOut className="size-5 shrink-0" aria-hidden="true" />
        {!compact && "Log out"}
      </button>

      {!onSignOut && isConfirmOpen && (
        <LogoutConfirmDialog onClose={() => setIsConfirmOpen(false)} />
      )}
    </>
  );
}
