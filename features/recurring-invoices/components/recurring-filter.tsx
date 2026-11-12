"use client";

import { Check, ChevronDown } from "lucide-react";
import { useRecurringFilter } from "../hooks/use-recurring-filter";
import type {
  RecurringFrequency,
  RecurringStatusFilter,
} from "../types/recurring";

const statusOptions: Array<{ value: RecurringStatusFilter; label: string }> = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
];

const frequencyOptions: Array<{ value: RecurringFrequency; label: string }> = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

export function RecurringFilter({
  selectedStatuses,
  selectedFrequencies,
  onToggleStatus,
  onToggleFrequency,
}: {
  selectedStatuses: RecurringStatusFilter[];
  selectedFrequencies: RecurringFrequency[];
  onToggleStatus: (value: RecurringStatusFilter) => void;
  onToggleFrequency: (value: RecurringFrequency) => void;
}) {
  const { isOpen, containerRef, toggleOpen } = useRecurringFilter();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-label="Filter recurring invoices"
        className="flex items-center gap-3 rounded text-[15px] font-bold tracking-[-0.25px] transition-colors hover:text-purple active:text-purple-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple">
        <span>Filter</span>
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
        className={`absolute left-0 right-auto top-9 z-20 w-52 max-w-[calc(100vw-3rem)] rounded-lg bg-surface p-5 shadow-xl transition-[opacity,transform,visibility] duration-150 ease-out sm:left-auto sm:right-0 dark:bg-surface-subtle ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0"
        }`}>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-light">
          Status
        </p>
        {statusOptions.map((option) => {
          const isSelected = selectedStatuses.includes(option.value);
          return (
            <label
              key={option.value}
              className="group flex cursor-pointer items-center gap-3 py-1.5 text-[15px] font-bold tracking-[-0.25px]">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleStatus(option.value)}
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
              {option.label}
            </label>
          );
        })}

        <div className="my-3 border-t border-border" />

        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-light">
          Frequency
        </p>
        {frequencyOptions.map((option) => {
          const isSelected = selectedFrequencies.includes(option.value);
          return (
            <label
              key={option.value}
              className="group flex cursor-pointer items-center gap-3 py-1.5 text-[15px] font-bold tracking-[-0.25px]">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleFrequency(option.value)}
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
              {option.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}

