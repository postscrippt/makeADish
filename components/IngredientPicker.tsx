"use client";

import { useEffect, useRef, useState } from "react";
import { searchIngredients } from "@/app/ingredientSearch";
import { groupByCategory } from "@/app/ingredientCategories";
import { useLang } from "@/app/lang";
import { localName } from "@/app/text";
import type { Ingredient } from "@/types/api";

// One-tap adds; ids missing from the catalog are skipped.
const QUICK_IDS = ["pork", "chicken", "egg", "garlic", "chili", "holy-basil", "onion", "tomato", "rice", "tofu"];

// Chosen ingredients as removable chips, a search box with live suggestions (it forgives typos), quick-add chips,
// and a list of everything for someone who doesn't know the name.
// Used on the manual-entry page and inside the Results edit sheet. The search stays focused after each add,
// so the phone keyboard stays up for the next ingredient.
export default function IngredientPicker({
  catalog, tags, onChange, autoFocus = false,
}: { catalog: Ingredient[]; tags: Ingredient[]; onChange: (tags: Ingredient[]) => void; autoFocus?: boolean }) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const { lang, t } = useLang();

  useEffect(() => {
    if (autoFocus) searchRef.current?.focus();
  }, [autoFocus]);

  const q = query.trim();
  const free = catalog.filter((x) => !tags.some((tag) => tag.id === x.id));
  const suggestions = searchIngredients(catalog, q, tags);
  const quick = QUICK_IDS.flatMap((id) => free.find((x) => x.id === id) ?? []);

  function add(item: Ingredient) {
    onChange([...tags, item]);
    setQuery("");
    searchRef.current?.focus();
  }

  return (
    <div className="flex flex-col gap-3">
      {tags.length > 0 && (
        <ul aria-label={t("picker.selected")} className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag.id} className="flex min-h-11 items-center rounded-full bg-butter pl-4 text-base font-medium">
              {localName(tag, lang)}
              <button type="button" aria-label={t("picker.remove", { name: localName(tag, lang) })} onClick={() => onChange(tags.filter((x) => x.id !== tag.id))} className="flex h-11 w-11 items-center justify-center text-lg text-ink/70">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div>
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && suggestions[0]) add(suggestions[0]);
          }}
          enterKeyHint="done"
          placeholder={t("picker.placeholder")}
          aria-label={t("picker.searchLabel")}
          className="min-h-12 w-full rounded-full border-[1.5px] border-edge bg-white px-5 text-base"
        />
        {q && (
          <ul className="mt-2 overflow-hidden rounded-2xl bg-white shadow-card">
            {suggestions.length === 0 && (
              <li className="flex flex-col items-start gap-1 px-4 py-3">
                <p className="text-sm text-muted">{t("picker.notFound", { q })}</p>
                <button type="button" onClick={() => { setQuery(""); setShowAll(true); }} className="flex min-h-11 items-center font-semibold text-brand-deep">
                  {t("picker.seeAll")}
                </button>
              </li>
            )}
            {suggestions.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => add(s)} className="flex min-h-12 w-full items-center justify-between px-4 text-left active:bg-mist">
                  {localName(s, lang)}
                  {lang === "th" && <span className="text-sm text-muted">{s.en}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!q && !showAll && quick.length > 0 && (
        <div>
          <p className="mb-2 text-sm text-muted">{t("picker.quickAdd")}</p>
          <ul className="flex flex-wrap gap-2">
            {quick.map((x) => (
              <li key={x.id}>
                <button type="button" onClick={() => add(x)} className="min-h-11 rounded-full border-[1.5px] border-edge bg-white px-4 text-base active:bg-butter-soft">
                  + {localName(x, lang)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!q && free.length > 0 && (
        <div>
          <button type="button" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll} className="flex min-h-11 items-center font-semibold text-brand-deep">
            {showAll ? t("picker.hideList") : t("picker.seeAllCount", { n: free.length })}
          </button>
          {showAll && (
            <div className="mt-1 flex flex-col gap-4">
              {groupByCategory(free).map((g) => (
                <section key={g.id} aria-label={g[lang]}>
                  <h4 className="mb-2 text-sm text-muted">{g[lang]}</h4>
                  <ul className="flex flex-wrap gap-2">
                    {g.items.map((x) => (
                      <li key={x.id}>
                        <button type="button" onClick={() => add(x)} className="min-h-11 rounded-full border-[1.5px] border-edge bg-white px-4 text-base active:bg-mist">
                          + {localName(x, lang)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
