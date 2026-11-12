import { useRef, useState } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";

/** Manages open/close state and outside-click dismissal for the recurring filter popover. */
export function useRecurringFilter() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false));

  function toggleOpen() {
    setIsOpen((value) => !value);
  }

  return {
    isOpen,
    containerRef,
    toggleOpen,
  };
}

