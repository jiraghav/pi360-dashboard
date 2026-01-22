"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import useFetchOptions from "../hooks/useFetchOptions";

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
  
  const { isAffiliate } = useFetchOptions({ fetchRoles: true });

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
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 grid place-items-center">
          <img
            src="/logo.png"
            alt="CIC Logo"
            className="w-full h-full object-contain"
          />
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
      
      {!isAffiliate && (
        <>
          <div className="mt-6 p-3 rounded-lg bg-white/5 border border-stroke/60 text-sm">
            <p className="text-xs text-mute mb-1 tracking-wide">
              All CIC Payments Remit to Address:
            </p>
          
            <div className="flex items-start gap-2">
              <span className="text-mint-400 mt-0.5">📍</span>
              <p className="text-ink leading-snug">
                1930 East Rosemeade Pkwy #104,<br />
                Carrollton, TX 75007
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 rounded-lg bg-red-500/5 border border-red-500/30 text-sm">
            <div className="flex items-start gap-2">
              {/* LOP Logo / Icon */}
              <span className="font-bold text-sm badge bg-red-500">
                LOP
              </span>
    
              <div className="leading-snug">
                <p className="text-ink">
                  All LOPs go to <span className="font-medium">Complete Injury Centers</span>
                </p>
    
                <p className="text-mute mt-1">
                  Send to{" "}
                  <a
                    href="mailto:records@cic.clinic"
                    className="text-ink font-medium underline"
                  >
                    records@cic.clinic
                  </a>
                  {" "}
                  or uploaded to the patient profile on this dashboard.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-stroke/60 text-[11px] text-mute leading-snug">
        © {new Date().getFullYear()} PI360 · Complete Injury Centers
      </div>
    </aside>
  );
}
