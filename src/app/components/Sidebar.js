// components/Sidebar.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navSections = [
    {
      title: "Core",
      links: [
        { label: "🏠 Dashboard", path: "/dashboard" },
        { label: "🧲 Referrals", path: "/referrals" },
        { label: "📁 Cases", path: "/cases" },
        { label: "🗓️ Schedule", path: "/schedule" },
        { label: "💬 Messages", path: "/messages" },
        { label: "✅ Tasks", path: "/tasks" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "⚖️ Attorney", path: "/attorney" },
        { label: "📄 Discovery", path: "/discovery" },
      ],
    },
    {
      title: "Insights",
      links: [
        { label: "📊 Analytics", path: "/analytics" },
        { label: "⚙️ Admin", path: "/admin" },
      ],
    },
  ];

  return (
    <aside className="side">
      <div className="search">
      <svg width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 12.5l4 4m-1.5-8a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" stroke="#9db0e3" strokeWidth="1.6" strokeLinecap="round"/></svg>
        <input placeholder="Search patients, firms, cases… (⌘/Ctrl+K)" />
      </div>
      <nav className="nav">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="sec">{section.title}</div>
            {section.links.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={pathname === link.path ? "active" : ""}
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}