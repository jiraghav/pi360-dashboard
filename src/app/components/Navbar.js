"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routeMap } from "../config/routes";

export default function Navbar() {
  const pathname = usePathname();
  const page = routeMap[pathname] || { title: "PI360", sub: "" };

  return (
    <header className="hidden md:block sticky top-0 z-40 glass border-b border-stroke/70">
      <div className="px-6 py-4 flex items-center justify-between">

        {/* Page title + subtitle */}
        <div>
          <div className="text-xs uppercase tracking-wide text-mute">Section</div>
          <h1 className="text-xl font-bold">{page.title}</h1>
        </div>

        {/* Actions + phone text */}
        <div className="flex items-center gap-4">
          
          {/* BOTH: Static text + Clickable SMS link */}
          <div className="text-sm text-gray-400 whitespace-nowrap flex items-center gap-2">
            <span>
              Text <span className="font-semibold text-white">
                <a
                  href="sms:2146666651"
                  className="underline text-white hover:text-primary transition"
                >
                214-666-6651
                </a>
              </span> 24/7 for instant help
            </span>
            
          </div>

          <Link href="/referrals/new" className="btn btn-primary">
            New Referral
          </Link>

          <Link href="/tasks" className="btn">
            Create Task
          </Link>
        </div>

      </div>
    </header>
  );
}
