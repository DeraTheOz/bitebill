import { create } from "zustand";
import { persist } from "zustand/middleware";
import { THEME_STORAGE_KEY, type Theme } from "../theme";

type ResolvedTheme = "light" | "dark";

type ThemeStore = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

/** Returns `true` when the browser prefers a dark color scheme. */
function prefersDark() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

/** Resolves `"system"` theme preferences into `"light"` or `"dark"`. */
export function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? (prefersDark() ? "dark" : "light") : theme;
}

/** Synchronizes the document root class and `color-scheme` CSS property with `theme`. */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const resolved = resolveTheme(theme);
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

/** Persisted Zustand store holding the user's light/dark/system theme preference. */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set({ theme: resolveTheme(get().theme) === "dark" ? "light" : "dark" }),
    }),
    {
      name: THEME_STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    },
  ),
);
