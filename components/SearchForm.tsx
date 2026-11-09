"use client";

import { useState } from "react";
import Chip from "@/components/Chip";
import IngredientPicker from "@/components/IngredientPicker";
import { useLang } from "@/app/lang";
import { allergenName, type Lang } from "@/app/text";
import type { Ingredient, Option, SpiceLevel } from "@/types/api";

// The level is a ceiling ("up to this", docs/api-contract.md), so the top one removes the limit: every dish shows.
export const ANY_SPICE: SpiceLevel = 3;
export const spiceLabels: Record<Lang, string[]> = {
  th: ["ไม่เผ็ด", "เผ็ดน้อย", "เผ็ดกลาง", "ทุกระดับ"],
  en: ["Not spicy", "Mild", "Medium", "Any level"],
};

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
  const { lang, t } = useLang();

  return (
    <>
      <div className={sheet ? "flex flex-col gap-6 overflow-y-auto px-5 pt-3 pb-5" : "flex flex-1 flex-col gap-6 px-5 pt-6 pb-8"}>
        <section>
          <h3 className="mb-2 font-semibold">{t("search.ingredients")}</h3>
          <IngredientPicker catalog={catalog} tags={picked} onChange={setPicked} autoFocus={autoFocus} />
        </section>
        <section>
          <h3 className="mb-1 font-semibold">{t("search.allergies")}</h3>
          <p className="mb-2 text-sm text-muted">{t("search.allergiesHint")}</p>
          <div className="flex flex-wrap gap-2">
            {allergens.map((a) => (
              <Chip key={a.id} danger selected={allergic.includes(a.id)} onClick={() => toggle(a.id)}>
                {allergenName(a, lang)}
              </Chip>
            ))}
          </div>
        </section>
        <section>
          <h3 className="mb-1 font-semibold">{t("search.spice")}</h3>
          <p className="mb-2 text-sm text-muted">{t("search.spiceHint")}</p>
          <div className="flex flex-wrap gap-2">
            {spiceLabels[lang].map((label, n) => (
              <Chip key={label} selected={level === n} onClick={() => setLevel(level === n ? ANY_SPICE : (n as SpiceLevel))}>
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
