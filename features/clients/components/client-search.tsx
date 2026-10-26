"use client";

import { Search, X } from "lucide-react";

export function ClientSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full">
      <Search
        size={16}
        strokeWidth={2}
        aria-hidden="true"
        className="pointer-events-none absolute max-[375px]:left-4 left-8 top-1/2 -translate-y-1/2 text-muted-light"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by name, email, or company"
        aria-label="Search clients"
        className="h-12 w-full rounded-lg border border-border bg-surface max-[375px]:pl-11 max-[375px]:pr-4 pl-16 pr-10 text-[15px] font-medium tracking-[-0.25px] text-ink caret-purple outline-none transition-colors placeholder:text-muted-light focus:border-purple [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted-light transition-colors hover:text-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple">
          <X size={14} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
