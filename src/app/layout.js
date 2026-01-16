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
import { NotificationProvider } from "./context/NotificationContext";

function LayoutContent({ children }) {
  const pathname = usePathname();
  const route = routeMap[pathname] || { title: "Dashboard" };
  const [pageTitle, setPageTitle] = useState(route.title);
  const { toast, hideToast } = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const route = routeMap[pathname] || { title: "Dashboard" };
    setPageTitle(route.title);
    document.title = route.title;
  }, [pathname]);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768); // Tailwind md breakpoint
    handleResize(); // initial check

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const hideLayout =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  return (
    <>
      <div className="md:hidden">
        {!hideLayout && isMobile && <Navbar />}
      </div>

      <div className="min-h-screen grid md:grid-cols-12">
        {!hideLayout && <Sidebar />}

        <section
          className={hideLayout ? "col-span-12" : "md:col-span-9 xl:col-span-10"}
        >
          <div className="hidden md:block">
            {!hideLayout && !isMobile && <Navbar />}
          </div>
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
          <NotificationProvider>
            <ToastProvider>
              <LayoutContent>{children}</LayoutContent>
            </ToastProvider>
          </NotificationProvider>
      </body>
    </html>
  );
}
