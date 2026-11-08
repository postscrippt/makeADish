"use client";

import { useId, useRef } from "react";
import SearchForm from "@/components/SearchForm";
import { useDialog } from "@/components/useDialog";
import type { Ingredient, Option, SpiceLevel } from "@/types/api";

export { spiceLabels } from "@/components/SearchForm";

// The Results edit sheet: the shared SearchForm inside a bottom sheet. One button applies ingredients, allergies and spice.
// Mount it only while open, so each opening starts from the current values.
export default function SearchSheet({
  catalog, allergens, tags, allergies, spice, onApply, onClose,
}: {
  catalog: Ingredient[]; allergens: Option[]; tags: Ingredient[]; allergies: string[]; spice: SpiceLevel;
  onApply: (tags: Ingredient[], allergies: string[], spice: SpiceLevel) => void; onClose: () => void;
}) {
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);

  useDialog(sheetRef, onClose);

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
        <SearchForm
          layout="sheet"
          catalog={catalog}
          allergens={allergens}
          tags={tags}
          allergies={allergies}
          spice={spice}
          applyLabel={(n) => (n > 0 ? "ดูเมนูใหม่" : "เพิ่มวัตถุดิบก่อน")}
          onApply={onApply}
        />
      </div>
    </div>
  );
}
