export function ClientInvoiceCardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading invoices"
      className="grid gap-4 sm:grid-cols-2">
      {[0, 1].map((index) => (
        <div
          key={index}
          className="h-38 animate-pulse rounded-lg border border-border bg-surface"
        />
      ))}
    </div>
  );
}
