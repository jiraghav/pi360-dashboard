"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "../utils/api";

export default function MagicLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return; // 🚀 prevent double call
    hasRun.current = true;

    const token = searchParams.get("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const verify = async () => {
      try {
        const data = await apiRequest("verify-magic-link.php", {
          method: "POST",
          body: { token },
        });

        localStorage.setItem("token", data.token);

        const redirect = localStorage.getItem("postLoginRedirect");

        if (redirect) {
          localStorage.removeItem("postLoginRedirect");
          router.replace(redirect);
        } else {
          router.replace("/dashboard");
        }
      } catch (err) {
        console.error(err);
        router.replace("/login");
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-300">
      Logging you in...
    </div>
  );
}