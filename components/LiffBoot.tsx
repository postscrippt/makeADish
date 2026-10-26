"use client";

import { useEffect } from "react";
import { getLiff } from "@/app/liff";

// A LIFF link like liff.line.me/{id}/recipe/x first lands on the site root with ?liff.state=/recipe/x;
// liff.init() then forwards to that path. So init on any page reached that way, or opened inside LINE.
export default function LiffBoot() {
  useEffect(() => {
    const forwarding = location.search.includes("liff.state");
    if (!forwarding && !/\bLine\//.test(navigator.userAgent)) return;
    // If init doesn't forward (no LIFF id, or liff.state was just "/"), show the page again after a short wait.
    getLiff().finally(() => setTimeout(() => document.documentElement.classList.remove("liff-forwarding"), 1500));
  }, []);
  return null;
}
