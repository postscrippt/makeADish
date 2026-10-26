"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import RecipeCard from "@/components/RecipeCard";
import Chip from "@/components/Chip";
import { getIngredients, getOptions, getProfile, searchRecipes } from "@/mocks/api";
import { readDraft, writeDraft } from "@/app/draft";
import { idsFromLink } from "@/app/linkIds";
import type { Option, SearchRequest, SearchResult } from "@/types/api";

type Tab = "matches" | "almostThere";
type State = { kind: "loading" } | { kind: "noSearch" } | { kind: "error" } | { kind: "done"; result: SearchResult; categories: Option[] };

const linkButton = "btn-primary";

// Opened from the LINE chat ([ดูทั้งหมด] → /results?ids=a,b): search those ingredients with the saved profile.
// Also stores the draft so recipe links (?from=results) and the check screen see the same ingredients.
async function searchFromLink(): Promise<SearchRequest | null> {
  const param = new URLSearchParams(location.search).get("ids");
  if (param === null) return null;
  const [list, profile] = await Promise.all([getIngredients(), getProfile()]);
  const tags = idsFromLink(param, list);
  if (tags.length === 0) return null;
  const search: SearchRequest = { ingredientIds: tags.map((t) => t.id), spice: profile.spice, category: null, allergies: profile.allergies };
  writeDraft("ingredients", tags);
  writeDraft("search", search);
  return search;
}

export default function ResultsPage() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [tab, setTab] = useState<Tab>("matches");

  const run = useCallback(async () => {
    const search = (await searchFromLink()) ?? readDraft("search");
    if (!search) return setState({ kind: "noSearch" });
    setState({ kind: "loading" });
    Promise.all([searchRecipes(search), getOptions()])
      .then(([result, options]) => {
        setTab(result.matches.length > 0 ? "matches" : "almostThere");
        setState({ kind: "done", result, categories: options.categories });
      })
      .catch(() => setState({ kind: "error" }));
  }, []);

  // sessionStorage only exists in the browser, so the search starts after the page loads.
  useEffect(() => {
    Promise.resolve().then(run);
  }, [run]);

  return (
    <>
      <PageHeader title="ผลลัพธ์" />
      <main className="p-4">
        {state.kind === "loading" && (
          <div role="status" className="flex flex-col items-center gap-3 py-16 text-sm text-muted">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
            กำลังหาเมนูที่ทำได้จากวัตถุดิบของคุณ…
          </div>
        )}

        {state.kind === "noSearch" && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-muted">ยังไม่ได้เลือกวัตถุดิบ</p>
            <Link href="/scan" className={linkButton}>เริ่มสแกนวัตถุดิบ</Link>
          </div>
        )}

        {state.kind === "error" && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p role="alert" className="text-red-700">หาเมนูไม่สำเร็จ ลองใหม่อีกครั้งนะ</p>
            <button type="button" onClick={run} className={linkButton}>ลองอีกครั้ง</button>
          </div>
        )}

        {state.kind === "done" && <Results result={state.result} categories={state.categories} tab={tab} setTab={setTab} />}
      </main>
    </>
  );
}

function Results({
  result, categories, tab, setTab,
}: { result: SearchResult; categories: Option[]; tab: Tab; setTab: (t: Tab) => void }) {
  const { tries } = result;
  const [filter, setFilter] = useState<string | null>(null);
  // Food type filters what's already loaded; the search itself always runs for every category.
  const pick = (list: SearchResult["matches"]) => (filter ? list.filter((m) => m.recipe.category === filter) : list);
  const matches = pick(result.matches);
  const almostThere = pick(result.almostThere);

  if (result.matches.length === 0 && result.almostThere.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="font-semibold">ไม่พบเมนูที่ตรงเงื่อนไข</p>
        <p className="text-sm text-muted">ค้นหาแล้ว {tries} รอบ ลองเพิ่มวัตถุดิบหรือเปลี่ยนเงื่อนไขดูนะ</p>
        <Link href="/form" className={`${linkButton} mt-2`}>แก้วัตถุดิบ</Link>
      </div>
    );
  }

  const tabs: [Tab, string, number][] = [
    ["matches", "ทำได้เลย", matches.length],
    ["almostThere", "ขาดวัตถุดิบอีกนิด", almostThere.length],
  ];
  const list = tab === "matches" ? matches : almostThere;

  return (
    <>
      <div role="tablist" className="mb-4 grid grid-cols-2 rounded-full bg-white p-1 shadow-card">
        {tabs.map(([id, label, count]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`min-h-10 rounded-full text-sm font-medium ${tab === id ? "bg-butter text-ink" : "text-muted"}`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      <div role="group" aria-label="ประเภทอาหาร" className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
        <Chip selected={filter === null} onClick={() => setFilter(null)}>ทั้งหมด</Chip>
        {categories.map((c) => (
          <Chip key={c.id} selected={filter === c.id} onClick={() => setFilter(c.id)}>{c.th}</Chip>
        ))}
      </div>

      {tab === "almostThere" && list.length > 0 && (
        <p className="mb-3 text-xs text-muted">ซื้อเพิ่มอีก 1-2 อย่างก็ทำได้</p>
      )}

      {list.length === 0 && filter ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm text-muted">ไม่มีเมนู{categories.find((c) => c.id === filter)?.th}ในแท็บนี้</p>
          <button type="button" onClick={() => setFilter(null)} className="btn-secondary px-6">ดูทั้งหมด</button>
        </div>
      ) : list.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          {tab === "matches" ? "ยังไม่มีเมนูที่ใช้วัตถุดิบครบ ลองดูแท็บ “ขาดวัตถุดิบอีกนิด”" : "ไม่มีเมนูที่ขาดแค่ 1-2 อย่าง"}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((m) => (
            <li key={m.recipe.id}>
              <RecipeCard recipe={m.recipe} match={m} />
            </li>
          ))}
        </ul>
      )}

      {tries > 1 && <p className="mt-4 text-center text-xs text-muted">ค้นหาแล้ว {tries} รอบ</p>}
    </>
  );
}
