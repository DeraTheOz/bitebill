import { Download } from "lucide-react";
import { Spinner } from "@/components/loaders/spinner";
import type { ButtonProps } from "./button";

interface DownloadPdfButtonProps extends ButtonProps {
  isDownloading?: boolean;
}

export function DownloadPdfButton({
  className = "",
  type = "button",
  isDownloading = false,
  disabled,
  children,
  ...props
}: DownloadPdfButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isDownloading}
      className={`inline-flex h-11 md:h-12 w-full md:w-auto items-center justify-center gap-1.5 md:gap-2 rounded-3xl bg-surface-subtle px-3 md:px-4.5 text-sm md:text-[15px] font-bold text-ink transition-colors hover:bg-border/60 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}>
      {isDownloading ? (
        <>
          <Spinner className="size-4 shrink-0" tone="currentColor" />
          <span className="truncate">Generating...</span>
        </>
      ) : (
        <>
          <Download className="size-4 text-muted shrink-0" aria-hidden="true" />
          <span className="truncate">{children ?? "PDF"}</span>
        </>
      )}
    </button>
  );
}
