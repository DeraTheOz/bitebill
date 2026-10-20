import Link from "next/link";
import {
  guestAccountLinks,
  productLinks,
} from "@/features/landing/data/footer";
import type { LandingUser } from "../lib/types";
import { BrandLockup } from "./brand-lockup";

export function LandingFooter({ user }: { user: LandingUser | null }) {
  const footerLinks = [
    { title: "Product", links: productLinks },
    user
      ? {
          title: "Account",
          links: [{ href: "/dashboard", label: "Dashboard" }],
        }
      : { title: "Get started", links: guestAccountLinks },
  ];

  return (
    <footer className="border-t border-border bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div className="flex max-w-sm flex-col items-start gap-4">
            <BrandLockup />
            <p className="text-[15px] leading-relaxed text-muted">
              Professional invoicing for freelancers, consultants, agencies, and
              small businesses.
            </p>
          </div>

          {footerLinks.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-[15px] font-bold text-ink">{column.title}</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded-sm text-[15px] font-medium text-muted transition-colors hover:text-purple focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 text-[13px] font-medium text-muted-light">
          <p>&copy; {new Date().getFullYear()} BiteBill. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
