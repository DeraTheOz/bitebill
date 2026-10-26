"use client";

import { useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import type { InvoiceStatusFilter } from "@/features/invoices/types/invoice";

const options: Array<{ value: InvoiceStatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
];

export function ClientInvoiceFilter({
  value,
  counts,
  onChange,
}: {
  value: InvoiceStatusFilter;
  counts: Record<InvoiceStatusFilter, number>;
  onChange: (filter: InvoiceStatusFilter) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false));

  function selectFilter(filter: InvoiceStatusFilter) {
    onChange(filter);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex h-11 items-center gap-3 rounded-lg border border-border bg-surface px-4 text-[15px] font-bold tracking-[-0.25px] text-ink transition-colors hover:border-purple focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple">
        <span>
          {options.find((option) => option.value === value)?.label}
          <span className="hidden md:inline"> invoices</span>
        </span>
        <ChevronDown
          size={18}
          strokeWidth={2}
          className={`text-purple transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        role="menu"
        aria-hidden={!isOpen}
        className={`absolute right-0 top-13 z-20 w-52 max-w-[calc(100vw-3rem)] rounded-lg bg-surface p-3 shadow-[0_10px_30px_-10px_rgba(var(--shadow-navy),0.25)] transition-[opacity,transform,visibility] duration-150 ease-out dark:bg-surface-subtle ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0"
        }`}>
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={isSelected}
              onClick={() => selectFilter(option.value)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left text-[15px] font-bold tracking-[-0.25px] transition-colors hover:bg-purple/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple">
              <span className="flex items-center gap-3">
                <span
                  className={`grid size-4 shrink-0 place-items-center rounded-sm border transition-colors ${
                    isSelected
                      ? "border-purple bg-purple text-white"
                      : "border-border bg-surface"
                  }`}>
                  <Check
                    size={11}
                    strokeWidth={3.5}
                    className={`transition-opacity duration-150 ${isSelected ? "opacity-100" : "opacity-0"}`}
                  />
                </span>
                {option.label}
              </span>
              <span className="font-mono text-[12px] font-medium text-muted-light">
                {counts[option.value]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
