"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { COUNTRIES, type Country } from "@/lib/countries";

export type UseCountrySelectFieldOptions = {
  id?: string;
  name?: string;
  value?: string;
  onChange?: (countryName: string) => void;
  disabled?: boolean;
};

/** Manages searchable country combobox state, filtering, focus, and keyboard dismissal. */
export function useCountrySelectField({
  id,
  name,
  value = "",
  onChange,
  disabled = false,
}: UseCountrySelectFieldOptions) {
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

  const selectedCountry = useMemo(() => {
    if (!value) return null;
    const normalized = value.trim().toLowerCase();
    return (
      COUNTRIES.find(
        (c) =>
          c.name.toLowerCase() === normalized ||
          c.code.toLowerCase() === normalized,
      ) ?? { code: "", name: value }
    );
  }, [value]);

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

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

  const handleSelect = (country: Country) => {
    onChange?.(country.name);
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
    selectedCountry,
    filteredCountries,
    handleToggle,
    handleSelect,
    handleKeyDown,
  };
}

