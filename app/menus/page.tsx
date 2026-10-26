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

  if (failed) return <Shell><p role="alert" className="p-4 text-red-700">โหลดเมนูไม่สำเร็จ ลองใหม่อีกครั้งนะ</p></Shell>;
  if (!data) return <Shell><p role="status" className="p-4 text-sm text-zinc-500">กำลังโหลด…</p></Shell>;

  const q = query.trim().toLowerCase();
  const categoryName = (id: string) => data.categories.find((c) => c.id === id)?.th ?? "";
  const shown = data.recipes.filter(
    (r) => (category === null || r.category === category) && (!q || r.th.includes(q) || r.en.toLowerCase().includes(q)),
  );

  return (
    <Shell>
      <main className="flex flex-col gap-3 p-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาเมนู เช่น กะเพรา, ต้มยำ"
          aria-label="ค้นหาเมนู"
          className="min-h-11 w-full rounded-xl border border-zinc-300 px-3 text-base"
        />
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <Chip selected={category === null} onClick={() => setCategory(null)}>ทั้งหมด</Chip>
          {data.categories.map((c) => (
            <Chip key={c.id} selected={category === c.id} onClick={() => setCategory(c.id)}>
              {c.th}
            </Chip>
          ))}
        </div>
        {data.hiddenFor.length > 0 && (
          <p className="text-xs text-zinc-500">ซ่อนเมนูที่มี {data.hiddenFor.join(", ")} ตามที่คุณแพ้</p>
        )}

        {shown.length === 0 ? (
          <p className="py-12 text-center text-sm text-zinc-500">ไม่พบเมนูที่ค้นหา</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {shown.map((r) => (
              <li key={r.id}>
                <RecipeCard recipe={r} category={categoryName(r.category)} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </Shell>
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
