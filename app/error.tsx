"use client"; // error pages must run in the browser

import CloseToChat from "@/components/CloseToChat";
import { useLang } from "@/app/lang";

// Shown when a page crashes while rendering. Failed data loads are handled on each page with its own message.
export default function Error({ retry }: { error: unknown; retry: () => void }) {
  const { t } = useLang();
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-4xl" aria-hidden>🍳</p>
      <h1 className="text-lg font-semibold">{t("error.title")}</h1>
      <p className="text-sm text-muted">{t("error.hint")}</p>
      <button type="button" onClick={() => retry()} className="btn-primary">
        {t("common.retry")}
      </button>
      <CloseToChat className="btn-secondary">{t("common.closeToChat")}</CloseToChat>
    </main>
  );
}
