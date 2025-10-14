// components/GuestRoute.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../utils/auth";

export default function GuestRoute({ children }) {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard"); // redirect if already logged in
    }
  }, [router]);

  return !isAuthenticated() ? children : null;
}
