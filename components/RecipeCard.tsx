import Link from "next/link";
import type { RecipeMatch, RecipeSummary } from "@/types/api";

// One recipe in a list. Results pass `match` (match % and missing items); Menus pass a category label.
// The chevron says "tap to open": the whole card is the one action.
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
    <Link href={href} className="flex items-center gap-2 rounded-3xl bg-white p-4 pr-3 shadow-card active:bg-butter-soft">
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg leading-snug font-semibold">{recipe.th}</h3>
          {match && (
            <span className="shrink-0 rounded-full bg-butter px-3 py-1 text-sm font-semibold text-ink">
              {match.missing.length === 0 ? "ครบทุกอย่าง" : `${match.matchPercent}%`}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted">
          {category && `${category} · `}
          {recipe.minutes} นาที
          {recipe.spice > 0 && <span aria-label={`ความเผ็ดระดับ ${recipe.spice}`}> · {"🌶".repeat(recipe.spice)}</span>}
        </p>
        {match && match.missing.length > 0 && (
          <p className="mt-2 text-sm text-amber-700">
            <span className="font-semibold">ต้องซื้อ {match.missing.length} อย่าง:</span> {match.missing.map((m) => m.th).join(", ")}
          </p>
        )}
      </div>
      <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-edge" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
