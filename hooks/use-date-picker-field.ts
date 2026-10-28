"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { formatDate, toDate, toIsoDate } from "@/lib/format";

export type UseDatePickerFieldOptions = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  min?: string;
  max?: string;
  align?: "start" | "end";
};

export function useDatePickerField({
  value,
  onChange,
  onBlur,
  disabled = false,
  min,
  max,
  align = "start",
}: UseDatePickerFieldOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const calendarId = `${fieldId}-calendar`;

  const selected = toDate(value);
  const minDate = toDate(min);
  const maxDate = toDate(max);

  useClickOutside(containerRef, () => {
    if (isOpen) {
      setIsOpen(false);
      onBlur?.();
    }
  });

  function open() {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  }

  function close() {
    if (!isOpen) return;
    setIsOpen(false);
    onBlur?.();
    buttonRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
  }

  function select(date: Date | undefined) {
    if (!date) return;
    onChange(toIsoDate(date));
    close();
  }

  function selectToday() {
    const today = new Date();
    const todayIso = toIsoDate(today);
    if (min && todayIso < min) return;
    if (max && todayIso > max) return;
    onChange(todayIso);
    close();
  }

  const todayIso = toIsoDate(new Date());
  const isTodayDisabled = Boolean(
    (min && todayIso < min) || (max && todayIso > max),
  );

  const display = selected ? formatDate(toIsoDate(selected)) : "Select date";
  const alignmentClass =
    align === "end" ? "right-0 left-auto" : "left-0 right-auto";

  const defaultMonth =
    selected ?? (minDate && minDate > new Date() ? minDate : new Date());

  return {
    fieldId,
    errorId,
    calendarId,
    containerRef,
    buttonRef,
    isOpen,
    open,
    close,
    handleKeyDown,
    selected,
    minDate,
    maxDate,
    defaultMonth,
    display,
    alignmentClass,
    select,
    selectToday,
    isTodayDisabled,
  };
}

