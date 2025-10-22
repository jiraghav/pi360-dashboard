"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { routeMap } from "../config/routes";

export default function PageTitleUpdater() {
  const pathname = usePathname();

  useEffect(() => {
    const route = routeMap[pathname] || { title: "Dashboard" };
    document.title = route.title;
  }, [pathname]);

  return null; // invisible component
}
