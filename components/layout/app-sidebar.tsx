"use client";

import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/features/theme/components/theme-toggle";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";

export function AppSidebar() {
  return (
    <aside className="fixed inset-x-0 top-0 z-50 flex h-18 items-center justify-between bg-sidebar md:h-20 lg:inset-y-0 lg:left-0 lg:right-auto lg:h-screen lg:w-64 lg:flex-col lg:items-stretch">
      <Link
        href="/dashboard"
        aria-label="BiteBill"
        className="flex shrink-0 items-center">
        <div className="relative flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-br-[20px] bg-purple md:h-20 md:w-20 lg:h-18 lg:w-18">
          <div className="absolute bottom-0 left-0 h-1/2 w-full rounded-br-[20px] bg-purple-light mask-[url('/assets/logo-bg.svg')] mask-repeat:no-repeat mask-size-[100%_100%]" />
          <Image
            src="/assets/logo-white.svg"
            width={32}
            height={32}
            alt=""
            className="relative"
          />
        </div>

        <span className="hidden pl-4 text-xl font-bold tracking-wider text-white lg:block">
          BiteBill
        </span>
      </Link>

      <div className="hidden lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:px-3 lg:py-8">
        <NavLinks />
      </div>

      <div className="flex h-full items-center lg:h-auto lg:w-full lg:justify-around lg:border-t lg:border-sidebar-border">
        <ThemeToggle className="grid h-18 w-18 border-r border-sidebar-border md:h-20 md:w-20 lg:order-2 lg:h-22 lg:w-1/2 lg:border-r-0" />

        <MobileMenu />

        <div className="grid h-18 w-18 place-items-center border-l border-sidebar-border md:h-20 md:w-20 lg:order-1 lg:h-22 lg:w-1/2 lg:border-l-0 lg:border-r lg:border-sidebar-border">
          <Image
            src="/assets/avatar.png"
            width={40}
            height={40}
            className="rounded-full"
            alt="Your profile"
            priority
          />
        </div>
      </div>
    </aside>
  );
}
