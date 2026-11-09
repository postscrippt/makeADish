"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import CloseToChat from "@/components/CloseToChat";
import Segmented from "@/components/Segmented";
import { getFavorites, getHistory, setFavorite } from "@/mocks/api";
import { useLang } from "@/app/lang";
import { dishTitle } from "@/app/recipeEn";
import type { Lang } from "@/app/text";
import type { Favorite, HistoryEntry } from "@/types/api";

type Tab = "all" | "favorites";

const options = { day: "numeric", month: "short", year: "2-digit" } as const;
const dateFormat: Record<Lang, Intl.DateTimeFormat> = { th: new Intl.DateTimeFormat("th-TH", options), en: new Intl.DateTimeFormat("en-GB", options) };

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [failed, setFailed] = useState(false);
  const { lang, t } = useLang();

  useEffect(() => {
    Promise.all([getHistory(), getFavorites()])
      .then(([h, f]) => {
        setHistory(h);
        setFavorites(f);
      })
      .catch(() => setFailed(true));
  }, []);

  function toggle(recipe: Favorite) {
    const on = !favorites.some((f) => f.id === recipe.id);
    const before = favorites;
    setFavorites(on ? [recipe, ...favorites] : favorites.filter((f) => f.id !== recipe.id));
    setFavorite(recipe, on).catch(() => setFavorites(before));
  }

  if (!history) {
    return (
      <>
        <PageHeader title={t("history.title")} />
        {failed ? (
          <p role="alert" className="p-5 text-red-700">{t("history.loadFailed")}</p>
        ) : (
          <p role="status" className="p-5 text-sm text-muted">{t("common.loading")}</p>
        )}
      </>
    );
  }

  const rows =
    tab === "all"
      ? history.map((e) => ({ key: `${e.recipeId}-${e.cookedAt}`, recipe: { id: e.recipeId, th: e.th }, entry: e }))
      : favorites.map((f) => ({ key: f.id, recipe: f, entry: null }));

  return (
    <>
      <PageHeader title={t("history.title")}>
        <h2 className="text-3xl leading-tight font-bold text-butter">{history.length > 0 ? t("history.cookedCount", { n: history.length }) : t("history.noneCooked")}</h2>
        <p className="mt-1 text-white">{t("history.favoriteCount", { n: favorites.length })}</p>
      </PageHeader>
      <main className="px-5 pt-6 pb-10">
        <div className="sticky top-0 z-10 -mx-5 -mt-6 mb-3 bg-mist px-5 pt-5 pb-3">
          <Segmented
            label={t("history.list")}
            value={tab}
            onChange={setTab}
            options={[["all", t("history.tabCooked", { n: history.length })], ["favorites", t("history.tabFavorites", { n: favorites.length })]]}
          />
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            {tab === "all" ? (
              <>
                <p className="text-muted">{t("history.emptyCooked")}</p>
                <p className="text-sm text-muted">{t("history.emptyCookedHint")}</p>
                <CloseToChat className="btn-primary" />
              </>
            ) : (
              <>
                <p className="text-muted">{t("history.emptyFavorites")}</p>
                <Link href="/menus" className="btn-primary">{t("history.browseAll")}</Link>
              </>
            )}
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {rows.map(({ key, recipe, entry }) => {
              const fav = favorites.some((f) => f.id === recipe.id);
              return (
                <li key={key} className="flex min-h-24 items-center gap-2 rounded-3xl bg-white p-4 shadow-card active:bg-butter-soft">
                  <Link href={`/recipe/${recipe.id}`} className="flex-1">
                    <p className="text-lg leading-snug font-semibold">{dishTitle(recipe, lang)}</p>
                    {entry && (
                      <p className="text-sm text-muted">
                        <span aria-label={t("history.stars", { n: entry.rating })}>
                          <span className="text-amber-600">{"★".repeat(entry.rating)}</span>
                          {"☆".repeat(5 - entry.rating)}
                        </span>{" "}
                        · {dateFormat[lang].format(new Date(entry.cookedAt))}
                      </p>
                    )}
                  </Link>
                  <button
                    type="button"
                    aria-pressed={fav}
                    aria-label={t("history.favoriteName", { name: dishTitle(recipe, lang) })}
                    onClick={() => toggle(recipe)}
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl ${fav ? "text-red-500" : "text-muted"}`}
                  >
                    {fav ? "♥" : "♡"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
