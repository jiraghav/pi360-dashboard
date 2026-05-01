"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { routeMap } from "./config/routes";
import Toast from "./components/Toast";
import { ToastProvider, useToast } from "./hooks/ToastContext";
import { NotificationProvider } from "./context/NotificationContext";
import AuthGuard from "./context/AuthGuard";
import PwaRegister from "./components/PwaRegister";

function LayoutContent({ children }) {
  const pathname = usePathname();
  const isOnboardingPath =
    pathname === "/onboarding" || pathname.startsWith("/onboarding/");
  const { toast, hideToast } = useToast(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const route =
      routeMap[pathname] ||
      (isOnboardingPath ? { title: "Clinic Onboarding" } : { title: "Dashboard" });
    document.title = route.title;
  }, [pathname, isOnboardingPath]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const hideLayout =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/magic-login" ||
    isOnboardingPath;

  return (
    <>
      <PwaRegister />
      <div className="md:hidden">
        {!hideLayout && isMobile && <Navbar />}
      </div>

      <div className="min-h-dvh min-h-screen grid md:grid-cols-12 app-shell-grid">
        {!hideLayout && <Sidebar />}

        <section
          className={
            hideLayout
              ? "col-span-12 min-h-dvh min-h-screen flex flex-col"
              : "md:col-span-9 xl:col-span-10 min-h-dvh min-h-screen flex flex-col"
          }
        >
          <div className="hidden md:block">
            {!hideLayout && !isMobile && <Navbar />}
          </div>
          <main className="main flex-1 min-h-0">{children}</main>

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

export default function AppShell({ children }) {
  return (
    <AuthGuard>
      <NotificationProvider>
        <ToastProvider>
          <LayoutContent>{children}</LayoutContent>
        </ToastProvider>
      </NotificationProvider>
    </AuthGuard>
  );
}
