import Link from "next/link";
import { ThemeToggle } from "@/features/theme/components/theme-toggle";
import type { LandingUser } from "../lib/types";
import { navLinks } from "@/features/landing/data/navigation";
import { BrandLockup } from "./brand-lockup";

export function LandingHeader({ user }: { user: LandingUser | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-18">
        <BrandLockup />

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-sm text-[15px] font-bold text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle className="grid size-10 place-items-center" />
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center rounded-full bg-button-purple px-5 text-[15px] font-bold text-white transition-colors hover:bg-button-purple-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple">
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="hidden rounded-full px-4 py-2.5 text-[15px] font-bold text-ink transition-colors hover:text-purple focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple sm:block">
                Sign in
              </Link>
              <Link
                href="/auth/sign-up"
                className="inline-flex h-10 items-center rounded-full bg-button-purple px-5 text-[15px] font-bold text-white transition-colors hover:bg-button-purple-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
