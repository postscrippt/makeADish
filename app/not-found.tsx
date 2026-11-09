"use client";

import CloseToChat from "@/components/CloseToChat";
import { useLang } from "@/app/lang";

export default function NotFound() {
  const { t } = useLang();
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-4xl" aria-hidden>🥢</p>
      <h1 className="text-lg font-semibold">{t("notFound.title")}</h1>
      <p className="text-sm text-muted">{t("notFound.hint")}</p>
      <CloseToChat />
    </main>
  );
}
