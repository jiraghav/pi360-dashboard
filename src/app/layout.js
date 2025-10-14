"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import PageTitleUpdater from "./components/PageTitleUpdater";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // hide navbar and sidebar on login route (and others if needed)
  const hideLayout =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  return (
    <html lang="en">
      <body>
        <PageTitleUpdater />
        {!hideLayout && <Navbar />}

        <div className={hideLayout ? "layout-auth" : "layout"}>
          {!hideLayout && <Sidebar />}
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
