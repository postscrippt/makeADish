"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import SearchForm from "@/components/SearchForm";
import { getIngredients, getOptions, getProfile, saveProfile } from "@/mocks/api";
import { startSearch } from "@/app/draft";
import type { Ingredient, Options, Profile, SpiceLevel } from "@/types/api";

type Loaded = { catalog: Ingredient[]; profile: Profile; options: Options };

// Typing ingredients by hand ("พิมพ์เอง"). It is the same form as the Results edit sheet (SearchForm), so picking and
// editing are one screen. The user chose every item, so there is nothing to confirm; allergies sit right here because
// no confirm card showed them first.
// A link with ?ids= is the chat's [แก้ไข] button; editing lives on Results, so it forwards there with the sheet open.
export default function FormPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [syncFailed, setSyncFailed] = useState(false);

  useEffect(() => {
    const ids = new URLSearchParams(location.search).get("ids");
    if (ids !== null) return router.replace(`/results?ids=${encodeURIComponent(ids)}&edit=1`);
    Promise.all([getIngredients(), getProfile(), getOptions()]).then(([catalog, profile, options]) => setLoaded({ catalog, profile, options }));
  }, [router]);

  async function submit(tags: Ingredient[], allergies: string[], spice: SpiceLevel) {
    if (!loaded || tags.length === 0) return;
    const { profile } = loaded;
    const next = { ...profile, allergies, spice };
    setSyncFailed(false);
    // The chat filters by the saved profile, so a failed save must be seen here: Results is a different page.
    if (allergies.join() !== profile.allergies.join() || spice !== profile.spice) {
      try {
        await saveProfile(next);
      } catch {
        return setSyncFailed(true);
      }
    }
    startSearch(tags, next);
    router.push("/results");
  }

  if (!loaded) {
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
      {syncFailed && (
        <p role="alert" className="mx-5 mt-4 rounded-2xl bg-white p-3 text-sm text-red-700">บันทึกไปที่แชทไม่สำเร็จ แชทอาจยังไม่รู้ว่าคุณแพ้อะไร ลองกดค้นหาอีกครั้ง</p>
      )}
      <SearchForm
        layout="page"
        catalog={loaded.catalog}
        allergens={loaded.options.allergens}
        tags={[]}
        allergies={loaded.profile.allergies}
        spice={loaded.profile.spice}
        applyLabel={(n) => (n > 0 ? `หาเมนู จาก ${n} อย่าง` : "เพิ่มวัตถุดิบก่อน")}
        onApply={submit}
        autoFocus
      />
    </div>
  );
}
