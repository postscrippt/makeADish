"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Chip from "@/components/Chip";
import RecipeCard from "@/components/RecipeCard";
import { getOptions, getProfile, listRecipes } from "@/mocks/api";
import type { Option, RecipeSummary } from "@/types/api";

type Loaded = { recipes: RecipeSummary[]; categories: Option[]; hiddenFor: string[] };

export default function MenusPage() {
  const [data, setData] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    getProfile()
      .then(async (profile) => {
        const [recipes, options] = await Promise.all([listRecipes(profile.allergies), getOptions()]);
        const hiddenFor = options.allergens.filter((a) => profile.allergies.includes(a.id)).map((a) => a.th);
        setData({ recipes, categories: options.categories, hiddenFor });
      })
      .catch(() => setFailed(true));
  }, []);

  if (failed) return <Shell><p role="alert" className="p-5 text-red-700">โหลดเมนูไม่สำเร็จ ลองใหม่อีกครั้งนะ</p></Shell>;
  if (!data) return <Shell><p role="status" className="p-5 text-sm text-muted">กำลังโหลด…</p></Shell>;

  const q = query.trim().toLowerCase();
  const categoryName = (id: string) => data.categories.find((c) => c.id === id)?.th ?? "";
  const shown = data.recipes.filter(
    (r) => (category === null || r.category === category) && (!q || r.th.includes(q) || r.en.toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHeader title="เมนูทั้งหมด">
        <h2 className="text-3xl leading-tight font-bold text-butter">อยากทำอะไรดี?</h2>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาเมนู เช่น กะเพรา, ต้มยำ"
          aria-label="ค้นหาเมนู"
          className="mt-4 min-h-12 w-full rounded-full bg-white px-5 text-base text-ink"
        />
        <div role="group" aria-label="ประเภทอาหาร" className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none]">
          <Chip selected={category === null} onClick={() => setCategory(null)}>ทั้งหมด</Chip>
          {data.categories.map((c) => (
            <Chip key={c.id} selected={category === c.id} onClick={() => setCategory(c.id)}>
              {c.th}
            </Chip>
          ))}
        </div>
      </PageHeader>
      <main className="flex flex-col gap-4 px-5 pt-6 pb-10">
        <p className="text-sm text-muted">
          {shown.length} เมนู
          {data.hiddenFor.length > 0 && ` · ซ่อนเมนูที่มี ${data.hiddenFor.join(", ")} ตามที่คุณแพ้`}
        </p>

        {shown.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-muted">ไม่พบเมนูที่ค้นหา</p>
            <button type="button" onClick={() => { setQuery(""); setCategory(null); }} className="btn-secondary px-6">ดูทั้งหมด</button>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {shown.map((r) => (
              <li key={r.id}>
                <RecipeCard recipe={r} category={categoryName(r.category)} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHeader title="เมนูทั้งหมด" />
      {children}
    </>
  );
}
