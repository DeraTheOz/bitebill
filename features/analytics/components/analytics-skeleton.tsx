export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading analytics">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col justify-between min-h-33 sm:min-h-34 rounded-xl border border-transparent bg-surface p-4 sm:p-5 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="h-3.5 w-24 rounded bg-surface-subtle" />
                {i === 1 && (
                  <div className="h-4 w-20 rounded-full bg-surface-subtle" />
                )}
              </div>
              <div className="size-8 shrink-0 rounded-lg bg-surface-subtle" />
            </div>
            <div className="mt-4">
              <div className="h-7 w-36 sm:w-44 rounded bg-surface-subtle" />
              <div className="mt-2 h-3.5 w-28 rounded bg-surface-subtle" />
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row: Trend Chart & AR Aging */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        <div className="h-100 rounded-xl bg-surface p-4 sm:p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] lg:col-span-2 dark:shadow-none">
          <div className="flex justify-between items-center">
            <div className="h-5 w-44 rounded bg-surface-subtle" />
            <div className="h-8 w-48 rounded-xl bg-surface-subtle" />
          </div>
          <div className="mt-4 h-8 w-32 rounded bg-surface-subtle" />
          <div className="mt-6 h-60 rounded-lg bg-surface-subtle" />
        </div>

        <div className="h-100 rounded-xl bg-surface p-4 sm:p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none">
          <div className="flex justify-between items-center">
            <div className="h-5 w-40 rounded bg-surface-subtle" />
            <div className="h-4 w-20 rounded bg-surface-subtle" />
          </div>
          <div className="mt-4 h-8 w-28 rounded bg-surface-subtle" />
          <div className="mt-4 h-3 w-full rounded-full bg-surface-subtle" />
          <div className="mt-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-28 rounded bg-surface-subtle" />
                <div className="h-4 w-16 rounded bg-surface-subtle" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Client Leaderboard Skeleton */}
      <div className="h-88 rounded-xl bg-surface p-4 sm:p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none">
        <div className="flex justify-between items-center">
          <div className="h-5 w-52 rounded bg-surface-subtle" />
          <div className="h-9 w-40 rounded-lg bg-surface-subtle" />
        </div>
        <div className="mt-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 w-full rounded bg-surface-subtle" />
          ))}
        </div>
      </div>
    </div>
  );
}
