"use client";

import { useRouter } from "next/navigation";
import { useCanGoBack } from "@/app/nav";

const STEPS = 3; // check ingredients, results, recipe

// `step` shows where the user is in the scan flow. Leave it out on pages opened straight from the rich menu.
export default function PageHeader({ title, step }: { title: string; step?: 1 | 2 | 3 }) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  return (
    // Opaque wrapper so scrolled content doesn't show through the rounded corners.
    <div className="sticky top-0 z-10 bg-mist">
      <header className="flex h-14 items-center gap-1 rounded-b-3xl bg-brand px-2 text-white shadow-card">
        {canGoBack ? (
          <button type="button" onClick={() => router.back()} aria-label="ย้อนกลับ" className="-ml-1 flex h-11 w-11 items-center justify-center rounded-full active:bg-brand-deep">
            <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
        ) : (
          <span className="w-2" />
        )}
        {/* Bold 20px counts as large text, so white on brand passes contrast. */}
        <h1 className="flex-1 text-xl font-bold">{title}</h1>
        {step && (
          <div role="img" aria-label={`ขั้นที่ ${step} จาก ${STEPS}`} className="flex gap-1.5 pr-3">
            {Array.from({ length: STEPS }, (_, i) => (
              <span key={i} className={`h-2 w-6 rounded-full ${i < step ? "bg-butter" : "bg-white/30"}`} />
            ))}
          </div>
        )}
      </header>
    </div>
  );
}
