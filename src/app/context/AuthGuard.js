"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const AUTH_PAGES = ["/login", "/register"];

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAuthPage = AUTH_PAGES.includes(pathname);

    // 🔹 Special handling for magic login
    if (pathname === "/magic-login") {
      const urlParams = new URLSearchParams(window.location.search);
      const magicToken = urlParams.get("token");

      // ❌ No magic token → redirect to login
      if (!magicToken) {
        router.replace("/login");
        return;
      }

      // ✅ Allow access (magic login page will handle auth)
      setChecking(false);
      return;
    }

    // ❌ No token & trying to access protected page
    if (!token && !isAuthPage) {
      const searchParams = window.location.search;

      localStorage.setItem(
        "postLoginRedirect",
        pathname + searchParams
      );

      router.replace("/login");
      return;
    }

    // ❌ Token exists & trying to access login/register
    if (token && isAuthPage) {
      router.replace("/dashboard");
      return;
    }

    setChecking(false);
  }, [pathname]);

  if (checking) return null;

  return children;
}