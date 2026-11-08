"use client";

import { useEffect, useId, useRef, useState } from "react";
import Chip from "@/components/Chip";
import IngredientPicker from "@/components/IngredientPicker";
import type { Ingredient, Option, SpiceLevel } from "@/types/api";

export const spiceLabels = ["ไม่เผ็ด", "เผ็ดน้อย", "เผ็ดกลาง", "เผ็ดมาก"];

// The one place to change what a search is based on: ingredients, allergies, spice. One button applies all three.
// Mount it only while open, so each opening starts from the current values.
export default function SearchSheet({
  catalog, allergens, tags, allergies, spice, onApply, onClose,
}: {
  catalog: Ingredient[]; allergens: Option[]; tags: Ingredient[]; allergies: string[]; spice: SpiceLevel;
  onApply: (tags: Ingredient[], allergies: string[], spice: SpiceLevel) => void; onClose: () => void;
}) {
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [picked, setPicked] = useState(tags);
  const [allergic, setAllergic] = useState(allergies);
  const [level, setLevel] = useState(spice);

  // Focus moves in on open, and back to the trigger on close.
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    sheetRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id: string) => setAllergic((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center">
      <div aria-hidden className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex max-h-[92dvh] w-full max-w-[430px] flex-col rounded-t-3xl bg-white shadow-card outline-none"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 px-5 pt-4">
          <h2 id={titleId} className="text-xl font-bold">แก้การค้นหา</h2>
          <button type="button" onClick={onClose} aria-label="ปิด" className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl text-muted active:bg-mist">
            ×
          </button>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto px-5 pt-3 pb-5">
          <section>
            <h3 className="mb-2 font-semibold">วัตถุดิบ</h3>
            <IngredientPicker catalog={catalog} tags={picked} onChange={setPicked} />
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

        <div className="shrink-0 border-t border-edge p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button type="button" onClick={() => onApply(picked, allergic, level)} disabled={picked.length === 0} className="btn-primary w-full text-base">
            {picked.length > 0 ? "ดูเมนูใหม่" : "เพิ่มวัตถุดิบก่อน"}
          </button>
        </div>
      </div>
    </div>
  );
}
