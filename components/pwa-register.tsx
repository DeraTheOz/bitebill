"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const isProduction = process.env.NODE_ENV === "production";
    const enableInDev = process.env.NEXT_PUBLIC_ENABLE_PWA === "true";

    if (!isProduction && !enableInDev) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                console.log("New BiteBill version available. Reload to update.");
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error("PWA Service Worker registration failed:", error);
      });
  }, []);

  return null;
}
