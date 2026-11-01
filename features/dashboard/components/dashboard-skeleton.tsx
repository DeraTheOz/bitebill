export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading dashboard">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-surface p-5 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 rounded bg-surface-subtle" />
              <div className="size-9 rounded-lg bg-surface-subtle" />
            </div>
            <div className="mt-4 h-7 w-32 rounded bg-surface-subtle" />
            <div className="mt-2 h-4 w-20 rounded bg-surface-subtle" />
          </div>
        ))}
      </div>

      {/* Middle Row: Trend Chart & Status Breakdown */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        <div className="h-100 rounded-xl bg-surface p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] lg:col-span-2 dark:shadow-none">
          <div className="h-5 w-40 rounded bg-surface-subtle" />
          <div className="mt-3 flex justify-between items-center">
            <div className="h-9 w-44 rounded bg-surface-subtle" />
            <div className="h-9 w-60 rounded-xl bg-surface-subtle" />
          </div>
          <div className="mt-8 h-64 rounded-lg bg-surface-subtle" />
        </div>

        <div className="h-100 rounded-xl bg-surface p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none">
          <div className="flex justify-between items-center">
            <div className="h-5 w-36 rounded bg-surface-subtle" />
            <div className="h-4 w-20 rounded bg-surface-subtle" />
          </div>
          <div className="my-4 flex justify-center items-center">
            <div className="size-48 rounded-full bg-surface-subtle" />
          </div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-24 rounded bg-surface-subtle" />
                <div className="h-4 w-16 rounded bg-surface-subtle" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Invoices & Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-80 rounded-xl bg-surface p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none">
          <div className="h-5 w-36 rounded bg-surface-subtle" />
          <div className="mt-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 w-full rounded bg-surface-subtle" />
            ))}
          </div>
        </div>

        <div className="h-80 rounded-xl bg-surface p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none">
          <div className="h-5 w-36 rounded bg-surface-subtle" />
          <div className="mt-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-full rounded bg-surface-subtle" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

