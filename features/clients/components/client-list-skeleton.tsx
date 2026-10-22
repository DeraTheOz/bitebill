export function ClientListSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="h-23 animate-pulse rounded-lg bg-surface px-6 dark:bg-white/5 max-[720px]:h-33.5">
          <div className="flex h-full items-center gap-4 max-[720px]:pt-5">
            <div className="size-10 shrink-0 rounded-full bg-purple/10" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3.5 w-40 rounded-full bg-purple/10" />
              <div className="h-3 w-56 rounded-full bg-purple/5" />
            </div>
            <div className="h-3 w-20 rounded-full bg-purple/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
