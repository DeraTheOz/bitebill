"use client";

import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { ThemeToggle } from "@/features/theme/components/theme-toggle";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";
import { SignOutButton } from "./sign-out-button";

export function AppSidebar({
  user,
}: {
  user: { name: string; email: string; image?: string | null };
}) {
  return (
    <aside className="fixed inset-x-0 top-0 z-50 flex h-18 items-center justify-between bg-sidebar md:h-20 lg:inset-y-0 lg:left-0 lg:right-auto lg:h-screen lg:w-64 lg:flex-col lg:items-stretch">
      <Link
        href="/dashboard"
        aria-label="BiteBill"
        className="flex shrink-0 items-center lg:mx-3 lg:mt-8 lg:gap-3 lg:rounded-lg lg:px-4 lg:focus-visible:outline-2 lg:focus-visible:outline-offset-2 lg:focus-visible:outline-purple">
        <div className="relative flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-br-[20px] bg-purple md:h-20 md:w-20 lg:size-12 lg:rounded-br-2xl">
          <div className="absolute bottom-0 left-0 h-1/2 w-full rounded-br-[20px] bg-purple-light mask-[url('/assets/logo-bg.svg')] mask-repeat:no-repeat mask-size-[100%_100%] lg:rounded-br-2xl" />
          <Image
            src="/assets/logo-white.svg"
            width={32}
            height={32}
            alt=""
            className="relative lg:size-6"
          />
        </div>

        <span className="hidden text-xl font-bold tracking-wider text-white lg:block">
          BiteBill
        </span>
      </Link>

      <div className="hidden lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:px-3 lg:py-8">
        <NavLinks />
      </div>

      <div className="flex h-full items-center lg:hidden">
        <ThemeToggle className="grid h-18 w-18 border-r border-sidebar-border md:h-20 md:w-20" />

        <MobileMenu />

        <div className="grid h-18 w-18 place-items-center border-l border-sidebar-border md:h-20 md:w-20">
          <Avatar name={user.name} image={user.image} alt="Your profile" />
        </div>
      </div>

      <div className="hidden lg:flex lg:w-full lg:items-center lg:gap-1 lg:border-t lg:border-sidebar-border lg:p-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 px-1">
          <Avatar name={user.name} image={user.image} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{user.name}</p>
            <p className="truncate text-xs font-medium text-muted-light">
              {user.email}
            </p>
          </div>
        </div>
        <ThemeToggle className="grid size-9 shrink-0 place-items-center rounded-lg hover:bg-sidebar-border/60" />
        <SignOutButton compact className="shrink-0" />
      </div>
    </aside>
  );
}
