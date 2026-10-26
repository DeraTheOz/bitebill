import { EditButton } from "@/components/buttons/edit-button";
import { DeleteButton } from "@/components/buttons/delete-button";
import { MarkAsPaidButton } from "@/components/buttons/mark-as-paid-button";
import { Spinner } from "@/components/loaders/spinner";

export function Actions({
  className,
  onEdit,
  onDelete,
  onPaid,
  showPaid,
  isMarkingPaid = false,
  isDeletePending = false,
}: {
  className: string;
  onEdit: () => void;
  onDelete: () => void;
  onPaid: () => void;
  showPaid: boolean;
  isMarkingPaid?: boolean;
  isDeletePending?: boolean;
}) {
  return (
    <div className={`gap-2 ${className}`}>
      <EditButton onClick={onEdit} />

      <DeleteButton
        onClick={onDelete}
        disabled={isDeletePending}
        className="disabled:cursor-not-allowed disabled:opacity-60"
      />

      {showPaid && (
        <MarkAsPaidButton
          onClick={onPaid}
          disabled={isMarkingPaid}
          className="inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60">
          {isMarkingPaid ? (
            <>
              <Spinner className="size-4" tone="currentColor" />
              Marking…
            </>
          ) : (
            "Mark as Paid"
          )}
        </MarkAsPaidButton>
      )}
    </div>
  );
}
