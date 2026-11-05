"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";

export type ChartDropdownOption = {
  value: string;
  label: string;
  shortLabel?: string;
};

export type UseChartDropdownOptions = {
  value: string;
  onChange: (value: string) => void;
  options: readonly ChartDropdownOption[];
};

export function useChartDropdown({
  value,
  onChange,
  options,
}: UseChartDropdownOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useClickOutside(containerRef, () => setIsOpen(false));

  const selected = options.find((opt) => opt.value === value) ?? options[0];

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return {
    listId,
    containerRef,
    isOpen,
    setIsOpen,
    selected,
    handleKeyDown,
    handleToggle,
    handleSelect,
  };
}

