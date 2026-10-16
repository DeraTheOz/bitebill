"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { NavLinks } from "./nav-links";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  function close() {
    setIsOpen(false);
  }

  useClickOutside(panelRef, close);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        aria-controls="mobile-nav"
        className="grid h-18 w-18 place-items-center text-muted transition-colors hover:text-border dark:text-[#858bb2] dark:hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple md:h-20 md:w-20 lg:hidden">
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/50 lg:hidden">
            <motion.div
              ref={panelRef}
              id="mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 flex w-96 max-w-[80%] flex-col bg-sidebar shadow-2xl">
              <div className="flex h-18 items-center justify-between border-b border-sidebar-border md:h-20">
                <div className="relative flex h-18 w-18 items-center justify-center overflow-hidden rounded-br-[20px] bg-purple md:h-20 md:w-20">
                  <div className="absolute bottom-0 left-0 h-1/2 w-full rounded-br-[20px] bg-purple-light [mask-image:url('/invoices/logo-bg.svg')] mask-repeat:no-repeat mask-size-[100%_100%]" />
                  <Link
                    href="/dashboard"
                    aria-label="bitebill logo"
                    onClick={close}>
                    <Image
                      src="/invoices/logo-white.svg"
                      width={32}
                      height={32}
                      alt="BiteBill"
                      className="relative"
                    />
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={close}
                  aria-label="Close navigation menu"
                  className="mr-2 grid size-10 place-items-center rounded-lg text-muted transition-colors hover:text-border dark:text-[#858bb2] dark:hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple">
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-6">
                <NavLinks onNavigate={close} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
