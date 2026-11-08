"use client";

import { useState } from "react";
import Chip from "@/components/Chip";
import IngredientPicker from "@/components/IngredientPicker";
import type { Ingredient, Option, SpiceLevel } from "@/types/api";

export const spiceLabels = ["ไม่เผ็ด", "เผ็ดน้อย", "เผ็ดกลาง", "เผ็ดมาก"];

// Everything a search is based on, in one place: ingredients, allergies, spice, and one button to apply them.
// The Results edit sheet and the typed-entry page (/form) both render this, so picking and editing are the same screen.
// A manual pick has no confirm card to show allergies first, so they sit right here.
// "sheet" lays it out inside a bottom sheet (scrolling body, bordered bar); "page" as a full page with a pinned bar.
export default function SearchForm({
  layout, catalog, allergens, tags, allergies, spice, applyLabel, onApply, autoFocus = false,
}: {
  layout: "sheet" | "page"; catalog: Ingredient[]; allergens: Option[]; tags: Ingredient[]; allergies: string[]; spice: SpiceLevel;
  applyLabel: (count: number) => string;
  onApply: (tags: Ingredient[], allergies: string[], spice: SpiceLevel) => void; autoFocus?: boolean;
}) {
  const [picked, setPicked] = useState(tags);
  const [allergic, setAllergic] = useState(allergies);
  const [level, setLevel] = useState(spice);
  const toggle = (id: string) => setAllergic((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const sheet = layout === "sheet";

  return (
    <>
      <div className={sheet ? "flex flex-col gap-6 overflow-y-auto px-5 pt-3 pb-5" : "flex flex-1 flex-col gap-6 px-5 pt-6 pb-8"}>
        <section>
          <h3 className="mb-2 font-semibold">วัตถุดิบ</h3>
          <IngredientPicker catalog={catalog} tags={picked} onChange={setPicked} autoFocus={autoFocus} />
        </section>
        <section>
          <h3 className="mb-1 font-semibold">แพ้อาหาร</h3>
          <p className="mb-2 text-sm text-muted">เมนูที่มีวัตถุดิบเหล่านี้จะไม่แสดงเลย</p>
          <div className="flex flex-wrap gap-2">
            {allergens.map((a) => (
              <Chip key={a.id} danger selected={allergic.includes(a.id)} onClick={() => toggle(a.id)}>
                {a.th}
              </Chip>
            ))}
          </div>
        </section>
        <section>
          <h3 className="mb-2 font-semibold">ระดับความเผ็ด</h3>
          <div className="flex flex-wrap gap-2">
            {spiceLabels.map((label, n) => (
              <Chip key={label} selected={level === n} onClick={() => setLevel(n as SpiceLevel)}>
                {label}
              </Chip>
            ))}
          </div>
        </section>
      </div>

      <div
        className={
          sheet
            ? "shrink-0 border-t border-edge p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            : "sticky bottom-0 rounded-t-3xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-card"
        }
      >
        <button type="button" onClick={() => onApply(picked, allergic, level)} disabled={picked.length === 0} className="btn-primary w-full text-base">
          {applyLabel(picked.length)}
        </button>
      </div>
    </>
  );
}
