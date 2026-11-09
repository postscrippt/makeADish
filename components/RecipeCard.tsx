"use client";

import Link from "next/link";
import StepIcon from "@/components/StepIcon";
import { dishStatus } from "@/app/dishStatus";
import { useLang } from "@/app/lang";
import { dishTitle, ingredientName } from "@/app/recipeEn";
import type { StepIcon as IconKind } from "@/app/recipe/steps";
import type { RecipeMatch, RecipeSummary } from "@/types/api";

// A drawn icon per kind of dish, so a long list can be scanned by shape. Unknown categories get a plate.
const dishIcon: Record<string, IconKind> = { "stir-fry": "pan", fried: "pan", soup: "pot", curry: "pot", salad: "whisk" };

// Same words as the chat carousel (app/dishStatus.ts). Ready is the one teal line; missing items are the amber one.
function Status({ match, names }: { match: Omit<RecipeMatch, "recipe">; names: Record<string, string> }) {
  const { lang, t } = useLang();
  const s = dishStatus(match);
  return s.ready ? (
    <p className="mt-2 text-sm font-semibold text-brand-deep">{t("card.ready")}</p>
  ) : (
    <p className="mt-2 text-sm text-amber-700">
      <span className="font-semibold">{t("card.missing", { n: match.missing.length })}:</span> {match.missing.map((x) => ingredientName(x, names, lang)).join(", ")}
    </p>
  );
}

// One recipe in a list. Results pass `match` (missing items); Menus pass a category label.
// The chevron says "tap to open": the whole card is the one action.
export default function RecipeCard({
  recipe,
  match,
  category,
  hideReady = false,
  names = {},
}: {
  recipe: RecipeSummary;
  match?: Omit<RecipeMatch, "recipe">;
  category?: string;
  // The "ทำได้เลย" tab and hero already say it, so its cards skip the label. Missing items always show.
  hideReady?: boolean;
  // English ingredient names by id, for the missing line.
  names?: Record<string, string>;
}) {
  const { lang, t } = useLang();
  // ?from=results tells the Recipe page it may compare against the current search.
  const href = match ? `/recipe/${recipe.id}?from=results` : `/recipe/${recipe.id}`;
  return (
    <Link href={href} className="flex items-center gap-4 rounded-3xl bg-white p-4 pr-3 shadow-card active:bg-butter-soft">
      <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center self-start rounded-full bg-butter-soft">
        <StepIcon icon={dishIcon[recipe.category] ?? "plate"} className="h-8 w-8" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg leading-snug font-semibold text-balance">{dishTitle(recipe, lang)}</h3>
        <p className="mt-1 text-sm text-muted">
          {category && `${category} · `}
          {t("card.minutes", { n: recipe.minutes })}
          {recipe.spice > 0 && <span aria-label={t("card.spice", { n: recipe.spice })}> · {"🌶".repeat(recipe.spice)}</span>}
        </p>
        {match && !(hideReady && match.missing.length === 0) && <Status match={match} names={names} />}
      </div>
      <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-edge" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
