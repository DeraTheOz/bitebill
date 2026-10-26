"use client";

import { useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import type { InvoiceStatus } from "../types/invoice";

const filters: Array<{ value: InvoiceStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

export function InvoiceFilter({
  selectedFilters,
  onToggle,
}: {
  selectedFilters: InvoiceStatus[];
  onToggle: (filter: InvoiceStatus) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false));

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        className="flex items-center gap-3 rounded text-[15px] font-bold tracking-[-0.25px] transition-colors hover:text-purple active:text-purple-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple">
        <span>
          Filter <span className="hidden md:inline">by status</span>
        </span>
        <ChevronDown
          size={18}
          strokeWidth={2}
          className={`text-purple transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        aria-hidden={!isOpen}
        className={`absolute left-0 right-auto top-9 z-20 w-48 max-w-[calc(100vw-3rem)] rounded-lg bg-surface p-6 transition-[opacity,transform,visibility] duration-150 ease-out max-[360px]:w-44 sm:left-auto sm:right-0 dark:bg-surface-subtle ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0"
        }`}>
        {filters.map((filter) => {
          const isSelected = selectedFilters.includes(filter.value);

          return (
            <label
              key={filter.value}
              className="group flex cursor-pointer items-center gap-3 py-1.5 text-[15px] font-bold tracking-[-0.25px]">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(filter.value)}
                className="sr-only"
              />
              <span
                className={`grid size-4 shrink-0 place-items-center rounded-sm border transition-colors ${
                  isSelected
                    ? "border-purple bg-purple text-white"
                    : "border-border bg-surface group-hover:border-purple"
                }`}>
                <Check
                  size={11}
                  strokeWidth={3.5}
                  className={`transition-opacity duration-150 ${
                    isSelected ? "opacity-100" : "opacity-0"
                  }`}
                />
              </span>
              {filter.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}
