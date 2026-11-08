"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import CloseToChat from "@/components/CloseToChat";
import RecipeCard from "@/components/RecipeCard";
import Chip from "@/components/Chip";
import SearchSheet, { spiceLabels } from "@/components/SearchSheet";
import { getIngredients, getOptions, getProfile, saveProfile, searchRecipes } from "@/mocks/api";
import { readDraft, startSearch } from "@/app/draft";
import { idsFromLink } from "@/app/linkIds";
import type { Ingredient, Options, Profile, SearchRequest, SearchResult, SpiceLevel } from "@/types/api";

type Tab = "matches" | "toBuy";
type Done = { result: SearchResult; options: Options; profile: Profile; catalog: Ingredient[]; tags: Ingredient[] };
type State = { kind: "loading" } | { kind: "noSearch" } | { kind: "error" } | ({ kind: "done" } & Done);

// "ไก่, ไข่, หมู": what this search was run on. Long lists are cut by the card (line-clamp), not here.
const names = (tags: Ingredient[]) => tags.map((t) => t.th).join(", ");

// Where the search comes from: a chat link (?ids=a,b: the carousel's [ดูทั้งหมด] or the confirm card's [แก้ไข] via /form),
// else the draft the scan or the entry form left in this tab. A link is read once, then dropped from the address,
// so going back from a recipe uses the draft (with any edits) instead of the old link.
async function initial(catalog: Ingredient[], profile: Profile): Promise<{ search: SearchRequest; tags: Ingredient[] } | null> {
  const params = new URLSearchParams(location.search);
  const param = params.get("ids");
  if (param !== null) {
    const tags = idsFromLink(param, catalog);
    history.replaceState(null, "", "/results");
    if (tags.length > 0) return { search: startSearch(tags, profile), tags };
  }
  const search = readDraft("search");
  if (!search) return null;
  const tags = readDraft("ingredients") ?? idsFromLink(search.ingredientIds.join(","), catalog);
  return { search, tags };
}

export default function ResultsPage() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [tab, setTab] = useState<Tab>("matches");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [syncFailed, setSyncFailed] = useState(false);

  const find = useCallback(async (search: SearchRequest, base: Omit<Done, "result">) => {
    setState({ kind: "loading" });
    try {
      const result = await searchRecipes(search);
      setTab(result.matches.length > 0 ? "matches" : "toBuy");
      setState({ kind: "done", result, ...base });
    } catch {
      setState({ kind: "error" });
    }
  }, []);

  // sessionStorage only exists in the browser, so everything starts after the page loads.
  const run = useCallback(async () => {
    const edit = new URLSearchParams(location.search).get("edit") === "1"; // the chat's [แก้ไข] opens the sheet at once
    try {
      const [catalog, profile, options] = await Promise.all([getIngredients(), getProfile(), getOptions()]);
      const from = await initial(catalog, profile);
      if (!from) return setState({ kind: "noSearch" });
      history.replaceState(null, "", "/results");
      await find(from.search, { options, profile, catalog, tags: from.tags });
      if (edit) setSheetOpen(true);
    } catch {
      setState({ kind: "error" });
    }
  }, [find]);

  useEffect(() => {
    Promise.resolve().then(run);
  }, [run]);

  // One button in the sheet applies ingredients, allergies and spice, and searches again right here.
  async function apply(tags: Ingredient[], allergies: string[], spice: SpiceLevel) {
    setSheetOpen(false);
    if (state.kind !== "done") return;
    const { profile, options, catalog } = state;
    const same = tags.map((t) => t.id).join() === state.tags.map((t) => t.id).join() && allergies.join() === profile.allergies.join() && spice === profile.spice;
    if (same) return;
    const next = { ...profile, allergies, spice };
    setSyncFailed(false);
    if (allergies.join() !== profile.allergies.join() || spice !== profile.spice) saveProfile(next).catch(() => setSyncFailed(true));
    await find(startSearch(tags, next), { options, profile: next, catalog, tags });
  }

  return (
    <>
      <PageHeader title="เลือกเมนู" step={2} />
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
            {/* Scanning happens in the chat; this closes back to it. Outside LINE only the typing link shows. */}
            <CloseToChat>กลับไปแชทเพื่อสแกน</CloseToChat>
            <Link href="/form" className="btn-secondary">พิมพ์วัตถุดิบเอง</Link>
          </div>
        )}

        {state.kind === "error" && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p role="alert" className="text-red-700">หาเมนูไม่สำเร็จ ลองใหม่อีกครั้งนะ</p>
            <button type="button" onClick={run} className="btn-primary">ลองอีกครั้ง</button>
          </div>
        )}

        {state.kind === "done" && (
          <Results state={state} tab={tab} setTab={setTab} onEdit={() => setSheetOpen(true)} syncFailed={syncFailed} />
        )}
      </main>

      {state.kind === "done" && sheetOpen && (
        <SearchSheet
          catalog={state.catalog}
          allergens={state.options.allergens}
          tags={state.tags}
          allergies={state.profile.allergies}
          spice={state.profile.spice}
          onApply={apply}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  );
}

function Results({
  state, tab, setTab, onEdit, syncFailed,
}: { state: Done; tab: Tab; setTab: (t: Tab) => void; onEdit: () => void; syncFailed: boolean }) {
  const { result, tags, profile } = state;
  const categories = state.options.categories;
  const { tries } = result;
  const allergyNames = state.options.allergens.filter((a) => profile.allergies.includes(a.id)).map((a) => a.th);
  const [filter, setFilter] = useState<string | null>(null);

  // The tabs and filters stay pinned while scrolling, so a new list should start at its top.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [tab, filter]);
  // Food type filters what's already loaded; the search itself always runs for every category.
  const pick = (list: SearchResult["matches"]) => (filter ? list.filter((m) => m.recipe.category === filter) : list);
  const matches = pick(result.matches);
  const almostThere = pick(result.almostThere);
  const partial = pick(result.partial ?? []); // absent until the server sends it (#79)

  if (result.matches.length === 0 && result.almostThere.length === 0 && !result.partial?.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="font-semibold">ไม่พบเมนูที่ตรงเงื่อนไข</p>
        <p className="text-sm text-muted">ค้นหาแล้ว {tries} รอบ ลองเพิ่มวัตถุดิบหรือเปลี่ยนเงื่อนไขดูนะ</p>
        <button type="button" onClick={onEdit} className="btn-primary mt-2">แก้วัตถุดิบ</button>
        <CloseToChat className="btn-secondary">สแกนใหม่ในแชท</CloseToChat>
      </div>
    );
  }

  const tabs: [Tab, string, number][] = [
    ["matches", "ทำได้เลย", matches.length],
    ["toBuy", "ต้องซื้อเพิ่ม", almostThere.length + partial.length],
  ];
  // Tab 2 holds two groups: missing 1-2 items, then missing 3 or more.
  const groups: [string, SearchResult["matches"]][] =
    tab === "matches" ? [["", matches]] : [["ขาดอีก 1-2 อย่าง", almostThere], ["ขาดหลายอย่าง", partial]];
  const empty = groups.every(([, g]) => g.length === 0);

  return (
    <>
      {/* What this search is based on. One edit button opens the sheet; nothing here needs confirming. */}
      <section aria-label="ที่ใช้ค้นหา" className="mb-3 rounded-3xl bg-white p-4 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted">จากวัตถุดิบ {tags.length} อย่าง</p>
            <p className="mt-0.5 line-clamp-2 text-lg leading-snug font-semibold">{names(tags)}</p>
          </div>
          <button type="button" onClick={onEdit} className="btn-secondary min-h-11 shrink-0 px-4 text-sm">แก้ไข</button>
        </div>
        <button type="button" onClick={onEdit} className="mt-2 flex min-h-11 w-full items-center justify-between gap-2 border-t border-edge pt-2 text-left text-sm">
          <span>
            {allergyNames.length > 0 ? <span className="font-semibold text-red-700">แพ้: {allergyNames.join(", ")}</span> : <span className="text-muted">ยังไม่ได้ระบุอาหารที่แพ้</span>}
            <span className="text-muted"> · {spiceLabels[profile.spice]}</span>
          </span>
          <span className="shrink-0 font-semibold text-brand-deep">{allergyNames.length > 0 ? "แก้ไข" : "ตั้งค่า"}</span>
        </button>
        {syncFailed && (
          <p role="alert" className="mt-1 text-sm text-red-700">บันทึกไปที่แชทไม่สำเร็จ แชทอาจยังไม่รู้ว่าคุณแพ้อะไร ลองกดแก้ไขแล้วบันทึกอีกครั้ง</p>
        )}
      </section>

      <div className="sticky top-14 z-[5] -mx-4 bg-mist px-4 pb-2 pt-1">
        <div role="tablist" className="grid grid-cols-2 rounded-full bg-white p-1 shadow-card">
          {tabs.map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`min-h-11 rounded-full text-sm font-medium ${tab === id ? "bg-butter text-ink" : "text-muted"}`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      <div role="group" aria-label="ประเภทอาหาร" className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
        <Chip selected={filter === null} onClick={() => setFilter(null)}>ทั้งหมด</Chip>
        {categories.map((c) => (
          <Chip key={c.id} selected={filter === c.id} onClick={() => setFilter(c.id)}>{c.th}</Chip>
        ))}
      </div>

      {empty && filter ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm text-muted">ไม่มีเมนู{categories.find((c) => c.id === filter)?.th}ในแท็บนี้</p>
          <button type="button" onClick={() => setFilter(null)} className="btn-secondary px-6">ดูทั้งหมด</button>
        </div>
      ) : empty ? (
        <p className="py-12 text-center text-sm text-muted">
          {tab === "matches" ? "ยังไม่มีเมนูที่ใช้วัตถุดิบครบ ลองดูแท็บ “ต้องซื้อเพิ่ม”" : "ไม่มีเมนูที่ต้องซื้อเพิ่ม"}
        </p>
      ) : (
        groups.map(([title, list]) =>
          list.length === 0 ? null : (
            <section key={title} aria-label={title || undefined} className="mb-5">
              {title && <h2 className="mb-2 text-sm font-semibold text-muted">{title}</h2>}
              <ul className="flex flex-col gap-3">
                {list.map((m) => (
                  <li key={m.recipe.id}>
                    <RecipeCard recipe={m.recipe} match={m} />
                  </li>
                ))}
              </ul>
            </section>
          ),
        )
      )}

      {tries > 1 && <p className="mt-4 text-center text-xs text-muted">ค้นหาแล้ว {tries} รอบ</p>}
    </>
  );
}
