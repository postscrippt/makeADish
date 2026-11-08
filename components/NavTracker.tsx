"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordPath } from "@/app/nav";

// Mounted once in the root layout; feeds app/nav.ts.
export default function NavTracker() {
  const path = usePathname();
  useEffect(() => recordPath(path), [path]);
  return null;
}
