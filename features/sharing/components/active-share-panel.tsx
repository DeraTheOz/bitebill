"use client";

import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { CustomSelectField } from "@/components/forms/custom-select-field";
import { Spinner } from "@/components/loaders/spinner";
import { formatDateTime } from "@/lib/format";
import {
  UPDATE_EXPIRATION_OPTIONS,
  type ShareConfirmAction,
} from "../hooks/use-share-invoice-dialog";
import type { InvoiceShare } from "../types/share";

type ActiveSharePanelProps = {
  share: InvoiceShare;
  fullShareUrl: string;
  copied: boolean;
  isMutating: boolean;
  confirmAction: ShareConfirmAction;
  onCopy: () => void;
  onExpirationChange: (value: string) => void;
  onRequestConfirm: (action: ShareConfirmAction) => void;
  onConfirmRegenerate: () => void;
  onConfirmRevoke: () => void;
};

export function ActiveSharePanel({
  share,
  fullShareUrl,
  copied,
  isMutating,
  confirmAction,
  onCopy,
  onExpirationChange,
  onRequestConfirm,
  onConfirmRegenerate,
  onConfirmRevoke,
}: ActiveSharePanelProps) {
  return (
    <div className="min-w-0 space-y-5">
      {/* Status + URL box */}
      <div className="min-w-0 rounded-lg border border-border bg-surface-subtle p-3.5 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-bold uppercase tracking-wider text-muted">
            Public Link
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-bold ${
              share.isExpired
                ? "bg-danger/10 text-danger"
                : "bg-status-paid/10 text-status-paid"
            }`}>
            <span className="size-1.5 shrink-0 rounded-full bg-current" />
            <span className="translate-y-[1.5px]">
              {share.isExpired ? "Expired" : "Active"}
            </span>
          </span>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <input
            type="text"
            readOnly
            value={fullShareUrl}
            aria-label="Public share URL"
            onFocus={(e) => e.currentTarget.select()}
            className="h-10 min-w-0 flex-1 basis-full rounded border border-border bg-surface px-3 font-mono text-[12px] text-ink outline-none focus:border-purple sm:basis-auto"
          />
          <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded bg-purple px-3.5 text-[13px] font-bold text-white transition-colors hover:bg-purple-light sm:flex-initial">
              {copied ? (
                <>
                  <Check className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="translate-y-[1.5px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="translate-y-[1.5px]">Copy</span>
                </>
              )}
            </button>
            <a
              href={share.sharePath}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open shared invoice preview"
              title="Open shared invoice"
              className="grid size-10 shrink-0 place-items-center rounded border border-border bg-surface text-muted transition-colors hover:border-purple hover:text-purple">
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* Analytics & Expiration */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="min-w-0 rounded-lg border border-border bg-surface-subtle/50 p-3.5">
          <div className="flex items-center gap-2 text-[12px] font-medium text-muted">
            <Eye className="size-3.5 shrink-0 text-purple" aria-hidden="true" />
            <span className="translate-y-[1.5px]">Client Views</span>
          </div>
          <p className="mt-1.5 text-[16px] font-bold text-ink">
            {share.viewCount === 1 ? "1 view" : `${share.viewCount} views`}
          </p>
          <p className="mt-0.5 text-[12px] font-medium text-muted-light">
            {share.lastViewedAt
              ? `Last viewed ${formatDateTime(share.lastViewedAt)}`
              : "Not viewed yet"}
          </p>
        </div>

        <div className="min-w-0 rounded-lg border border-border bg-surface-subtle/50 p-3.5">
          <div className="flex items-center gap-2 text-[12px] font-medium text-muted">
            <Clock
              className="size-3.5 shrink-0 text-purple"
              aria-hidden="true"
            />
            <span className="translate-y-[1.5px]">Expiration</span>
          </div>
          <p className="mt-1.5 mb-2 text-[13px] font-bold text-ink">
            {share.expiresAt
              ? formatDateTime(share.expiresAt)
              : "Never expires"}
          </p>
          <CustomSelectField
            id="share-expiration-update"
            ariaLabel="Update share link expiration"
            size="compact"
            value={share.expiresAt === null ? "never" : ""}
            placeholder="Change expiration…"
            onChange={onExpirationChange}
            options={UPDATE_EXPIRATION_OPTIONS}
            disabled={isMutating}
          />
        </div>
      </div>

      {/* Inline confirmation banner for destructive link actions */}
      {confirmAction && (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-4">
          <p className="text-[13px] font-medium leading-5 text-ink">
            {confirmAction === "regenerate"
              ? "Regenerating creates a new link and immediately invalidates the current URL and view count."
              : "Disabling removes the public link immediately. Clients will no longer be able to open it."}
          </p>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onRequestConfirm(null)}
              disabled={isMutating}
              className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full bg-surface px-4 text-[13px] font-bold text-muted transition-colors hover:bg-surface-subtle">
              <span className="translate-y-[1.5px]">Cancel</span>
            </button>
            <button
              type="button"
              onClick={
                confirmAction === "regenerate"
                  ? onConfirmRegenerate
                  : onConfirmRevoke
              }
              disabled={isMutating}
              className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-button-danger px-4 text-[13px] font-bold text-white transition-colors hover:bg-button-danger-light disabled:opacity-60">
              {isMutating && (
                <Spinner className="size-3.5 shrink-0" tone="currentColor" />
              )}
              <span className="translate-y-[1.5px]">
                {confirmAction === "regenerate"
                  ? "Confirm Regenerate"
                  : "Confirm Disable"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="grid grid-cols-2 items-center gap-2 border-t border-border pt-4 sm:flex sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => onRequestConfirm("disable")}
          disabled={isMutating}
          className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[13px] font-bold text-danger transition-colors hover:bg-danger/10 disabled:opacity-50 sm:px-3.5">
          <Trash2 className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="translate-y-[1.5px]">Disable Link</span>
        </button>

        <button
          type="button"
          onClick={() => onRequestConfirm("regenerate")}
          disabled={isMutating}
          className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-surface-subtle px-3 text-[13px] font-bold text-ink transition-colors hover:bg-border/60 disabled:opacity-50 sm:px-4">
          <RefreshCw className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="translate-y-[1.5px]">Regenerate Link</span>
        </button>
      </div>
    </div>
  );
}
