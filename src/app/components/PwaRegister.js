"use client";

import { useEffect } from "react";

/**
 * Registers the app shell service worker in production (or when NEXT_PUBLIC_ENABLE_PWA_DEV=1).
 * Dev server HMR is incompatible with aggressive SW caching; default skips development.
 */
export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const allowDev =
      process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_ENABLE_PWA_DEV === "1";
    if (process.env.NODE_ENV !== "production" && !allowDev) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((err) => console.warn("[PWA] Service worker registration failed:", err));
  }, []);

  return null;
}
