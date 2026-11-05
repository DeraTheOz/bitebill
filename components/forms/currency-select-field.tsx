"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { CURRENCIES } from "@/lib/currencies";
import {
  useCurrencySelectField,
  type CurrencyOption,
} from "@/hooks/use-currency-select-field";

export type { CurrencyOption };

export type CurrencySelectFieldProps = {
  label: string;
  id?: string;
  name?: string;
  currencies?: readonly CurrencyOption[];
  value?: string;
  onChange?: (code: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
};

export function CurrencySelectField({
  label,
  id,
  name,
  currencies = CURRENCIES,
  value,
  onChange,
  error,
  disabled = false,
  className = "",
}: CurrencySelectFieldProps) {
  const {
    inputId,
    listId,
    containerRef,
    searchInputRef,
    isOpen,
    query,
    setQuery,
    selected,
    filteredCurrencies,
    handleToggle,
    handleSelect,
    handleKeyDown,
  } = useCurrencySelectField({
    id,
    name,
    currencies,
    value,
    onChange,
    disabled,
  });

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className="relative flex flex-col gap-2">
      <label htmlFor={inputId} className="text-[13px] font-medium text-muted">
        {label}
      </label>

      {name && <input type="hidden" name={name} value={value} />}

      <div className="relative">
        <button
          id={inputId}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listId}
          disabled={disabled}
          onClick={handleToggle}
          className={`flex h-12 w-full items-center justify-between gap-3 rounded border bg-surface px-4 text-left transition-colors focus:border-purple disabled:cursor-not-allowed disabled:opacity-60 ${
            error ? "border-danger" : "border-border"
          } ${className}`}>
          <div className="flex min-w-0 items-center gap-2 truncate">
            <span className="truncate text-[15px] font-bold text-ink">
              {selected.code}
            </span>
            <span className="shrink-0 text-[13px] font-medium text-muted-light">
              ({selected.symbol})
            </span>
            {selected.name && (
              <span className="hidden truncate text-[13px] font-medium text-muted sm:inline">
                • {selected.name}
              </span>
            )}
          </div>
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
            aria-label={label}
            className="absolute inset-x-0 top-[calc(100%+8px)] z-40 rounded-lg border border-border bg-surface p-2 shadow-[0_16px_32px_-12px_rgba(var(--shadow-navy),0.25)] dark:bg-canvas">
            <div className="relative mb-2">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-light"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search currency code, name or symbol…"
                className="h-10 w-full rounded border border-border bg-surface pl-9 pr-3 text-[14px] font-medium text-ink caret-purple outline-none placeholder:text-muted-light focus:border-purple dark:bg-surface-subtle"
              />
            </div>

            <ul className="max-h-56 overflow-y-auto scrollbar-purple">
              {filteredCurrencies.length === 0 ? (
                <li className="px-3 py-3 text-center text-[13px] font-medium text-muted-light">
                  No currencies found
                </li>
              ) : (
                filteredCurrencies.map((c) => {
                  const isSelected = c.code === selected.code;

                  return (
                    <li key={c.code}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(c.code)}
                        className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded px-3 py-2 text-left text-[14px] font-bold text-ink transition-colors hover:bg-canvas dark:hover:bg-surface-subtle ${
                          isSelected ? "bg-canvas/80 dark:bg-surface-subtle" : ""
                        }`}>
                        <div className="flex min-w-0 items-center gap-2 truncate">
                          <span className="font-mono text-purple">{c.code}</span>
                          <span className="text-muted-light">({c.symbol})</span>
                          {c.name && (
                            <span className="truncate text-[13px] font-normal text-muted">
                              {c.name}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <Check
                            className="size-4 shrink-0 text-purple"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="text-[13px] font-medium text-danger">{error}</p>}
    </div>
  );
}
