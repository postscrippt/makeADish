"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Chip from "@/components/Chip";
import { getIngredients, getOptions, getProfile, saveProfile } from "@/mocks/api";
import { readDraft, writeDraft } from "@/app/draft";
import type { Ingredient, Options, Profile, SpiceLevel } from "@/types/api";

const spiceLabels = ["ไม่เผ็ด", "เผ็ดน้อย", "เผ็ดกลาง", "เผ็ดมาก"];

export default function FormPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<Ingredient[]>([]);
  const [options, setOptions] = useState<Options | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tags, setTags] = useState<Ingredient[]>([]);
  const [query, setQuery] = useState("");
  const [spice, setSpice] = useState<SpiceLevel>(1);
  const [category, setCategory] = useState<string | null>(null);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [servings, setServings] = useState(2);

  // Load the catalog and pre-fill from the scan and the saved profile (browser-only data).
  useEffect(() => {
    Promise.all([getIngredients(), getOptions(), getProfile()]).then(([list, opts, prof]) => {
      setCatalog(list);
      setOptions(opts);
      setProfile(prof);
      setTags(readDraft("ingredients") ?? []);
      setSpice(prof.spice);
      setAllergies(prof.allergies);
      setServings(prof.servings);
    });
  }, []);

  const q = query.trim().toLowerCase();
  const suggestions = q
    ? catalog
        .filter((x) => !tags.some((t) => t.id === x.id))
        .filter((x) => [x.th, x.en, ...x.aliases].some((name) => name.toLowerCase().includes(q)))
        .slice(0, 6)
    : [];

  function toggleAllergy(id: string) {
    setAllergies((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  }

  async function submit() {
    if (!profile || tags.length === 0) return;
    await saveProfile({ ...profile, allergies, spice, servings });
    writeDraft("ingredients", tags);
    writeDraft("search", { ingredientIds: tags.map((t) => t.id), spice, category, allergies, servings });
    router.push("/results");
  }

  if (!options) {
    return (
      <>
        <PageHeader title="เลือกเงื่อนไข" />
        <p role="status" className="p-4 text-sm text-zinc-500">กำลังโหลด…</p>
      </>
    );
  }

  return (
    <>
      <PageHeader title="เลือกเงื่อนไข" />
      <main className="flex flex-col gap-6 p-4 pb-24">
        <section>
          <h2 className="mb-2 font-semibold">วัตถุดิบที่มี</h2>
          {tags.length === 0 && <p className="mb-2 text-sm text-zinc-500">ยังไม่มีวัตถุดิบ พิมพ์ค้นหาด้านล่างเพื่อเพิ่ม</p>}
          <ul className="mb-3 flex flex-wrap gap-2">
            {tags.map((t) => (
              <li key={t.id} className="flex items-center rounded-full bg-zinc-100 pl-3 text-sm">
                {t.th}
                <button
                  type="button"
                  aria-label={`ลบ ${t.th}`}
                  onClick={() => setTags(tags.filter((x) => x.id !== t.id))}
                  className="flex h-9 w-9 items-center justify-center text-zinc-500"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="+ เพิ่มวัตถุดิบ เช่น ไก่, กระเทียม"
            aria-label="ค้นหาวัตถุดิบเพื่อเพิ่ม"
            className="min-h-11 w-full rounded-xl border border-zinc-300 px-3 text-base"
          />
          {q && (
            <ul className="mt-1 overflow-hidden rounded-xl border border-zinc-200">
              {suggestions.length === 0 && <li className="px-3 py-2 text-sm text-zinc-500">ไม่พบวัตถุดิบนี้</li>}
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setTags([...tags, s]);
                      setQuery("");
                    }}
                    className="flex min-h-11 w-full items-center justify-between px-3 text-left active:bg-zinc-100"
                  >
                    {s.th}
                    <span className="text-xs text-zinc-400">{s.en}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-1 font-semibold">แพ้อาหาร</h2>
          <p className="mb-2 text-xs text-zinc-500">เมนูที่มีวัตถุดิบเหล่านี้จะไม่แสดงเลย</p>
          <div className="flex flex-wrap gap-2">
            {options.allergens.map((a) => (
              <Chip key={a.id} danger selected={allergies.includes(a.id)} onClick={() => toggleAllergy(a.id)}>
                {a.th}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 font-semibold">ระดับความเผ็ด</h2>
          <div className="flex flex-wrap gap-2">
            {spiceLabels.map((label, level) => (
              <Chip key={label} selected={spice === level} onClick={() => setSpice(level as SpiceLevel)}>
                {label}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 font-semibold">ประเภทอาหาร</h2>
          <div className="flex flex-wrap gap-2">
            <Chip selected={category === null} onClick={() => setCategory(null)}>
              ทั้งหมด
            </Chip>
            {options.categories.map((c) => (
              <Chip key={c.id} selected={category === c.id} onClick={() => setCategory(c.id)}>
                {c.th}
              </Chip>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-between">
          <h2 className="font-semibold">จำนวนที่ทาน</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="ลดจำนวน"
              onClick={() => setServings(Math.max(1, servings - 1))}
              className="h-11 w-11 rounded-full border border-zinc-300 text-xl"
            >
              −
            </button>
            <span aria-live="polite" className="w-14 text-center">{servings} ที่</span>
            <button
              type="button"
              aria-label="เพิ่มจำนวน"
              onClick={() => setServings(Math.min(12, servings + 1))}
              className="h-11 w-11 rounded-full border border-zinc-300 text-xl"
            >
              +
            </button>
          </div>
        </section>
      </main>

      <div className="sticky bottom-0 border-t border-zinc-200 bg-white p-4">
        <button
          type="button"
          onClick={submit}
          disabled={tags.length === 0}
          className="min-h-12 w-full rounded-xl bg-line text-base font-semibold text-zinc-900 disabled:bg-zinc-200 disabled:text-zinc-400"
        >
          หาเมนู
        </button>
      </div>
    </>
  );
}
