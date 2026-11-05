"use client";

import {
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import { useClickOutside } from "@/hooks/use-click-outside";

const emptySubscribe = () => () => {};

export type ColorOption = {
  value: string;
  name: string;
};

export type UseColorSelectFieldOptions = {
  id?: string;
  name?: string;
  colors: readonly ColorOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
};

export function useColorSelectField({
  id,
  name,
  colors,
  value,
  onChange,
  disabled = false,
}: UseColorSelectFieldOptions) {
  const generatedId = useId();
  const inputId = id ?? name ?? generatedId;
  const listId = `${inputId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const hasEyeDropper = useSyncExternalStore(
    emptySubscribe,
    () => typeof window !== "undefined" && "EyeDropper" in window,
    () => false,
  );

  useClickOutside(containerRef, () => setIsOpen(false));

  const current = useMemo(() => {
    const raw = String(value ?? "").trim();
    if (/^#?[0-9a-fA-F]{6}$/.test(raw)) {
      return raw.startsWith("#") ? raw.toLowerCase() : `#${raw.toLowerCase()}`;
    }
    return colors[0]?.value.toLowerCase() ?? "#7c5dfa";
  }, [value, colors]);

  const matchingPreset = useMemo(() => {
    return colors.find((c) => c.value.toLowerCase() === current.toLowerCase());
  }, [colors, current]);

  const handleColorChange = (newHex: string) => {
    const normalized = newHex.startsWith("#") ? newHex : `#${newHex}`;
    onChange?.(normalized.toLowerCase());
  };

  const handleEyeDropper = async () => {
    if (typeof window === "undefined" || !("EyeDropper" in window)) return;
    try {
      // @ts-expect-error EyeDropper API is standard in modern Chromium browsers
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      if (result?.sRGBHex) {
        handleColorChange(result.sRGBHex);
      }
    } catch {
      // User cancelled eyedropper
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return {
    inputId,
    listId,
    containerRef,
    isOpen,
    setIsOpen,
    hasEyeDropper,
    current,
    matchingPreset,
    handleColorChange,
    handleEyeDropper,
    handleKeyDown,
  };
}

