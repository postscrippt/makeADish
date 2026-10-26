"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import PrefsSheet, { spiceLabels } from "@/components/PrefsSheet";
import { getIngredients, getOptions, getProfile, saveProfile } from "@/mocks/api";
import { readDraft, writeDraft } from "@/app/draft";
import type { Ingredient, Options, Profile, SpiceLevel } from "@/types/api";

// The check screen: one question ("is this what you have?"). Preferences are a saved one-liner; food type lives on Results.
export default function FormPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<Ingredient[]>([]);
  const [options, setOptions] = useState<Options | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tags, setTags] = useState<Ingredient[]>([]);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Load the catalog and pre-fill from the scan and the saved profile (browser-only data).
  useEffect(() => {
    Promise.all([getIngredients(), getOptions(), getProfile()]).then(([list, opts, prof]) => {
      const scanned = readDraft("ingredients") ?? [];
      setCatalog(list);
      setOptions(opts);
      setProfile(prof);
      setTags(scanned);
      setAdding(scanned.length === 0);
    });
  }, []);

  useEffect(() => {
    if (adding) searchRef.current?.focus();
  }, [adding, options]);

  const q = query.trim().toLowerCase();
  const suggestions = q
    ? catalog
        .filter((x) => !tags.some((t) => t.id === x.id))
        .filter((x) => [x.th, x.en, ...x.aliases].some((name) => name.toLowerCase().includes(q)))
        .slice(0, 6)
    : [];

  async function savePrefs(allergies: string[], spice: SpiceLevel) {
    const next = { ...profile!, allergies, spice };
    setProfile(next);
    setSheetOpen(false);
    await saveProfile(next);
  }

  function submit() {
    if (!profile || tags.length === 0) return;
    const { allergies, spice } = profile;
    writeDraft("ingredients", tags);
    writeDraft("search", { ingredientIds: tags.map((t) => t.id), spice, category: null, allergies });
    router.push("/results");
  }

  const title = tags.length > 0 ? `เจอวัตถุดิบ ${tags.length} อย่าง` : "เพิ่มวัตถุดิบ";

  if (!options || !profile) {
    return (
      <>
        <PageHeader title="ตรวจวัตถุดิบ" />
        <p role="status" className="p-4 text-sm text-muted">กำลังโหลด…</p>
      </>
    );
  }

  const allergyNames = options.allergens.filter((a) => profile.allergies.includes(a.id)).map((a) => a.th);

  return (
    // Column fills the screen so the "หาเมนู" bar sits at the bottom even when the list is short.
    <div className="flex min-h-dvh flex-col">
      <PageHeader title={title} />
      <main className="flex flex-1 flex-col gap-5 p-4 pb-8">
        <div>
          <h2 className="text-xl font-bold">ถูกต้องไหม?</h2>
          <p className="text-sm text-muted">แตะ × เพื่อลบ หรือเพิ่มที่ขาด</p>
        </div>

        <section aria-label="วัตถุดิบที่มี">
          <ul className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <li key={t.id} className="flex min-h-11 items-center rounded-full bg-butter pl-4 text-base font-medium">
                {t.th}
                <button
                  type="button"
                  aria-label={`ลบ ${t.th}`}
                  onClick={() => setTags(tags.filter((x) => x.id !== t.id))}
                  className="flex h-11 w-11 items-center justify-center text-lg text-ink/70"
                >
                  ×
                </button>
              </li>
            ))}
            {!adding && (
              <li>
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="min-h-11 rounded-full border-[1.5px] border-edge bg-white px-4 text-base text-muted"
                >
                  + เพิ่ม
                </button>
              </li>
            )}
          </ul>

          {adding && (
            <div className="mt-3">
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="พิมพ์ชื่อวัตถุดิบ เช่น ไก่, กระเทียม"
                aria-label="ค้นหาวัตถุดิบเพื่อเพิ่ม"
                className="min-h-11 w-full rounded-full border-[1.5px] border-edge bg-white px-4 text-base"
              />
              {q && (
                <ul className="mt-1 overflow-hidden rounded-2xl border border-edge bg-white shadow-card">
                  {suggestions.length === 0 && <li className="px-3 py-2 text-sm text-muted">ไม่พบวัตถุดิบนี้</li>}
                  {suggestions.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setTags([...tags, s]);
                          setQuery("");
                        }}
                        className="flex min-h-11 w-full items-center justify-between px-3 text-left active:bg-mist"
                      >
                        {s.th}
                        <span className="text-xs text-muted">{s.en}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        <section className="flex items-center gap-3 rounded-3xl bg-white py-2 pr-2 pl-4 shadow-card">
          <p className="flex-1 text-sm leading-relaxed">
            {allergyNames.length > 0 ? (
              <span className="font-semibold text-red-700">แพ้: {allergyNames.join(", ")}</span>
            ) : (
              <span className="text-muted">ยังไม่ได้ระบุอาหารที่แพ้</span>
            )}
            {" · "}
            {spiceLabels[profile.spice]}
          </p>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="min-h-11 shrink-0 rounded-full px-3 font-semibold text-brand-deep active:bg-mist"
          >
            {allergyNames.length > 0 ? "แก้ไข" : "ตั้งค่า"}
          </button>
        </section>
      </main>

      <div className="sticky bottom-0 rounded-t-3xl bg-white p-4 shadow-card">
        <button type="button" onClick={submit} disabled={tags.length === 0} className="btn-primary w-full text-base">
          หาเมนู
        </button>
      </div>

      {sheetOpen && (
        <PrefsSheet
          allergens={options.allergens}
          allergies={profile.allergies}
          spice={profile.spice}
          onSave={savePrefs}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  );
}
