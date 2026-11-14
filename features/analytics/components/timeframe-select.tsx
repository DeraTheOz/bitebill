"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  useCustomSelectField,
  type CustomSelectOption,
} from "@/hooks/use-custom-select-field";

export function TimeframeSelect({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly CustomSelectOption[];
  className?: string;
}) {
  const {
    listId,
    containerRef,
    triggerRef,
    optionRefs,
    isOpen,
    selected,
    handleToggle,
    handleSelect,
    handleKeyDown,
  } = useCustomSelectField({
    id: "analytics-timeframe",
    value,
    onChange,
    options,
    placement: "bottom",
  });

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-label="Filter analytics timeframe"
        onClick={handleToggle}
        className="flex h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-[13px] font-bold text-ink shadow-xs transition-colors hover:border-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple sm:h-12 sm:px-5 sm:text-[14px]">
        <span className="text-muted-light font-medium">Timeframe:</span>
        <span className="truncate">{selected ? selected.label : value}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-light transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          id={listId}
          role="listbox"
          aria-label="Filter analytics timeframe"
          className="absolute right-0 top-[calc(100%+6px)] z-40 min-w-56 max-h-64 overflow-y-auto scrollbar-purple rounded-xl border border-border bg-surface p-1.5 shadow-[0_16px_32px_-12px_rgba(var(--shadow-navy),0.25)] dark:bg-canvas">
          {options.map((opt, index) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                ref={(el) => {
                  optionRefs.current[index] = el;
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-bold transition-colors ${
                  isSelected
                    ? "bg-purple/10 text-purple"
                    : "text-ink hover:bg-surface-subtle"
                }`}>
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check
                    className="size-4 shrink-0 text-purple"
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

