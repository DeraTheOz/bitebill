"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  useCustomSelectField,
  type CustomSelectOption,
} from "@/hooks/use-custom-select-field";

export type { CustomSelectOption };

export type CustomSelectFieldProps = {
  label?: string;
  ariaLabel?: string;
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly CustomSelectOption[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  size?: "default" | "compact";
  placement?: "auto" | "bottom" | "top";
  className?: string;
};

export function CustomSelectField({
  label,
  ariaLabel,
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  error,
  disabled = false,
  size = "default",
  placement = "auto",
  className = "",
}: CustomSelectFieldProps) {
  const {
    inputId,
    listId,
    containerRef,
    triggerRef,
    optionRefs,
    isOpen,
    openUpward,
    selected,
    handleToggle,
    handleSelect,
    handleKeyDown,
  } = useCustomSelectField({
    id,
    name,
    value,
    onChange,
    options,
    disabled,
    placement,
  });

  const isCompact = size === "compact";

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className="relative flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-medium text-muted">
          {label}
        </label>
      )}

      {name && <input type="hidden" name={name} value={value} />}

      <div className="relative">
        <button
          ref={triggerRef}
          id={inputId}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-label={ariaLabel ?? label}
          disabled={disabled}
          onClick={handleToggle}
          className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded border bg-surface text-left transition-colors focus:border-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple disabled:cursor-not-allowed disabled:opacity-60 ${
            isCompact ? "h-9 px-3 text-[12px]" : "h-12 px-4 text-[15px]"
          } ${error ? "border-danger" : "border-border"} ${className}`}>
          <span
            className={`truncate font-bold ${
              selected ? "text-ink" : "text-muted-light"
            }`}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            className={`shrink-0 text-muted-light transition-transform duration-200 ${
              isCompact ? "size-3.5" : "size-4"
            } ${isOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div
            id={listId}
            role="listbox"
            aria-label={ariaLabel ?? label}
            className={`absolute inset-x-0 z-50 max-h-52 overflow-y-auto scrollbar-purple rounded-xl border border-border bg-surface p-1.5 shadow-[0_16px_32px_-12px_rgba(var(--shadow-navy),0.25)] dark:bg-canvas ${
              openUpward ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"
            }`}>
            {options.map((option, index) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 text-left font-bold outline-none transition-colors focus-visible:bg-surface-subtle ${
                    isCompact ? "py-1.5 text-[12px]" : "py-2.5 text-[14px]"
                  } ${
                    isSelected
                      ? "bg-purple/10 text-purple"
                      : "text-ink hover:bg-surface-subtle"
                  }`}>
                  <span className="truncate">{option.label}</span>
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

      {error && <p className="text-[13px] font-medium text-danger">{error}</p>}
    </div>
  );
}
