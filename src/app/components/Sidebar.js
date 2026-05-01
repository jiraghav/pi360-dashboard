"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import useFetchOptions from "../hooks/useFetchOptions";
import GlobalCaseTeamModal from "./GlobalCaseTeamModal";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isCaseTeamOpen, setIsCaseTeamOpen] = useState(false);

  const navLinks = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Cases", path: "/cases" },
    { label: "Tasks", path: "/tasks" },
    { label: "Maps", path: "/maps" },
    { label: "Analytics", path: "/analytics" },
    { label: "Change Password", path: "/change-password" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const { isAffiliate, isAffiliateLoading } = useFetchOptions({ fetchRoles: true });
  const { name } = useFetchOptions({ fetchName: true });

  // Hide sidebar + move page to top whenever route changes
  useEffect(() => {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.add("hidden");
      sidebar.classList.remove("flex");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  const hour = new Date().getHours();
  let greeting = "Good Evening";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";

  return (
    <>
      <aside
        id="sidebar"
        className="hidden flex-col fixed inset-0 z-50 w-full overflow-hidden pt-[max(1rem,env(safe-area-inset-top,0px))] pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] glass border-r border-stroke/70 md:sticky md:top-0 md:z-10 md:col-span-3 md:flex md:flex-col md:w-auto xl:col-span-2 md:p-4"
      >
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 pb-6"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 grid place-items-center">
              <img
                src="/logo.png"
                alt="CIC Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="text-center mb-6 min-h-[24px]">
            {name ? (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur">
                <span className="text-xs text-white/70">{greeting},</span>
                <span className="text-sm font-semibold text-white truncate max-w-[140px]">
                  {name}
                </span>
              </div>
            ) : (
              <div className="mx-auto h-6 w-44 rounded-full bg-white/15 animate-pulse" />
            )}
          </div>

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

          <div className="pt-6">
            <button
              onClick={handleLogout}
              className="btn w-full text-left bg-none border-none text-ink/90 hover:text-ink font-semibold"
            >
              Logout
            </button>
          </div>

          {!isAffiliateLoading && !isAffiliate && (
            <>
              <div className="mt-6 p-3 rounded-lg bg-white/5 border border-stroke/60 text-sm">
                <p className="text-xs text-mute mb-1 tracking-wide">
                  All CIC Payments Remit to Address:
                </p>

                <div className="flex items-start gap-2">
                  <span className="text-mint-400 mt-0.5">📍</span>
                  <p className="text-ink leading-snug">
                    1930 East Rosemeade Pkwy #104,
                    <br />
                    Carrollton, TX 75007
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-red-500/5 border border-red-500/30 text-sm">
                <div className="flex items-start gap-2">
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
                      </a>{" "}
                      or uploaded to the patient profile on this dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {!isAffiliateLoading && !isAffiliate && (
            <div className="mt-6 bg-gray-900 border border-gray-700 rounded-xl p-4">
              <p className="text-[12px] text-gray-300 mb-3">
                Global Case Team Contacts / General case updates go here unless a Patient Case Team is assigned.
              </p>

              <button
                onClick={() => setIsCaseTeamOpen(true)}
                className="inline-flex items-center bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-1.5 px-3 rounded-md transition-colors duration-200"
              >
                Update Global Case Team Contacts
              </button>
            </div>
          )}
        </div>

        <div className="shrink-0 pt-4 border-t border-stroke/60 text-[11px] text-mute leading-snug">
          © {new Date().getFullYear()} PI360 · Complete Injury Centers
        </div>
      </aside>

      <GlobalCaseTeamModal
        isOpen={isCaseTeamOpen}
        onClose={() => setIsCaseTeamOpen(false)}
      />
    </>
  );
}
