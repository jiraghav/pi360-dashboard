// components/ProtectedRoute.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login"); // redirect if not logged in
    }
  }, [router]);

  return isAuthenticated() ? children : null; // render children only if logged in
}
