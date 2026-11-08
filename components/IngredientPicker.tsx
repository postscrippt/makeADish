"use client";

import { useEffect, useRef, useState } from "react";
import type { Ingredient } from "@/types/api";

// One-tap adds; ids missing from the catalog are skipped.
const QUICK_IDS = ["pork", "chicken", "egg", "garlic", "chili", "holy-basil"];

// Chosen ingredients as removable chips, a search box with live suggestions, and quick-add chips.
// Used on the manual-entry page and inside the Results edit sheet. The search stays focused after each add,
// so the phone keyboard stays up for the next ingredient.
export default function IngredientPicker({
  catalog, tags, onChange, autoFocus = false,
}: { catalog: Ingredient[]; tags: Ingredient[]; onChange: (tags: Ingredient[]) => void; autoFocus?: boolean }) {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) searchRef.current?.focus();
  }, [autoFocus]);

  const q = query.trim().toLowerCase();
  const free = catalog.filter((x) => !tags.some((t) => t.id === x.id));
  const suggestions = q ? free.filter((x) => [x.th, x.en, ...x.aliases].some((name) => name.toLowerCase().includes(q))).slice(0, 6) : [];
  const quick = QUICK_IDS.flatMap((id) => free.find((x) => x.id === id) ?? []);

  function add(item: Ingredient) {
    onChange([...tags, item]);
    setQuery("");
    searchRef.current?.focus();
  }

  return (
    <div className="flex flex-col gap-3">
      {tags.length > 0 && (
        <ul aria-label="วัตถุดิบที่เลือก" className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <li key={t.id} className="flex min-h-11 items-center rounded-full bg-butter pl-4 text-base font-medium">
              {t.th}
              <button type="button" aria-label={`ลบ ${t.th}`} onClick={() => onChange(tags.filter((x) => x.id !== t.id))} className="flex h-11 w-11 items-center justify-center text-lg text-ink/70">
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
          placeholder="พิมพ์ชื่อวัตถุดิบ เช่น ไก่, กระเทียม"
          aria-label="ค้นหาวัตถุดิบเพื่อเพิ่ม"
          className="min-h-12 w-full rounded-full border-[1.5px] border-edge bg-white px-5 text-base"
        />
        {q && (
          <ul className="mt-2 overflow-hidden rounded-2xl bg-white shadow-card">
            {suggestions.length === 0 && <li className="px-4 py-3 text-sm text-muted">ไม่พบวัตถุดิบนี้</li>}
            {suggestions.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => add(s)} className="flex min-h-12 w-full items-center justify-between px-4 text-left active:bg-mist">
                  {s.th}
                  <span className="text-xs text-muted">{s.en}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!q && quick.length > 0 && (
        <div>
          <p className="mb-2 text-sm text-muted">เพิ่มเร็ว</p>
          <ul className="flex flex-wrap gap-2">
            {quick.map((x) => (
              <li key={x.id}>
                <button type="button" onClick={() => add(x)} className="min-h-11 rounded-full border-[1.5px] border-edge bg-white px-4 text-base active:bg-butter-soft">
                  + {x.th}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
