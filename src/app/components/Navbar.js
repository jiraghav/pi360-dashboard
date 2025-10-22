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
        {/* Page title and subtitle */}
        <div>
          <div className="text-xs uppercase tracking-wide text-mute">Section</div>
          <h1 className="text-xl font-bold">{page.title}</h1>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Link href="#" className="btn btn-primary">New Referral</Link>
          <Link href="#" className="btn">Send Message</Link>
          <Link href="#" className="btn">Create Task</Link>
        </div>
      </div>
    </header>
  );
}
