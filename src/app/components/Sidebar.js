"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Cases", path: "/cases" },
    { label: "Tasks", path: "/tasks" },
    { label: "Maps", path: "/maps" },
    { label: "Analytics", path: "/analytics" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // 👉 Hide sidebar + move page to top whenever route changes
  useEffect(() => {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.add("hidden");
    }

    // Scroll page smoothly to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <aside
      id="sidebar"
      className="hidden md:block md:col-span-3 xl:col-span-2 h-screen sticky top-0 p-4 glass border-r border-stroke/70 z-10"
    >
      {/* Branding */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-sky-500 grid place-items-center font-black">
          PI
        </div>
        <div>
          <div className="font-semibold leading-tight">
            Complete Injury Centers
          </div>
          <div className="text-xs text-mute -mt-0.5">Powered by PI360</div>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="space-y-2 flex flex-col">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            className={`navlink ${pathname === link.path ? "active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="mt-auto pt-6">
        <button
          onClick={handleLogout}
          className="btn w-full text-left bg-none border-none text-ink/90 hover:text-ink font-semibold"
        >
          Logout
        </button>
      </div>

      {/* Footer */}
      <div className="mt-6 text-xs text-mute">© PI360</div>
    </aside>
  );
}
