"use client";

import { useRouter } from "next/navigation";
import { useCanGoBack } from "@/app/nav";
import { setLang, useLang } from "@/app/lang";
import type { Lang } from "@/app/text";

const LANGS: [Lang, string][] = [["th", "TH"], ["en", "EN"]];

// TH | EN. Its own teal pill, so it reads the same on the header and on the plain home page.
export function LangSwitch() {
  const { lang, t } = useLang();
  return (
    <div role="group" aria-label={t("common.language")} className="flex shrink-0 rounded-full bg-brand-deep text-sm font-semibold text-white">
      {LANGS.map(([id, label]) => (
        <button
          key={id}
          type="button"
          aria-pressed={lang === id}
          onClick={() => setLang(id)}
          className={`h-11 w-11 rounded-full ${lang === id ? "bg-white text-brand-deep" : ""}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// Pages open from chat links, the rich menu or each other in any order, so there is no step counter.
// `children` turns the bar into a hero: the page's headline and key summary sit inside the teal, with a rounded bottom
// that the white content below rises over. A hero scrolls away (the bar is sticky only without one).
// `titleAs="p"` is for a page whose hero already holds the real h1 (the Recipe page: the dish name).
export default function PageHeader({ title, children, titleAs: Title = "h1" }: { title: string; children?: React.ReactNode; titleAs?: "h1" | "p" }) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const { t } = useLang();
  return (
    // Opaque wrapper so scrolled content doesn't show through the rounded corners.
    <div className={children ? "bg-mist" : "sticky top-0 z-10 bg-mist"}>
      <header className={`bg-brand text-white shadow-card ${children ? "rounded-b-[2.5rem]" : "rounded-b-3xl"}`}>
        <div className="flex h-14 items-center gap-1 px-2">
        {canGoBack ? (
          <button type="button" onClick={() => router.back()} aria-label={t("common.back")} className="-ml-1 flex h-11 w-11 items-center justify-center rounded-full active:bg-brand-deep">
            <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
        ) : (
          <span className="w-2" />
        )}
        {/* Bold 20px counts as large text, so white on brand passes contrast. */}
        <Title className="flex-1 text-xl font-bold">{title}</Title>
        <LangSwitch />
        </div>
        {children && <div className="px-5 pt-2 pb-8">{children}</div>}
      </header>
    </div>
  );
}
