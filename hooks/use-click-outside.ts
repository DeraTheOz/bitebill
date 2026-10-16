"use client";

import { useEffect, useRef, type RefObject } from "react";

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutsideClick: () => void,
) {
  const onOutsideClickRef = useRef(onOutsideClick);

  useEffect(() => {
    onOutsideClickRef.current = onOutsideClick;
  });

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      const element = ref.current;

      if (
        target instanceof Element &&
        target.closest("[data-click-outside-ignore]")
      ) {
        return;
      }

      if (element && !element.contains(target as Node)) {
        onOutsideClickRef.current();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [ref]);
}
