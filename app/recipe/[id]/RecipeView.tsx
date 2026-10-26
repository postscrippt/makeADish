"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Stepper from "@/components/Stepper";
import { getFavorites, getOptions, getProfile, getRecipe, logCooked, setFavorite } from "@/mocks/api";
import { readDraft } from "@/app/draft";
import { scaleQty } from "@/app/recipe/scale";
import type { HistoryEntry, Recipe } from "@/types/api";

type Rating = HistoryEntry["rating"];
type Loaded = { recipe: Recipe | null; have: Set<string> | null; allergic: string[] };

export default function RecipeView({ id, fromSearch }: { id: string; fromSearch: boolean }) {
  const [data, setData] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);
  const [servings, setServings] = useState(1);
  const [favorite, setFav] = useState(false);
  const [rating, setRating] = useState<Rating | null>(null);
  const [cooking, setCooking] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([getRecipe(id), getFavorites(), getProfile(), getOptions()])
      .then(([recipe, favorites, profile, options]) => {
        // Only mark missing items when opened from Results; Menus, History and Ask have no pantry.
        const search = fromSearch ? readDraft("search") : null;
        const have = search ? new Set(search.ingredientIds) : null;
        // A saved dish can contain an allergy added later (e.g. a favorite), so warn instead of hiding.
        const allergic = options.allergens
          .filter((a) => profile.allergies.includes(a.id) && recipe?.allergens?.includes(a.id))
          .map((a) => a.th);
        setServings(search?.servings ?? recipe?.baseServings ?? 1);
        setFav(favorites.some((f) => f.id === id));
        setData({ recipe, have, allergic });
      })
      .catch(() => setFailed(true));
  }, [id, fromSearch]);

  if (failed) return <p role="alert" className="p-4 text-red-700">โหลดสูตรไม่สำเร็จ กรุณาลองใหม่</p>;
  if (!data) return <p role="status" className="p-4 text-sm text-zinc-500">กำลังโหลด…</p>;

  const { recipe, have, allergic } = data;
  if (!recipe) {
    return (
      <div className="flex flex-col items-center gap-4 p-4 py-16 text-center">
        <p className="text-zinc-600">ไม่พบสูตรอาหารนี้</p>
        <Link href="/" className="underline">กลับหน้าหลัก</Link>
      </div>
    );
  }

  const factor = servings / recipe.baseServings;
  const missing = have ? recipe.ingredients.filter((x) => !have.has(x.id)) : [];

  function toggleFavorite() {
    setFav(!favorite);
    setFavorite({ id: recipe!.id, th: recipe!.th }, !favorite);
  }

  async function save() {
    if (!rating) return;
    await logCooked({ recipeId: recipe!.id, th: recipe!.th, rating, cookedAt: new Date().toISOString() });
    setSaved(true);
  }

  return (
    <main className="flex flex-col gap-6 p-4 pb-10">
      <section className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">{recipe.th}</h2>
          <p className="text-sm text-zinc-500">
            {recipe.en} · {recipe.minutes} นาที
            {recipe.spice > 0 && <span aria-label={`ความเผ็ดระดับ ${recipe.spice}`}> · {"🌶".repeat(recipe.spice)}</span>}
          </p>
        </div>
        <button
          type="button"
          aria-pressed={favorite}
          aria-label="เมนูโปรด"
          onClick={toggleFavorite}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-xl ${favorite ? "border-red-300 bg-red-50 text-red-500" : "border-zinc-300 text-zinc-400"}`}
        >
          {favorite ? "♥" : "♡"}
        </button>
      </section>

      {allergic.length > 0 && (
        <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-700">
          ⚠ เมนูนี้มี {allergic.join(", ")} ที่คุณแพ้
        </p>
      )}

      {missing.length > 0 && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          ต้องซื้อเพิ่ม: {missing.map((m) => m.th).join(", ")}
        </p>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">วัตถุดิบ</h3>
          <Stepper value={servings} onChange={setServings} unit="ที่" />
        </div>
        <ul className="divide-y divide-zinc-100">
          {recipe.ingredients.map((x) => {
            const isMissing = missing.includes(x);
            return (
              <li key={x.id} className="flex min-h-11 items-center justify-between gap-3 py-2">
                <span>
                  {x.th}
                  {isMissing && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">ขาด</span>}
                </span>
                <span className="text-zinc-600">{scaleQty(x.qty, factor)}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 font-semibold">วิธีทำ</h3>
        <ol className="flex flex-col gap-3">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-line/20 text-sm font-semibold">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-zinc-200 p-4">
        {saved ? (
          <p role="status" className="text-center">
            บันทึกลงประวัติแล้ว ·{" "}
            <Link href="/history" className="underline">ดูประวัติ</Link>
          </p>
        ) : !cooking ? (
          <button
            type="button"
            onClick={() => setCooking(true)}
            className="min-h-12 w-full rounded-xl bg-line font-semibold text-zinc-900"
          >
            ทำเมนูนี้แล้ว
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="font-medium">อร่อยแค่ไหน?</p>
            <div role="radiogroup" aria-label="ให้คะแนน" className="flex gap-1">
              {([1, 2, 3, 4, 5] as Rating[]).map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} ดาว`}
                  onClick={() => setRating(n)}
                  className={`h-11 w-11 text-3xl ${rating && n <= rating ? "text-amber-400" : "text-zinc-300"}`}
                >
                  ★
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={save}
              disabled={!rating}
              className="min-h-12 w-full rounded-xl bg-line font-semibold text-zinc-900 disabled:bg-zinc-200 disabled:text-zinc-400"
            >
              บันทึก
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
