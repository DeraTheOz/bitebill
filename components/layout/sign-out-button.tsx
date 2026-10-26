"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/features/auth/actions/sign-out";

type SignOutButtonProps = {
  className?: string;
  onSignOut?: () => void;
  compact?: boolean;
};

export function SignOutButton({
  className,
  onSignOut,
  compact = false,
}: SignOutButtonProps) {
  return (
    <form action={signOut} className={className}>
      <button
        type="submit"
        onClick={onSignOut}
        aria-label={compact ? "Log out" : undefined}
        className={
          compact
            ? "grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-sidebar-border/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple"
            : "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-muted-light transition-colors hover:bg-sidebar-border/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple"
        }>
        <LogOut className="size-5 shrink-0" aria-hidden="true" />
        {!compact && "Log out"}
      </button>
    </form>
  );
}
