"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import StepsTimeline from "@/components/StepsTimeline";
import { getFavorites, getOptions, getProfile, getRecipe, getSubstitutes, logCooked, setFavorite } from "@/mocks/api";
import { readDraft } from "@/app/draft";
import type { HistoryEntry, Recipe, RecipeIngredient } from "@/types/api";
import type { SwapResult } from "@/app/recipe/swaps";
import { recipeCard } from "@/app/recipe/recipeCard";
import { canSendToChat, canShare, closeToChat, inLineApp, liffUrl, sendToChat, shareToFriends } from "@/app/liff";

type Rating = HistoryEntry["rating"];
type Loaded = { recipe: Recipe | null; have: Set<string> | null; allergic: string[]; allergies: string[] };

export default function RecipeView({ id, fromSearch }: { id: string; fromSearch: boolean }) {
  const [data, setData] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);
  const [favorite, setFav] = useState(false);
  const [rating, setRating] = useState<Rating | null>(null);
  const [cooking, setCooking] = useState(false);
  const [saved, setSaved] = useState(false);
  const ratingRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (cooking) ratingRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [cooking]);

  useEffect(() => {
    Promise.all([getRecipe(id), getFavorites(), getProfile(), getOptions()])
      .then(([recipe, favorites, profile, options]) => {
        // Only mark missing items when opened from Results; Menus and History have no pantry.
        const search = fromSearch ? readDraft("search") : null;
        const have = search ? new Set(search.ingredientIds) : null;
        // A saved dish can contain an allergy added later (e.g. a favorite), so warn instead of hiding.
        const allergic = options.allergens
          .filter((a) => profile.allergies.includes(a.id) && recipe?.allergens?.includes(a.id))
          .map((a) => a.th);
        setFav(favorites.some((f) => f.id === id));
        setData({ recipe, have, allergic, allergies: profile.allergies });
      })
      .catch(() => setFailed(true));
  }, [id, fromSearch]);

  if (failed) return <p role="alert" className="p-4 text-red-700">โหลดสูตรไม่สำเร็จ ลองใหม่อีกครั้งนะ</p>;
  if (!data) return <p role="status" className="p-4 text-sm text-muted">กำลังโหลด…</p>;

  const { recipe, have, allergic, allergies } = data;
  if (!recipe) {
    return (
      <div className="flex flex-col items-center gap-4 p-4 py-16 text-center">
        <p className="text-muted">ไม่พบสูตรอาหารนี้</p>
        <Link href="/" className="underline">กลับหน้าหลัก</Link>
      </div>
    );
  }

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
          <h2 className="text-2xl font-bold text-ink">{recipe.th}</h2>
          <p className="text-sm text-muted">
            {recipe.en} · {recipe.minutes} นาที
            {recipe.spice > 0 && <span aria-label={`ความเผ็ดระดับ ${recipe.spice}`}> · {"🌶".repeat(recipe.spice)}</span>}
          </p>
        </div>
        <button
          type="button"
          aria-pressed={favorite}
          aria-label="เมนูโปรด"
          onClick={toggleFavorite}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-xl ${favorite ? "border-red-300 bg-red-50 text-red-500" : "border-edge bg-white text-muted"}`}
        >
          {favorite ? "♥" : "♡"}
        </button>
      </section>

      <ChatActions recipe={recipe} missingIds={missing.map((m) => m.id)} />

      {allergic.length > 0 && (
        <p role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-700">
          ⚠ เมนูนี้มี {allergic.join(", ")} ที่คุณแพ้
        </p>
      )}

      {missing.length > 0 && (
        <section className="rounded-3xl bg-amber-50 p-4">
          <h3 className="font-semibold text-amber-800">ต้องซื้อเพิ่ม</h3>
          <ul className="mt-2 flex flex-col gap-3">
            {missing.map((m) => (
              <MissingItem key={m.id} item={m} allergies={allergies} />
            ))}
          </ul>
        </section>
      )}

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-lg font-semibold">วัตถุดิบ</h3>
          <span className="text-sm text-muted">สำหรับ {recipe.baseServings} ที่</span>
        </div>
        <ul className="divide-y divide-edge rounded-3xl bg-white px-4 shadow-card">
          {recipe.ingredients.map((x) => {
            const isMissing = missing.includes(x);
            return (
              <li key={x.id} className="flex min-h-10 items-center justify-between gap-3 py-1.5">
                <span>
                  {x.th}
                  {isMissing && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">ขาด</span>}
                </span>
                <span className="text-muted">{x.qty}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <StepsTimeline steps={recipe.steps} onFinish={() => setCooking(true)} />

      {(cooking || saved) && (
      <section ref={ratingRef} className="rounded-3xl bg-white p-4 shadow-card">
        {saved ? (
          <>
          <p role="status" className="text-center">
            บันทึกลงประวัติแล้ว ·{" "}
            <Link href="/history" className="underline">ดูประวัติ</Link>
          </p>
          <BackToChat />
          </>
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
                  className={`h-11 w-11 text-3xl ${rating && n <= rating ? "text-amber-400" : "text-edge"}`}
                >
                  ★
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={save}
              disabled={!rating}
              className="btn-primary w-full"
            >
              บันทึก
            </button>
          </div>
        )}
      </section>
      )}
    </main>
  );
}

// One missing ingredient with an on-demand, allergy-filtered list of swaps.
function MissingItem({ item, allergies }: { item: RecipeIngredient; allergies: string[] }) {
  const [state, setState] = useState<"idle" | "loading" | "error" | SwapResult>("idle");

  function load() {
    setState("loading");
    getSubstitutes(item.id, allergies).then(setState, () => setState("error"));
  }

  return (
    <li>
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-amber-800">{item.th}</span>
        {state === "idle" && (
          <button type="button" onClick={load} className="btn-secondary min-h-11 px-4 text-sm">
            ใช้อะไรแทนได้?
          </button>
        )}
      </div>
      <div aria-live="polite" className="mt-1 text-sm">
        {state === "loading" && <p className="text-muted">กำลังหา…</p>}
        {state === "error" && (
          <p className="text-red-700">
            โหลดไม่สำเร็จ{" "}
            <button type="button" onClick={load} className="min-h-11 font-semibold underline">ลองอีกครั้ง</button>
          </p>
        )}
        {typeof state === "object" && state.kind === "ok" && (
          <ul className="mt-1 flex flex-wrap gap-2">
            {state.options.map((o) => (
              <li key={o.label} className="rounded-full bg-butter px-3 py-1 font-medium text-ink">แทนด้วย {o.label}</li>
            ))}
          </ul>
        )}
        {typeof state === "object" && state.kind === "unsafe" && <p className="text-muted">ไม่มีตัวแทนที่ปลอดภัยสำหรับคุณ</p>}
        {typeof state === "object" && state.kind === "none" && <p className="text-muted">ยังไม่มีคำแนะนำสำหรับวัตถุดิบนี้</p>}
      </div>
    </li>
  );
}

// Shown only inside LINE: post the recipe card into this chat, or share it with friends.
function ChatActions({ recipe, missingIds }: { recipe: Recipe; missingIds: string[] }) {
  const [can, setCan] = useState({ send: false, share: false });
  const [status, setStatus] = useState("");

  useEffect(() => {
    Promise.all([canSendToChat(), canShare()]).then(([send, share]) => setCan({ send, share }));
  }, []);

  if (!can.send && !can.share) return null;
  const card = () => [recipeCard(recipe, missingIds, liffUrl(`/recipe/${recipe.id}`))];

  async function run(action: () => Promise<unknown>, done: string) {
    try {
      const sent = await action();
      setStatus(sent === false ? "" : done);
    } catch {
      setStatus("ส่งไม่สำเร็จ ลองอีกครั้งนะ");
    }
  }

  return (
    <section className="-mt-3 flex flex-wrap items-center gap-2">
      {can.send && (
        <button type="button" onClick={() => run(() => sendToChat(card()), "ส่งสูตรเข้าแชทแล้ว")} className="btn-secondary min-h-11 px-4 text-sm">
          ส่งเข้าแชท
        </button>
      )}
      {can.share && (
        <button type="button" onClick={() => run(() => shareToFriends(card()), "แชร์แล้ว")} className="btn-secondary min-h-11 px-4 text-sm">
          แชร์ให้เพื่อน
        </button>
      )}
      <span role="status" className="text-sm text-muted">{status}</span>
    </section>
  );
}

// After rating inside LINE: one tap back to the chat.
function BackToChat() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    inLineApp().then(setShow);
  }, []);
  if (!show) return null;
  return (
    <button type="button" onClick={closeToChat} className="btn-primary mt-3 w-full">
      กลับไปที่แชท
    </button>
  );
}
