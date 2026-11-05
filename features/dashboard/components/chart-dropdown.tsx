"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  useChartDropdown,
  type ChartDropdownOption,
} from "../hooks/use-chart-dropdown";

export type { ChartDropdownOption };

export function ChartDropdown({
  value,
  onChange,
  options,
  align = "right",
  ariaLabel,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly ChartDropdownOption[];
  align?: "left" | "right";
  ariaLabel: string;
  className?: string;
}) {
  const {
    listId,
    containerRef,
    isOpen,
    selected,
    handleKeyDown,
    handleToggle,
    handleSelect,
  } = useChartDropdown({
    value,
    onChange,
    options,
  });

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={handleToggle}
        className="flex items-center gap-2 rounded-lg border border-border/60 bg-surface-subtle px-3 py-1.5 text-[12px] font-bold text-ink shadow-xs transition-colors hover:border-purple focus-visible:outline-2 focus-visible:outline-purple dark:bg-canvas">
        <span className="truncate">{selected ? selected.label : value}</span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-muted-light transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute top-[calc(100%+6px)] z-30 min-w-44 max-h-60 overflow-y-auto scrollbar-purple rounded-xl border border-border bg-surface p-1.5 shadow-[0_16px_32px_-12px_rgba(var(--shadow-navy),0.25)] dark:bg-canvas ${
            align === "right" ? "right-0" : "left-0"
          } max-w-[calc(100vw-2rem)]`}>
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-bold transition-colors ${
                  isSelected
                    ? "bg-purple/10 text-purple"
                    : "text-ink hover:bg-surface-subtle"
                }`}>
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check
                    className="size-3.5 shrink-0 text-purple"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
