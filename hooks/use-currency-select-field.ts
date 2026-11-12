"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { CURRENCIES, type Currency } from "@/lib/currencies";

export type CurrencyOption =
  | Currency
  | {
      code: string;
      name?: string;
      symbol: string;
    };

export type UseCurrencySelectFieldOptions = {
  id?: string;
  name?: string;
  currencies?: readonly CurrencyOption[];
  value?: string;
  onChange?: (code: string) => void;
  disabled?: boolean;
};

/** Manages searchable currency selector dropdown state and filtering by code, symbol, or name. */
export function useCurrencySelectField({
  id,
  name,
  currencies = CURRENCIES,
  value,
  onChange,
  disabled = false,
}: UseCurrencySelectFieldOptions) {
  const generatedId = useId();
  const inputId = id ?? name ?? generatedId;
  const listId = `${inputId}-listbox`;

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  useClickOutside(containerRef, () => {
    setIsOpen(false);
    setQuery("");
  });

  const current = String(value ?? "");
  const selected =
    currencies.find((c) => c.code === current) ?? currencies[0];

  const filteredCurrencies = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return currencies;
    return currencies.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        Boolean(c.name?.toLowerCase().includes(q)),
    );
  }, [currencies, query]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      } else {
        setQuery("");
      }
      return next;
    });
  };

  const handleSelect = (code: string) => {
    onChange?.(code);
    setIsOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
    }
  };

  return {
    inputId,
    listId,
    containerRef,
    searchInputRef,
    isOpen,
    setIsOpen,
    query,
    setQuery,
    selected,
    filteredCurrencies,
    handleToggle,
    handleSelect,
    handleKeyDown,
  };
}

