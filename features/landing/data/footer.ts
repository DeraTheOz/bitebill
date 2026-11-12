import { navLinks, type NavLink } from "./navigation";

/** Product navigation links rendered in the marketing footer. */
export const productLinks: NavLink[] = navLinks;

/** Account authentication links displayed to signed-out visitors in the footer. */
export const guestAccountLinks: NavLink[] = [
  { href: "/auth/sign-in", label: "Sign in" },
  { href: "/auth/sign-up", label: "Create account" },
];
