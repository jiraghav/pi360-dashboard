"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Link from "next/link";
import { routeMap } from "./config/routes";
import Toast from "./components/Toast";
import { ToastProvider, useToast } from "./hooks/ToastContext";

function LayoutContent({ children }) {
  const pathname = usePathname();
  const route = routeMap[pathname] || { title: "Dashboard" };
  const [pageTitle, setPageTitle] = useState(route.title);
  const { toast, hideToast } = useToast();

  useEffect(() => {
    const route = routeMap[pathname] || { title: "Dashboard" };
    setPageTitle(route.title);
    document.title = route.title;
  }, [pathname]);

  const hideLayout =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  return (
    <>
      {!hideLayout && (
        <div className="md:hidden flex items-center justify-between px-4 py-3 glass border-b border-stroke/70 sticky top-0 z-50">
          <button
            id="openNav"
            className="btn"
            onClick={() => {
              const sidebar = document.getElementById("sidebar");
              if (sidebar) sidebar.classList.toggle("hidden");
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div>
            <div className="text-xs font-semibold">Complete Injury Centers</div>
            <div className="text-[10px] text-gray-400">Powered by PI360</div>
          </div>
          <Link href="/referrals/new" className="btn btn-primary">
            New Referral
          </Link>
        </div>
      )}

      <div className="min-h-screen grid md:grid-cols-12">
        {!hideLayout && <Sidebar />}

        <section
          className={hideLayout ? "col-span-12" : "md:col-span-9 xl:col-span-10"}
        >
          {!hideLayout && <Navbar />}
          <main className="main">{children}</main>

          {/* ✅ Toast stays globally mounted */}
          {toast && (
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={hideToast}
            />
          )}
        </section>
      </div>
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>PI360</title>

        <link rel="icon" href="/favicon.ico" sizes="any" />

        {/* ✅ Keep Tailwind setup for global styling */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      bg: '#0b0f16',
                      card: '#0e1420',
                      stroke: '#1b2534',
                      ink: '#e6edf3',
                      mute: '#9aa8bd',
                      sky: { 500: '#38bdf8', 400:'#60c5fa' },
                      mint: { 500: '#34d399' },
                      grape: { 500: '#a78bfa' },
                      amber: { 500: '#f59e0b' },
                      rose: { 500: '#f87171' },
                    }
                  }
                }
              }
            `,
          }}
        />
      </head>

      <body className="bg-bg text-ink">
        <ToastProvider>
          <LayoutContent>{children}</LayoutContent>
        </ToastProvider>
      </body>
    </html>
  );
}
