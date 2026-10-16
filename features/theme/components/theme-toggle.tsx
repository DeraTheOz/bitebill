"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../store/theme-store";

export function ThemeToggle({ className }: { className?: string }) {
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      data-click-outside-ignore
      aria-label="Toggle color theme"
      className={`place-items-center text-muted transition-colors hover:text-border dark:text-[#858bb2] dark:hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple ${className ?? "grid"}`}>
      <Moon className="size-5 dark:hidden" aria-hidden="true" />
      <Sun className="hidden size-5 dark:block" aria-hidden="true" />
    </button>
  );
}
