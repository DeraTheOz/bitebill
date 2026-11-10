import { EditButton } from "@/components/buttons/edit-button";
import { DeleteButton } from "@/components/buttons/delete-button";
import { MarkAsPaidButton } from "@/components/buttons/mark-as-paid-button";
import { DownloadPdfButton } from "@/components/buttons/download-pdf-button";
import { ShareButton } from "@/components/buttons/share-button";
import { Spinner } from "@/components/loaders/spinner";

export function Actions({
  className = "",
  onEdit,
  onDelete,
  onPaid,
  onDownloadPdf,
  onShare,
  showPaid,
  isMarkingPaid = false,
  isDeletePending = false,
  isDownloadingPdf = false,
  isShared = false,
}: {
  className?: string;
  onEdit: () => void;
  onDelete: () => void;
  onPaid: () => void;
  onDownloadPdf?: () => void;
  onShare?: () => void;
  showPaid: boolean;
  isMarkingPaid?: boolean;
  isDeletePending?: boolean;
  isDownloadingPdf?: boolean;
  isShared?: boolean;
}) {
  const hasUtilityActions = Boolean(onDownloadPdf || onShare);

  return (
    <div className={`w-full xl:w-auto ${className}`}>
      <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:justify-between xl:justify-end">
        {hasUtilityActions && (
          <div className="grid grid-cols-2 gap-2 md:flex md:items-center">
            {onDownloadPdf && (
              <DownloadPdfButton
                onClick={onDownloadPdf}
                isDownloading={isDownloadingPdf}
                className="w-full md:w-auto"
              />
            )}

            {onShare && (
              <ShareButton
                onClick={onShare}
                isShared={isShared}
                className="w-full md:w-auto"
              />
            )}
          </div>
        )}

        <div
          className={`grid gap-2 md:flex md:items-center ${
            showPaid ? "grid-cols-2 sm:grid-cols-[1fr_1fr_1.4fr]" : "grid-cols-2"
          }`}>
          <EditButton onClick={onEdit} className="w-full md:w-auto" />

          <DeleteButton
            onClick={onDelete}
            disabled={isDeletePending}
            className="w-full md:w-auto disabled:cursor-not-allowed disabled:opacity-60"
          />

          {showPaid && (
            <MarkAsPaidButton
              onClick={onPaid}
              disabled={isMarkingPaid}
              className="col-span-2 w-full sm:col-span-1 sm:w-auto md:w-32.75 inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60">
              {isMarkingPaid ? (
                <>
                  <Spinner className="size-4 shrink-0" tone="currentColor" />
                  <span>Marking…</span>
                </>
              ) : (
                "Mark as Paid"
              )}
            </MarkAsPaidButton>
          )}
        </div>
      </div>
    </div>
  );
}
