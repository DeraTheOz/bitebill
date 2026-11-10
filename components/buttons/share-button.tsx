import { Share2 } from "lucide-react";
import type { ButtonProps } from "./button";

interface ShareButtonProps extends ButtonProps {
  isShared?: boolean;
}

export function ShareButton({
  className = "",
  type = "button",
  isShared = false,
  children,
  ...props
}: ShareButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex h-11 md:h-12 w-full md:w-auto items-center justify-center gap-1.5 md:gap-2 rounded-3xl bg-surface-subtle px-3 md:px-4.5 text-sm md:text-[15px] font-bold text-ink transition-colors hover:bg-border/60 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}>
      <Share2 className="size-4 text-muted shrink-0" aria-hidden="true" />
      <span className="translate-y-[1.5px] truncate">{children ?? "Share"}</span>
      {isShared && (
        <span
          aria-label="Share link active"
          className="size-2 shrink-0 rounded-full bg-status-paid"
        />
      )}
    </button>
  );
}

