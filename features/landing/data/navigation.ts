export type NavLink = {
  href: string;
  label: string;
};

/** Anchor navigation links shown in the marketing page top bar. */
export const navLinks: NavLink[] = [
  { href: "#features", label: "Features" },
  { href: "#pdf", label: "PDF export" },
  { href: "#analytics", label: "Analytics" },
  { href: "#how-it-works", label: "How it works" },
];
