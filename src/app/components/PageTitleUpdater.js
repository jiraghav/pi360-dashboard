"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { routeMap } from "../config/routes";

export default function PageTitleUpdater() {
  const pathname = usePathname();

  useEffect(() => {
    // Default to "PI360 • Desktop Dashboard" if route is not found
    const route = routeMap[pathname] || { title: "PI360 • Desktop Dashboard" };
    document.title = route.title;
  }, [pathname]);

  return null; // invisible component
}
