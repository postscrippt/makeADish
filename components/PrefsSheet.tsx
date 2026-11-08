"use client";

import { useEffect, useId, useRef, useState } from "react";
import Chip from "@/components/Chip";
import type { Option, SpiceLevel } from "@/types/api";

export const spiceLabels = ["ไม่เผ็ด", "เผ็ดน้อย", "เผ็ดกลาง", "เผ็ดมาก"];

// Bottom sheet for the saved preferences (allergies, spice). Set once, edited only when needed.
// Mount it only while open, so each opening starts from the saved values.
export default function PrefsSheet({
  allergens, allergies, spice, onSave, onClose,
}: {
  allergens: Option[]; allergies: string[]; spice: SpiceLevel;
  onSave: (allergies: string[], spice: SpiceLevel) => void; onClose: () => void;
}) {
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [picked, setPicked] = useState(allergies);
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

  const toggle = (id: string) => setPicked((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center">
      <div aria-hidden className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex max-h-[90dvh] w-full max-w-[430px] flex-col gap-5 overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-card outline-none"
      >
        {/* A visible close: phones have no Escape key, and the backdrop is easy to miss. */}
        <div className="-mt-1 flex items-center justify-between gap-2">
          <h2 id={titleId} className="text-xl font-bold">อาหารที่แพ้และความเผ็ด</h2>
          <button type="button" onClick={onClose} aria-label="ปิด" className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl text-muted active:bg-mist">
            ×
          </button>
        </div>
        <section>
          <h3 className="mb-1 font-semibold">แพ้อาหาร</h3>
          <p className="mb-2 text-sm text-muted">เมนูที่มีวัตถุดิบเหล่านี้จะไม่แสดงเลย</p>
          <div className="flex flex-wrap gap-2">
            {allergens.map((a) => (
              <Chip key={a.id} danger selected={picked.includes(a.id)} onClick={() => toggle(a.id)}>
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
        <div className="flex gap-2">
          {picked.length > 0 && (
            <button type="button" onClick={() => setPicked([])} className="btn-secondary">
              ล้างที่แพ้
            </button>
          )}
          <button type="button" onClick={() => onSave(picked, level)} className="btn-primary flex-1">
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
