import Link from "next/link";
import type { RecipeMatch, RecipeSummary } from "@/types/api";

// One recipe in a list. Results pass `match` (match % and missing items); Menus pass a category label.
export default function RecipeCard({
  recipe,
  match,
  category,
}: {
  recipe: RecipeSummary;
  match?: Omit<RecipeMatch, "recipe">;
  category?: string;
}) {
  // ?from=results tells the Recipe page it may compare against the current search.
  const href = match ? `/recipe/${recipe.id}?from=results` : `/recipe/${recipe.id}`;
  return (
    <Link href={href} className="block rounded-3xl bg-white p-4 shadow-card active:bg-butter-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{recipe.th}</h3>
          <p className="text-xs text-muted">
            {category && `${category} · `}
            {recipe.minutes} นาที
            {recipe.spice > 0 && <span aria-label={`ความเผ็ดระดับ ${recipe.spice}`}> · {"🌶".repeat(recipe.spice)}</span>}
          </p>
        </div>
        {match && (
          <span className="shrink-0 rounded-full bg-butter px-3 py-1 text-sm font-semibold text-ink">
            {match.matchPercent}%
          </span>
        )}
      </div>
      {match && match.missing.length > 0 && (
        <p className="mt-2 text-sm text-amber-700">ขาดอีก: {match.missing.map((m) => m.th).join(", ")}</p>
      )}
    </Link>
  );
}
