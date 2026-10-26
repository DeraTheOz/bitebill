import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationBarProps = {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  label: string;
};

export function PaginationBar({
  page,
  pageCount,
  pageSize,
  total,
  onPageChange,
  label,
}: PaginationBarProps) {
  if (pageCount <= 1) return null;

  const startIndex = (page - 1) * pageSize;
  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav
      aria-label={label}
      className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
      <p className="text-[13px] font-medium text-muted-light">
        Showing {startIndex + 1}–
        {Math.min(startIndex + pageSize, total)} of {total}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="Previous page"
          className="grid size-10 place-items-center rounded-lg border border-border bg-surface text-muted transition-colors hover:border-purple hover:text-purple disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple">
          <ChevronLeft size={18} strokeWidth={2} />
        </button>

        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            aria-current={pageNumber === page ? "page" : undefined}
            aria-label={`Page ${pageNumber}`}
            className={`size-10 rounded-lg text-[15px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple ${
              pageNumber === page
                ? "bg-purple text-white"
                : "border border-border bg-surface text-muted hover:border-purple hover:text-purple"
            }`}>
            {pageNumber}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
          disabled={page === pageCount}
          aria-label="Next page"
          className="grid size-10 place-items-center rounded-lg border border-border bg-surface text-muted transition-colors hover:border-purple hover:text-purple disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple">
          <ChevronRight size={18} strokeWidth={2} />
        </button>
      </div>
    </nav>
  );
}
