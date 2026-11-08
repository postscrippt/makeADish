"use client";

import { useEffect, useState } from "react";
import CookMode from "@/components/CookMode";
import { getFavorites, getOptions, getProfile, getRecipe, getSubstitutes, logCooked, setFavorite } from "@/mocks/api";
import { readDraft } from "@/app/draft";
import type { Recipe, RecipeIngredient } from "@/types/api";
import type { SwapResult } from "@/app/recipe/swaps";
import { cookPath, recipeCard } from "@/app/recipe/recipeCard";
import { canSendToChat, canShare, liffUrl, sendToChat, shareToFriends } from "@/app/liff";
import CloseToChat from "@/components/CloseToChat";
import PageHeader from "@/components/PageHeader";

type Loaded = { recipe: Recipe | null; have: Set<string> | null; staples: Set<string>; allergic: string[]; allergies: string[] };

export default function RecipeView({
  id, fromSearch, missingIds, haveIds, cook,
}: { id: string; fromSearch: boolean; missingIds: string[]; haveIds: string[]; cook: boolean }) {
  const [data, setData] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);
  const [favorite, setFav] = useState(false);
  // The step cook mode is on, or null while it is closed. A chat card's "เริ่มทำ" (?cook=1) opens it straight away.
  const [cookStep, setCookStep] = useState<number | null>(cook ? 0 : null);
  const [resumeAt, setResumeAt] = useState(0);

  const haveKey = haveIds.join(","); // a string, so the effect doesn't rerun on every render

  useEffect(() => {
    Promise.all([getRecipe(id), getFavorites(), getProfile(), getOptions()])
      .then(([recipe, favorites, profile, options]) => {
        // Mark missing items when opened from Results (the search draft) or from a chat card (?missing=).
        // Menus and History have no pantry.
        const search = fromSearch ? readDraft("search") : null;
        // ?ids= (what the user has, from the chat carousel) works like the search draft.
        const have = search ? new Set(search.ingredientIds) : haveKey ? new Set(haveKey.split(",")) : null;
        // A saved dish can contain an allergy added later (e.g. a favorite), so warn instead of hiding.
        const allergic = options.allergens
          .filter((a) => profile.allergies.includes(a.id) && recipe?.allergens?.includes(a.id))
          .map((a) => a.th);
        setFav(favorites.some((f) => f.id === id));
        setData({ recipe, have, staples: new Set(options.staples), allergic, allergies: profile.allergies });
      })
      .catch(() => setFailed(true));
  }, [id, fromSearch, haveKey]);


  if (failed) return <><PageHeader title="สูตรอาหาร" /><p role="alert" className="p-5 text-red-700">โหลดสูตรไม่สำเร็จ ลองใหม่อีกครั้งนะ</p></>;
  if (!data) return <><PageHeader title="สูตรอาหาร" /><p role="status" className="p-5 text-sm text-muted">กำลังโหลด…</p></>;

  const { recipe, have, staples, allergic, allergies } = data;
  if (!recipe) {
    return (
      <>
        <PageHeader title="สูตรอาหาร" />
        <div className="flex flex-col items-center gap-4 p-5 py-16 text-center">
          <p className="text-muted">ไม่พบสูตรอาหารนี้</p>
          <CloseToChat className="btn-secondary">ปิด กลับไปที่แชท</CloseToChat>
        </div>
      </>
    );
  }

  // Ids from the link only count if they are in this recipe. Staples (salt, fish sauce…) are assumed in every kitchen.
  const missing = (have ? recipe.ingredients.filter((x) => !have.has(x.id)) : recipe.ingredients.filter((x) => missingIds.includes(x.id)))
    .filter((x) => !staples.has(x.id));

  function toggleFavorite() {
    setFav(!favorite);
    setFavorite({ id: recipe!.id, th: recipe!.th }, !favorite).catch(() => setFav(favorite));
  }

  return (
    // Fills the screen, so the start bar sits at the bottom even on a short recipe.
    <div className="flex min-h-dvh flex-col">
    <PageHeader title="สูตรอาหาร" titleAs="p">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl leading-tight font-bold text-balance text-butter">{recipe.th}</h1>
          <p className="mt-1 text-white">{recipe.en}</p>
        </div>
        <button
          type="button"
          aria-pressed={favorite}
          aria-label="เมนูโปรด"
          onClick={toggleFavorite}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl ${favorite ? "text-red-500" : "text-muted"}`}
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>
      <ul aria-label="ข้อมูลเมนู" className="mt-4 flex flex-wrap gap-2">
        {[`${recipe.minutes} นาที`, `${recipe.baseServings} ที่`, recipe.spice > 0 ? "🌶".repeat(recipe.spice) : "ไม่เผ็ด"].map((t) => (
          <li key={t} className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-ink">{t}</li>
        ))}
      </ul>
    </PageHeader>
    <main className="flex flex-1 flex-col gap-6 px-5 pt-6 pb-8">
      {allergic.length > 0 && (
        <p role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-700">
          ⚠ เมนูนี้มี {allergic.join(", ")} ที่คุณแพ้
        </p>
      )}

      {have && (
        <p className={`rounded-full px-4 py-2.5 text-center text-sm font-semibold ${missing.length === 0 ? "bg-butter text-ink" : "bg-amber-50 text-amber-800"}`}>
          {missing.length === 0 ? "มีวัตถุดิบครบ เริ่มทำได้เลย" : `ต้องซื้อเพิ่ม ${missing.length} อย่าง`}
        </p>
      )}

      <section>
        <h3 className="mb-3 text-xl font-bold">วัตถุดิบ</h3>
        <ul className="divide-y divide-edge overflow-hidden rounded-3xl bg-white px-4 shadow-card">
          {recipe.ingredients.map((x) =>
            missing.includes(x) ? (
              <MissingRow key={x.id} item={x} allergies={allergies} />
            ) : (
              <li key={x.id} className="flex min-h-14 items-center justify-between gap-3 py-2.5">
                <span>{x.th}</span>
                <span className="text-muted">{x.qty}</span>
              </li>
            ),
          )}
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-bold">วิธีทำ <span className="text-sm font-normal text-muted">{recipe.steps.length} ขั้น</span></h3>
        <ol className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-card">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mist text-sm font-semibold text-brand-deep">{i + 1}</span>
              <span className="pt-1">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <ChatActions recipe={recipe} missingIds={missing.map((m) => m.id)} />
    </main>

    <div className="sticky bottom-0 z-10 rounded-t-3xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-card">
      <button type="button" onClick={() => setCookStep(resumeAt)} className="btn-primary min-h-14 w-full text-lg">
        {resumeAt > 0 ? `ทำต่อ ขั้นที่ ${resumeAt + 1}` : "เริ่มทำ"}
      </button>
    </div>

    {cookStep !== null && (
      <CookMode
        name={recipe.th}
        steps={recipe.steps}
        ingredients={recipe.ingredients}
        startAt={cookStep}
        onExit={(step) => { setResumeAt(step); setCookStep(null); }}
        onSave={(rating) => logCooked({ recipeId: recipe.id, th: recipe.th, rating, cookedAt: new Date().toISOString() })}
      />
    )}
    </div>
  );
}

// A missing ingredient, shown in the ingredient list itself: amber row, with an on-demand, allergy-filtered list of swaps under it.
function MissingRow({ item, allergies }: { item: RecipeIngredient; allergies: string[] }) {
  const [state, setState] = useState<"idle" | "loading" | "error" | SwapResult>("idle");

  function load() {
    setState("loading");
    getSubstitutes(item.id, allergies).then(setState, () => setState("error"));
  }

  return (
    <li className="-mx-4 bg-amber-50 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-amber-800">{item.th} <span className="ml-1 rounded bg-amber-100 px-2 py-0.5 text-sm">ต้องซื้อ</span></span>
        <span className="text-muted">{item.qty}</span>
      </div>
      <div aria-live="polite" className="text-sm">
        {state === "idle" && (
          <button type="button" onClick={load} className="-ml-2 flex min-h-11 items-center px-2 font-semibold text-brand-deep">
            ใช้อะไรแทนได้?
          </button>
        )}
        {state === "loading" && <p className="py-2 text-muted">กำลังหา…</p>}
        {state === "error" && (
          <p className="text-red-700">
            โหลดไม่สำเร็จ{" "}
            <button type="button" onClick={load} className="min-h-11 font-semibold underline">ลองอีกครั้ง</button>
          </p>
        )}
        {typeof state === "object" && state.kind === "ok" && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {state.options.map((o) => (
              <li key={o.label} className="rounded-full border border-edge bg-white px-3 py-1 font-medium text-ink">แทนด้วย {o.label}</li>
            ))}
          </ul>
        )}
        {typeof state === "object" && state.kind === "unsafe" && <p className="mt-1 text-muted">ไม่มีตัวแทนที่ปลอดภัยสำหรับคุณ</p>}
        {typeof state === "object" && state.kind === "none" && <p className="mt-1 text-muted">ยังไม่มีคำแนะนำสำหรับวัตถุดิบนี้</p>}
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
  const card = () => [recipeCard(recipe, missingIds, liffUrl(cookPath(recipe.id, missingIds)))];

  async function run(action: () => Promise<unknown>, done: string) {
    try {
      const sent = await action();
      setStatus(sent === false ? "" : done);
    } catch {
      setStatus("ส่งไม่สำเร็จ ลองอีกครั้งนะ");
    }
  }

  return (
    <section className="flex flex-wrap items-center gap-2">
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
