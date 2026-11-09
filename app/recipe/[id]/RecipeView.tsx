"use client";

import { useEffect, useState } from "react";
import CookMode from "@/components/CookMode";
import { getFavorites, getIngredients, getOptions, getProfile, getRecipe, getSubstitutes, logCooked, setFavorite } from "@/mocks/api";
import { readDraft } from "@/app/draft";
import type { Option, Recipe, RecipeIngredient } from "@/types/api";
import type { SwapResult } from "@/app/recipe/swaps";
import { cookPath, recipeCard } from "@/app/recipe/recipeCard";
import { canSendToChat, canShare, liffUrl, sendToChat, shareToFriends } from "@/app/liff";
import CloseToChat from "@/components/CloseToChat";
import PageHeader from "@/components/PageHeader";
import { useLang } from "@/app/lang";
import { allergenName } from "@/app/text";
import { dishTitle, ingredientName, qtyFor, stepsFor, swapLabel } from "@/app/recipeEn";

type Loaded = { recipe: Recipe | null; have: Set<string> | null; staples: Set<string>; allergic: Option[]; allergies: string[]; names: Record<string, string> };

// Also the page's Suspense fallback (a server component cannot read the language).
export function RecipeLoading() {
  const { t } = useLang();
  return <><PageHeader title={t("recipe.title")} /><p role="status" className="p-5 text-sm text-muted">{t("common.loading")}</p></>;
}

export default function RecipeView({
  id, fromSearch, missingIds, haveIds, cook,
}: { id: string; fromSearch: boolean; missingIds: string[]; haveIds: string[]; cook: boolean }) {
  const [data, setData] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);
  const [favorite, setFav] = useState(false);
  // The step cook mode is on, or null while it is closed. A chat card's "เริ่มทำ" (?cook=1) opens it straight away.
  const [cookStep, setCookStep] = useState<number | null>(cook ? 0 : null);
  const [resumeAt, setResumeAt] = useState(0);
  const { lang, t } = useLang();

  const haveKey = haveIds.join(","); // a string, so the effect doesn't rerun on every render

  useEffect(() => {
    // English names only: a failed catalog load must not take the recipe down with it.
    Promise.all([getRecipe(id), getFavorites(), getProfile(), getOptions(), getIngredients().catch(() => [])])
      .then(([recipe, favorites, profile, options, catalog]) => {
        // Mark missing items when opened from Results (the search draft) or from a chat card (?missing=).
        // Menus and History have no pantry.
        const search = fromSearch ? readDraft("search") : null;
        // ?ids= (what the user has, from the chat carousel) works like the search draft.
        const have = search ? new Set(search.ingredientIds) : haveKey ? new Set(haveKey.split(",")) : null;
        // A saved dish can contain an allergy added later (e.g. a favorite), so warn instead of hiding.
        const allergic = options.allergens
          .filter((a) => profile.allergies.includes(a.id) && recipe?.allergens?.includes(a.id));
        setFav(favorites.some((f) => f.id === id));
        setData({ recipe, have, staples: new Set(options.staples), allergic, allergies: profile.allergies, names: Object.fromEntries(catalog.map((x) => [x.id, x.en])) });
      })
      .catch(() => setFailed(true));
  }, [id, fromSearch, haveKey]);


  if (failed) return <><PageHeader title={t("recipe.title")} /><p role="alert" className="p-5 text-red-700">{t("recipe.loadFailed")}</p></>;
  if (!data) return <RecipeLoading />;

  const { recipe, have, staples, allergic, allergies, names } = data;
  if (!recipe) {
    return (
      <>
        <PageHeader title={t("recipe.title")} />
        <div className="flex flex-col items-center gap-4 p-5 py-16 text-center">
          <p className="text-muted">{t("recipe.notFound")}</p>
          <CloseToChat className="btn-secondary">{t("common.closeToChat")}</CloseToChat>
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
    <PageHeader title={t("recipe.title")} titleAs="p">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl leading-tight font-bold text-balance text-butter">{dishTitle(recipe, lang)}</h1>
        </div>
        <button
          type="button"
          aria-pressed={favorite}
          aria-label={t("recipe.favorite")}
          onClick={toggleFavorite}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl ${favorite ? "text-red-500" : "text-muted"}`}
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>
      <ul aria-label={t("recipe.info")} className="mt-4 flex flex-wrap gap-2">
        {[t("card.minutes", { n: recipe.minutes }), t("recipe.servings", { n: recipe.baseServings }), recipe.spice > 0 ? "🌶".repeat(recipe.spice) : t("recipe.notSpicy")].map((chip) => (
          <li key={chip} className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-ink">{chip}</li>
        ))}
      </ul>
    </PageHeader>
    <main className="flex flex-1 flex-col gap-6 px-5 pt-6 pb-8">
      {allergic.length > 0 && (
        <p role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-700">
          {t("recipe.allergyWarning", { names: allergic.map((a) => allergenName(a, lang)).join(", ") })}
        </p>
      )}

      <section>
        {/* The one place a gap is counted; the amber rows below say which. Same "ขาด N อย่าง" wording as the dish cards. */}
        <h3 className="mb-3 text-xl font-bold">
          {t("recipe.ingredients")}{missing.length > 0 && <span className="ml-2 text-sm font-semibold text-amber-800">{t("card.missing", { n: missing.length })}</span>}
        </h3>
        <ul className="divide-y divide-edge overflow-hidden rounded-3xl bg-white px-4 shadow-card">
          {recipe.ingredients.map((x) =>
            missing.includes(x) ? (
              <MissingRow key={x.id} item={x} name={ingredientName(x, names, lang)} qty={qtyFor(recipe.th, x, lang)} allergies={allergies} />
            ) : (
              <li key={x.id} className="flex min-h-14 items-center justify-between gap-3 py-2.5">
                <span>{ingredientName(x, names, lang)}</span>
                <span className="text-right text-muted">{qtyFor(recipe.th, x, lang)}</span>
              </li>
            ),
          )}
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-bold">{t("recipe.steps")} <span className="text-sm font-normal text-muted">{t("recipe.stepCount", { n: recipe.steps.length })}</span></h3>
        <ol className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-card">
          {stepsFor(recipe, lang).map((step, i) => (
            <li key={i} className="flex gap-3">
              <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mist text-sm font-semibold text-brand-deep">{i + 1}</span>
              <span className="pt-1">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <ChatActions recipe={recipe} missingIds={missing.map((m) => m.id)} />
    </main>

    <div className="sticky bottom-0 z-10 border-t border-edge bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <button type="button" onClick={() => setCookStep(resumeAt)} className="btn-primary min-h-12 w-full text-lg">
        {resumeAt > 0 ? t("recipe.continue", { n: resumeAt + 1 }) : t("recipe.start")}
      </button>
    </div>

    {cookStep !== null && (
      <CookMode
        name={dishTitle(recipe, lang)}
        steps={recipe.steps}
        shownSteps={stepsFor(recipe, lang)}
        ingredients={recipe.ingredients}
        ingredientText={(x) => ({ name: ingredientName(x, names, lang), qty: qtyFor(recipe.th, x, lang) })}
        startAt={cookStep}
        onExit={(step) => { setResumeAt(step); setCookStep(null); }}
        onSave={(rating) => logCooked({ recipeId: recipe.id, th: recipe.th, rating, cookedAt: new Date().toISOString() })}
      />
    )}
    </div>
  );
}

// A missing ingredient, shown in the ingredient list itself: amber row, with an on-demand, allergy-filtered list of swaps under it.
function MissingRow({ item, name, qty, allergies }: { item: RecipeIngredient; name: string; qty: string; allergies: string[] }) {
  const [state, setState] = useState<"idle" | "loading" | "error" | SwapResult>("idle");
  const { lang, t } = useLang();

  function load() {
    setState("loading");
    getSubstitutes(item.id, allergies).then(setState, () => setState("error"));
  }

  return (
    <li className="-mx-4 bg-amber-50 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-amber-800"><span className="sr-only">{t("recipe.missingPrefix")}</span>{name}</span>
        <span className="text-right text-muted">{qty}</span>
      </div>
      <div aria-live="polite" className="text-sm">
        {state === "idle" && (
          <button type="button" onClick={load} className="-ml-2 flex min-h-11 items-center px-2 font-semibold text-brand-deep">
            {t("recipe.swapAsk")}
          </button>
        )}
        {state === "loading" && <p className="py-2 text-muted">{t("recipe.swapLoading")}</p>}
        {state === "error" && (
          <p className="text-red-700">
            {t("recipe.swapFailed")}{" "}
            <button type="button" onClick={load} className="min-h-11 font-semibold underline">{t("common.retry")}</button>
          </p>
        )}
        {typeof state === "object" && state.kind === "ok" && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {state.options.map((o) => (
              <li key={o.label} className="rounded-full border border-edge bg-white px-3 py-1 font-medium text-ink">{t("recipe.swapWith", { label: swapLabel(o.label, lang) })}</li>
            ))}
          </ul>
        )}
        {typeof state === "object" && state.kind === "unsafe" && <p className="mt-1 text-muted">{t("recipe.swapUnsafe")}</p>}
        {typeof state === "object" && state.kind === "none" && <p className="mt-1 text-muted">{t("recipe.swapNone")}</p>}
      </div>
    </li>
  );
}

// Shown only inside LINE: post the recipe card into this chat, or share it with friends.
function ChatActions({ recipe, missingIds }: { recipe: Recipe; missingIds: string[] }) {
  const [can, setCan] = useState({ send: false, share: false });
  const [status, setStatus] = useState("");
  const { t } = useLang();

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
      setStatus(t("recipe.sendFailed"));
    }
  }

  return (
    <section className="flex flex-wrap items-center gap-2">
      {can.send && (
        <button type="button" onClick={() => run(() => sendToChat(card()), t("recipe.sent"))} className="btn-secondary min-h-11 px-4 text-sm">
          {t("recipe.sendToChat")}
        </button>
      )}
      {can.share && (
        <button type="button" onClick={() => run(() => shareToFriends(card()), t("recipe.shared"))} className="btn-secondary min-h-11 px-4 text-sm">
          {t("recipe.share")}
        </button>
      )}
      <span role="status" className="text-sm text-muted">{status}</span>
    </section>
  );
}
