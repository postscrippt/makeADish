"use client";

import { useEffect } from "react";
import { getLiff } from "@/app/liff";

// A LIFF link like liff.line.me/{id}/recipe/x first lands on the site root with ?liff.state=/recipe/x;
// liff.init() then forwards to that path. So init on any page reached that way, or opened inside LINE.
export default function LiffBoot() {
  useEffect(() => {
    if (location.search.includes("liff.state") || /\bLine\//.test(navigator.userAgent)) getLiff();
  }, []);
  return null;
}
