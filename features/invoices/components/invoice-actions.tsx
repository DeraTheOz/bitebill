import { EditButton } from "@/components/buttons/edit-button";
import { DeleteButton } from "@/components/buttons/delete-button";
import { MarkAsPaidButton } from "@/components/buttons/mark-as-paid-button";
import { DownloadPdfButton } from "@/components/buttons/download-pdf-button";
import { Spinner } from "@/components/loaders/spinner";

export function Actions({
  className = "",
  onEdit,
  onDelete,
  onPaid,
  onDownloadPdf,
  showPaid,
  isMarkingPaid = false,
  isDeletePending = false,
  isDownloadingPdf = false,
}: {
  className?: string;
  onEdit: () => void;
  onDelete: () => void;
  onPaid: () => void;
  onDownloadPdf?: () => void;
  showPaid: boolean;
  isMarkingPaid?: boolean;
  isDeletePending?: boolean;
  isDownloadingPdf?: boolean;
}) {
  return (
    <div className={`w-full md:w-auto ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-2 w-full md:w-auto">
        {showPaid && (
          <div className="order-1 md:order-last w-full md:w-auto">
            <MarkAsPaidButton
              onClick={onPaid}
              disabled={isMarkingPaid}
              className="w-full md:w-32.75 inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60">
              {isMarkingPaid ? (
                <>
                  <Spinner className="size-4 shrink-0" tone="currentColor" />
                  <span>Marking…</span>
                </>
              ) : (
                "Mark as Paid"
              )}
            </MarkAsPaidButton>
          </div>
        )}

        <div className="order-2 md:order-1 grid grid-cols-3 md:flex md:items-center gap-2 w-full md:w-auto">
          {onDownloadPdf && (
            <DownloadPdfButton
              onClick={onDownloadPdf}
              isDownloading={isDownloadingPdf}
              className="w-full md:w-auto"
            />
          )}

          <EditButton onClick={onEdit} className="w-full md:w-auto" />

          <DeleteButton
            onClick={onDelete}
            disabled={isDeletePending}
            className="w-full md:w-auto disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>
    </div>
  );
}
