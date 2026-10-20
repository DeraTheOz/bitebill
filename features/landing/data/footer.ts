import { navLinks, type NavLink } from "./navigation";

export const productLinks: NavLink[] = navLinks;

export const guestAccountLinks: NavLink[] = [
  { href: "/auth/sign-in", label: "Sign in" },
  { href: "/auth/sign-up", label: "Create account" },
];
