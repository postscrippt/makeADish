"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import CloseToChat from "@/components/CloseToChat";
import RecipeCard from "@/components/RecipeCard";
import Chip from "@/components/Chip";
import Segmented from "@/components/Segmented";
import SearchSheet, { spiceLabels } from "@/components/SearchSheet";
import { getIngredients, getOptions, getProfile, saveProfile, searchRecipes } from "@/mocks/api";
import { readDraft, startSearch } from "@/app/draft";
import { idsFromLink } from "@/app/linkIds";
import { useLang } from "@/app/lang";
import { allergenName, dishCategoryName, localName } from "@/app/text";
import type { Ingredient, Options, Profile, SearchRequest, SearchResult, SpiceLevel } from "@/types/api";

type Tab = "matches" | "toBuy";
type Done = { result: SearchResult; options: Options; profile: Profile; catalog: Ingredient[]; tags: Ingredient[] };
type State = { kind: "loading" } | { kind: "noSearch" } | { kind: "error" } | ({ kind: "done" } & Done);

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
  const { t } = useLang();

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
      <PageHeader title={t("results.title")}>
        {state.kind === "loading" && <h2 className="text-3xl leading-tight font-bold text-butter">{t("results.searching")}</h2>}
        {state.kind === "done" && <Hero state={state} onEdit={() => setSheetOpen(true)} syncFailed={syncFailed} />}
      </PageHeader>
      <main className="px-5 pt-6 pb-10">
        {state.kind === "loading" && (
          <div role="status" className="flex flex-col items-center gap-3 py-16 text-sm text-muted">
            <span className="h-8 w-8 animate-spin motion-reduce:animate-pulse rounded-full border-4 border-brand border-t-transparent" />
            {t("results.searchingLong")}
          </div>
        )}

        {state.kind === "noSearch" && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-muted">{t("results.noSearch")}</p>
            {/* Scanning happens in the chat; this closes back to it. Outside LINE only the typing link shows. */}
            <CloseToChat>{t("results.backToScan")}</CloseToChat>
            <Link href="/form" className="btn-secondary">{t("results.typeOwn")}</Link>
          </div>
        )}

        {state.kind === "error" && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p role="alert" className="text-red-700">{t("results.failed")}</p>
            <button type="button" onClick={run} className="btn-primary">{t("common.retry")}</button>
          </div>
        )}

        {state.kind === "done" && (
          <Results state={state} tab={tab} setTab={setTab} onEdit={() => setSheetOpen(true)} />
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

// The teal block: what you can cook right now (the answer), then what it was based on (ingredients, allergies, spice)
// with the one edit button. Nothing here needs confirming.
function Hero({ state, onEdit, syncFailed }: { state: Done; onEdit: () => void; syncFailed: boolean }) {
  const { result, tags, profile } = state;
  const { lang, t } = useLang();
  const allergyNames = state.options.allergens.filter((a) => profile.allergies.includes(a.id)).map((a) => allergenName(a, lang));
  const shown = tags.slice(0, 6);
  const now = result.matches.length;
  return (
    <section aria-label={t("results.basis")}>
      <h2 className="text-3xl leading-tight font-bold text-balance text-butter">{now > 0 ? t("results.canCook", { n: now }) : t("results.almost")}</h2>

      {/* What the search is based on, grouped in one panel: ingredients, then the two filters, and the one edit button. */}
      <div className="mt-5 rounded-3xl bg-brand-deep p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold">{t("results.fromCount", { n: tags.length })}</p>
          <button type="button" onClick={onEdit} className="btn-secondary min-h-11 shrink-0 px-5 text-sm">{t("results.edit")}</button>
        </div>
        <ul aria-label={t("results.ingredients")} className="mt-3 flex flex-wrap gap-2">
          {shown.map((tag) => (
            <li key={tag.id} className="rounded-full bg-white px-3 py-1 text-sm font-medium text-ink">{localName(tag, lang)}</li>
          ))}
          {tags.length > shown.length && <li className="rounded-full bg-white px-3 py-1 text-sm font-medium text-ink">+{tags.length - shown.length}</li>}
        </ul>
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-white/25 pt-4">
          <div>
            <dt className="text-sm">{t("results.allergies")}</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {allergyNames.length > 0 ? (
                allergyNames.map((n) => <span key={n} className="rounded-full bg-white px-3 py-0.5 text-sm font-semibold text-red-700">{n}</span>)
              ) : (
                <span className="text-sm font-semibold">{t("results.noAllergies")}</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm">{t("results.spice")}</dt>
            <dd className="mt-1 text-sm font-semibold">{spiceLabels[lang][profile.spice]}</dd>
          </div>
        </dl>
        {syncFailed && (
          <p role="alert" className="mt-3 rounded-2xl bg-white p-3 text-sm text-red-700">{t("results.syncFailed")}</p>
        )}
      </div>
    </section>
  );
}

function Results({ state, tab, setTab, onEdit }: { state: Done; tab: Tab; setTab: (t: Tab) => void; onEdit: () => void }) {
  const { result } = state;
  const { lang, t } = useLang();
  const categories = state.options.categories;
  const names = Object.fromEntries(state.catalog.map((x) => [x.id, x.en]));
  const { tries } = result;
  const [filter, setFilter] = useState<string | null>(null);
  const listTop = useRef<HTMLDivElement>(null);

  // The tabs stay pinned while scrolling, so a new list should start right under them (not back up in the hero).
  useEffect(() => {
    const top = listTop.current?.offsetTop ?? 0;
    if (window.scrollY > top) window.scrollTo({ top });
  }, [tab, filter]);
  // Food type filters what's already loaded; the search itself always runs for every category.
  const pick = (list: SearchResult["matches"]) => (filter ? list.filter((m) => m.recipe.category === filter) : list);
  const matches = pick(result.matches);
  const almostThere = pick(result.almostThere);
  const partial = pick(result.partial ?? []); // absent until the server sends it (#79)

  if (result.matches.length === 0 && result.almostThere.length === 0 && !result.partial?.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="font-semibold">{t("results.none")}</p>
        <p className="text-sm text-muted">{t("results.noneHint", { n: tries })}</p>
        <button type="button" onClick={onEdit} className="btn-primary mt-2">{t("results.editIngredients")}</button>
        <CloseToChat className="btn-secondary">{t("results.rescan")}</CloseToChat>
      </div>
    );
  }

  const tabs: [Tab, string, number][] = [
    ["matches", t("results.tabNow"), matches.length],
    ["toBuy", t("results.tabBuy"), almostThere.length + partial.length],
  ];
  // Tab 2 holds two groups: missing 1-2 items, then missing 3 or more.
  const groups: [string, SearchResult["matches"]][] =
    tab === "matches" ? [["", matches]] : [[t("results.missingFew"), almostThere], [t("results.missingMany"), partial]];
  const empty = groups.every(([, g]) => g.length === 0);

  return (
    <>
      <div ref={listTop} />
      <div className="sticky top-0 z-10 -mx-5 -mt-6 bg-mist px-5 pt-5 pb-3">
        <Segmented label={t("results.tabs")} value={tab} onChange={setTab} options={tabs.map(([id, label, count]) => [id, `${label} (${count})`])} />
      </div>

      <div role="group" aria-label={t("menus.categories")} className="mb-5 flex flex-wrap gap-2">
        <Chip selected={filter === null} onClick={() => setFilter(null)}>{t("menus.all")}</Chip>
        {categories.map((c) => (
          <Chip key={c.id} selected={filter === c.id} onClick={() => setFilter(c.id)}>{dishCategoryName(c, lang)}</Chip>
        ))}
      </div>

      {empty && filter ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm text-muted">{t("results.emptyCategory", { category: dishCategoryName(categories.find((c) => c.id === filter)!, lang) })}</p>
          <button type="button" onClick={() => setFilter(null)} className="btn-secondary px-6">{t("menus.showAll")}</button>
        </div>
      ) : empty ? (
        <p className="py-12 text-center text-sm text-muted">
          {t(tab === "matches" ? "results.emptyNow" : "results.emptyBuy")}
        </p>
      ) : (
        groups.map(([title, list]) =>
          list.length === 0 ? null : (
            <section key={title} aria-label={title || undefined} className="mb-8">
              {title && <h2 className="mb-3 text-lg font-semibold">{title}</h2>}
              <ul className="flex flex-col gap-4">
                {list.map((m) => (
                  <li key={m.recipe.id}>
                    <RecipeCard recipe={m.recipe} match={m} hideReady={tab === "matches"} names={names} />
                  </li>
                ))}
              </ul>
            </section>
          ),
        )
      )}

      {tries > 1 && <p className="mt-4 text-center text-sm text-muted">{t("results.tries", { n: tries })}</p>}
    </>
  );
}
