"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { getFavorites, getHistory, setFavorite } from "@/mocks/api";
import type { Favorite, HistoryEntry } from "@/types/api";

type Tab = "all" | "favorites";

const dateFormat = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "2-digit" });

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [failed, setFailed] = useState(false);

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
    setFavorites(on ? [recipe, ...favorites] : favorites.filter((f) => f.id !== recipe.id));
    setFavorite(recipe, on);
  }

  if (!history) {
    return (
      <>
        <PageHeader title="ประวัติ" />
        {failed ? (
          <p role="alert" className="p-4 text-red-700">โหลดประวัติไม่สำเร็จ ลองใหม่อีกครั้งนะ</p>
        ) : (
          <p role="status" className="p-4 text-sm text-muted">กำลังโหลด…</p>
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
      <PageHeader title="ประวัติ" />
      <main className="p-4">
        <div role="tablist" className="mb-4 grid grid-cols-2 rounded-full bg-white p-1 shadow-card">
          {(
            [
              ["all", `ที่เคยทำ (${history.length})`],
              ["favorites", `เมนูโปรด (${favorites.length})`],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`min-h-10 rounded-full text-sm font-medium ${tab === id ? "bg-butter text-ink" : "text-muted"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-muted">
              {tab === "all" ? "ยังไม่มีเมนูที่ทำ กด “ทำเมนูนี้แล้ว” ในหน้าสูตรเพื่อบันทึก" : "ยังไม่มีเมนูโปรด กด ♡ ในหน้าสูตรเพื่อเพิ่ม"}
            </p>
            <Link href="/scan" className="btn-primary">
              หาเมนูจากวัตถุดิบ
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map(({ key, recipe, entry }) => {
              const fav = favorites.some((f) => f.id === recipe.id);
              return (
                <li key={key} className="flex min-h-16 items-center gap-2 rounded-3xl bg-white p-3 pl-4 shadow-card">
                  <Link href={`/recipe/${recipe.id}`} className="flex-1">
                    <p className="font-semibold">{recipe.th}</p>
                    {entry && (
                      <p className="text-sm text-muted">
                        <span aria-label={`${entry.rating} ดาว`} className="text-amber-400">
                          {"★".repeat(entry.rating)}
                          <span className="text-edge">{"★".repeat(5 - entry.rating)}</span>
                        </span>{" "}
                        · {dateFormat.format(new Date(entry.cookedAt))}
                      </p>
                    )}
                  </Link>
                  <button
                    type="button"
                    aria-pressed={fav}
                    aria-label={`เมนูโปรด ${recipe.th}`}
                    onClick={() => toggle(recipe)}
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl ${fav ? "text-red-500" : "text-edge"}`}
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
