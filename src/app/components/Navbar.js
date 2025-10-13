"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routeMap } from "../config/routes";

export default function Navbar() {
  const pathname = usePathname();
  const { title, sub } = routeMap[pathname] || {
    title: "PI360 • Desktop Dashboard",
    sub: "Command Center",
  };

  return (
    <div className="top">
      <div className="bar">
        <div className="brand">
          <div className="gem">PI</div>
          <div>
            <div className="title">{title}</div>
            <div className="sub">{sub}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Link href="/dashboard" className="btn">Export</Link>
          <Link href="/referrals/new" className="btn primary">+ New Referral</Link>
        </div>
      </div>
    </div>
  );
}
