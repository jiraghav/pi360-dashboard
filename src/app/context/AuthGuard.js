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

    // ❌ No token & trying to access protected page
    if (!token && !isAuthPage) {
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

  if (checking) return null; // or loader

  return children;
}
