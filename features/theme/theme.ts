export const THEME_STORAGE_KEY = "bitebill-theme";

export type Theme = "light" | "dark" | "system";

export const themeInitScript = `(function(){try{var t="system";try{var raw=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(raw){var parsed=JSON.parse(raw);var stored=parsed&&parsed.state&&parsed.state.theme;if(stored==="light"||stored==="dark"||stored==="system")t=stored;}}catch(e){}var isDark=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var root=document.documentElement;root.classList.toggle("dark",isDark);root.style.colorScheme=isDark?"dark":"light";}catch(e){}})();`;
