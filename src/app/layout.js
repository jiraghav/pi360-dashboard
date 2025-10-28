"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Link from "next/link";
import { routeMap } from "./config/routes";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const route = routeMap[pathname] || { title: "Dashboard" };
  const [pageTitle, setPageTitle] = useState(route.title);

  useEffect(() => {
    const route = routeMap[pathname] || { title: "Dashboard" };
    setPageTitle(`${route.title}`);
    document.title = `${route.title}`;
  }, [pathname]);

  const hideLayout =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  return (
    <html lang="en">
      <head>
        <title>{pageTitle}</title>

        {/* Tailwind via CDN */}
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
        {/* Mobile top bar */}
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
            <div className="text-sm font-semibold">Complete Injury Centers — PI360</div>
            <Link href="/referrals/new" className="btn btn-primary">New Referral</Link>
          </div>
        )}

        <div className="min-h-screen grid md:grid-cols-12">
          {!hideLayout && <Sidebar />}

          <section
            className={
              hideLayout ? "col-span-12" : "md:col-span-9 xl:col-span-10"
            }
          >
            {!hideLayout && <Navbar />}

            <main className="main">{children}</main>
          </section>
        </div>
      </body>
    </html>
  );
}
