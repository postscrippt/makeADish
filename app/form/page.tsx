"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import IngredientPicker from "@/components/IngredientPicker";
import { getIngredients, getProfile } from "@/mocks/api";
import { startSearch } from "@/app/draft";
import type { Ingredient, Profile } from "@/types/api";

// Typing ingredients by hand ("พิมพ์เอง"). Nothing to confirm here: the user is the one who chose every item.
// A link with ?ids= is the chat's [แก้ไข] button; editing lives on Results now, so it forwards there with the edit sheet open.
export default function FormPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<Ingredient[] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tags, setTags] = useState<Ingredient[]>([]);

  useEffect(() => {
    const ids = new URLSearchParams(location.search).get("ids");
    if (ids !== null) return router.replace(`/results?ids=${encodeURIComponent(ids)}&edit=1`);
    Promise.all([getIngredients(), getProfile()]).then(([list, prof]) => {
      setCatalog(list);
      setProfile(prof);
    });
  }, [router]);

  function submit() {
    if (!profile || tags.length === 0) return;
    startSearch(tags, profile);
    router.push("/results");
  }

  if (!catalog || !profile) {
    return (
      <>
        <PageHeader title="เพิ่มวัตถุดิบ" />
        <p role="status" className="p-4 text-sm text-muted">กำลังโหลด…</p>
      </>
    );
  }

  return (
    // Column fills the screen so the button bar sits at the bottom even when the list is short.
    <div className="flex min-h-dvh flex-col">
      <PageHeader title="เพิ่มวัตถุดิบ" />
      <main className="flex flex-1 flex-col gap-4 px-5 pt-6 pb-8">
        <IngredientPicker catalog={catalog} tags={tags} onChange={setTags} autoFocus />
      </main>

      <div className="sticky bottom-0 rounded-t-3xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-card">
        <button type="button" onClick={submit} disabled={tags.length === 0} className="btn-primary w-full text-base">
          {tags.length > 0 ? `หาเมนู จาก ${tags.length} อย่าง` : "เพิ่มวัตถุดิบก่อน"}
        </button>
      </div>
    </div>
  );
}
