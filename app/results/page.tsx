"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import RecipeCard from "@/components/RecipeCard";
import { searchRecipes } from "@/mocks/api";
import { readDraft } from "@/app/draft";
import type { SearchResult } from "@/types/api";

type Tab = "matches" | "almostThere";
type State = { kind: "loading" } | { kind: "noSearch" } | { kind: "error" } | { kind: "done"; result: SearchResult };

const linkButton = "flex min-h-12 items-center justify-center rounded-xl bg-line px-6 font-semibold text-zinc-900";

export default function ResultsPage() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [tab, setTab] = useState<Tab>("matches");

  const run = useCallback(() => {
    const search = readDraft("search");
    if (!search) return setState({ kind: "noSearch" });
    setState({ kind: "loading" });
    searchRecipes(search)
      .then((result) => {
        setTab(result.matches.length > 0 ? "matches" : "almostThere");
        setState({ kind: "done", result });
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
          <div role="status" className="flex flex-col items-center gap-3 py-16 text-sm text-zinc-500">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-transparent" />
            กำลังหาเมนูที่ทำได้จากวัตถุดิบของคุณ…
          </div>
        )}

        {state.kind === "noSearch" && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-zinc-600">ยังไม่ได้เลือกวัตถุดิบ</p>
            <Link href="/scan" className={linkButton}>เริ่มสแกนวัตถุดิบ</Link>
          </div>
        )}

        {state.kind === "error" && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p role="alert" className="text-red-700">หาเมนูไม่สำเร็จ ลองใหม่อีกครั้งนะ</p>
            <button type="button" onClick={run} className={linkButton}>ลองอีกครั้ง</button>
          </div>
        )}

        {state.kind === "done" && <Results result={state.result} tab={tab} setTab={setTab} />}
      </main>
    </>
  );
}

function Results({ result, tab, setTab }: { result: SearchResult; tab: Tab; setTab: (t: Tab) => void }) {
  const { matches, almostThere, tries } = result;

  if (matches.length === 0 && almostThere.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="font-semibold">ไม่พบเมนูที่ตรงเงื่อนไข</p>
        <p className="text-sm text-zinc-500">ค้นหาแล้ว {tries} รอบ ลองเพิ่มวัตถุดิบหรือเปลี่ยนเงื่อนไขดูนะ</p>
        <Link href="/form" className={`${linkButton} mt-2`}>แก้เงื่อนไข</Link>
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
      <div role="tablist" className="mb-4 grid grid-cols-2 rounded-xl bg-zinc-100 p-1">
        {tabs.map(([id, label, count]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`min-h-10 rounded-lg text-sm font-medium ${tab === id ? "bg-white shadow-sm" : "text-zinc-500"}`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {tab === "almostThere" && list.length > 0 && (
        <p className="mb-3 text-xs text-zinc-500">ซื้อเพิ่มอีก 1-2 อย่างก็ทำได้</p>
      )}

      {list.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">
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

      {tries > 1 && <p className="mt-4 text-center text-xs text-zinc-400">ค้นหาแล้ว {tries} รอบ</p>}
    </>
  );
}
