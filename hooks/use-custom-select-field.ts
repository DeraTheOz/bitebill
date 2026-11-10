"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";

export type CustomSelectOption = {
  value: string;
  label: string;
};

export type UseCustomSelectFieldOptions = {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly CustomSelectOption[];
  disabled?: boolean;
  placement?: "auto" | "bottom" | "top";
};

export function useCustomSelectField({
  id,
  name,
  value,
  onChange,
  options,
  disabled = false,
  placement = "auto",
}: UseCustomSelectFieldOptions) {
  const generatedId = useId();
  const inputId = id ?? name ?? generatedId;
  const listId = `${inputId}-listbox`;

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(placement === "top");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useClickOutside(containerRef, () => setIsOpen(false));

  const selected = options.find((opt) => opt.value === value) ?? null;

  function resolveDirection() {
    if (placement === "top") return true;
    if (placement === "bottom") return false;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return false;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    return spaceBelow < 220 && spaceAbove > spaceBelow;
  }

  function openMenu() {
    setOpenUpward(resolveDirection());
    const selectedIdx = options.findIndex((opt) => opt.value === value);
    const startIdx = selectedIdx >= 0 ? selectedIdx : 0;
    setHighlightedIndex(startIdx);
    setIsOpen(true);
    window.requestAnimationFrame(() => {
      optionRefs.current[startIdx]?.focus();
    });
  }

  function closeMenu(returnFocus = true) {
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (returnFocus) {
      triggerRef.current?.focus();
    }
  }

  function handleToggle() {
    if (disabled) return;
    if (isOpen) {
      closeMenu(false);
    } else {
      openMenu();
    }
  }

  function handleSelect(optionValue: string) {
    onChange(optionValue);
    closeMenu(true);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;

    if (e.key === "Escape" && isOpen) {
      e.preventDefault();
      e.stopPropagation();
      closeMenu(true);
      return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        openMenu();
        return;
      }

      if (options.length === 0) return;
      const delta = e.key === "ArrowDown" ? 1 : -1;
      const baseIndex =
        highlightedIndex >= 0
          ? highlightedIndex
          : Math.max(
              0,
              options.findIndex((opt) => opt.value === value),
            );
      const nextIndex = (baseIndex + delta + options.length) % options.length;
      setHighlightedIndex(nextIndex);
      optionRefs.current[nextIndex]?.focus();
    }
  }

  return {
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
  };
}
