"use client";

import Link from "next/link";
import Image from "next/image";
import CloseToChat from "@/components/CloseToChat";
import { LangSwitch } from "@/components/PageHeader";
import { useLang } from "@/app/lang";
import type { Key } from "@/app/text";

// The app has no menu of its own: the LINE rich menu is the only one. This page is only seen when someone opens the bare site.
// In mock mode (no keys, outside LINE) it also lists the pages so the UI can still be walked end to end.
const MOCK_MODE = process.env.NEXT_PUBLIC_USE_MOCKS !== "false"; // same rule as mocks/api.ts

const devPages: { href: string; label: Key }[] = [
  { href: "/form", label: "home.devForm" },
  { href: "/history", label: "history.title" },
  { href: "/menus", label: "menus.title" },
];

export default function Home() {
  const { t } = useLang();
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="absolute top-3 right-3"><LangSwitch /></div>
      <Image src="/logo.svg" alt="" width={75} height={54} unoptimized priority />
      <h1 className="text-2xl font-bold">MakeADish</h1>
      <p className="text-muted">{t("home.intro")}</p>
      <CloseToChat className="btn-secondary">{t("common.close")}</CloseToChat>

      {MOCK_MODE && (
        <nav aria-label={t("home.devNav")} className="mt-6 flex flex-col items-center gap-1 text-sm">
          <p className="text-muted">{t("home.devMode")}</p>
          {devPages.map((p) => (
            <Link key={p.href} href={p.href} className="flex min-h-11 items-center underline">
              {t(p.label)}
            </Link>
          ))}
        </nav>
      )}
    </main>
  );
}
