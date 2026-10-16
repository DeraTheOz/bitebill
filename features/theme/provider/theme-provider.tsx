"use client";

import { useEffect, type ReactNode } from "react";
import { applyTheme, useThemeStore } from "../store/theme-store";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    applyTheme(theme);

    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  return <>{children}</>;
}
