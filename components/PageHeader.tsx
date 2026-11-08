"use client";

import { useRouter } from "next/navigation";
import { useCanGoBack } from "@/app/nav";

const STEPS = 3; // check ingredients, results, recipe

// `step` shows where the user is in the scan flow. Leave it out on pages opened straight from the rich menu.
// `children` turns the bar into a hero: the page's headline and key summary sit inside the teal, with a rounded bottom
// that the white content below rises over. A hero scrolls away (the bar is sticky only without one).
// `titleAs="p"` is for a page whose hero already holds the real h1 (the Recipe page: the dish name).
export default function PageHeader({ title, step, children, titleAs: Title = "h1" }: { title: string; step?: 1 | 2 | 3; children?: React.ReactNode; titleAs?: "h1" | "p" }) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  return (
    // Opaque wrapper so scrolled content doesn't show through the rounded corners.
    <div className={children ? "bg-mist" : "sticky top-0 z-10 bg-mist"}>
      <header className={`bg-brand text-white shadow-card ${children ? "rounded-b-[2.5rem]" : "rounded-b-3xl"}`}>
        <div className="flex h-14 items-center gap-1 px-2">
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
        <Title className="flex-1 text-xl font-bold">{title}</Title>
        {step && (
          <div role="img" aria-label={`ขั้นที่ ${step} จาก ${STEPS}`} className="flex gap-1.5 pr-3">
            {Array.from({ length: STEPS }, (_, i) => (
              <span key={i} className={`h-2 w-6 rounded-full ${i < step ? "bg-butter" : "bg-white/30"}`} />
            ))}
          </div>
        )}
        </div>
        {children && <div className="px-5 pt-2 pb-8">{children}</div>}
      </header>
    </div>
  );
}
