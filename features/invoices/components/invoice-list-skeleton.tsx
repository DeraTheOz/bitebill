export function InvoiceListSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-lg bg-surface px-6 py-6 dark:bg-white/5 max-[720px]:h-33.5">
          <div className="flex h-full items-center gap-4 max-[720px]:pt-2">
            <div className="h-3.5 w-24 rounded-full bg-purple/10" />
            <div className="h-3 w-28 rounded-full bg-purple/5 max-[720px]:hidden" />
            <div className="h-3 w-32 rounded-full bg-purple/5 max-[720px]:hidden" />
            <div className="ml-auto h-3 w-20 rounded-full bg-purple/5" />
            <div className="h-10 w-26 rounded-md bg-purple/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
