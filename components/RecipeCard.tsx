import Link from "next/link";
import type { RecipeMatch } from "@/types/api";

export default function RecipeCard({ match }: { match: RecipeMatch }) {
  const { recipe, matchPercent, missing } = match;
  return (
    <Link href={`/recipe/${recipe.id}`} className="block rounded-2xl border border-zinc-200 p-4 active:bg-zinc-50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{recipe.th}</h3>
          <p className="text-xs text-zinc-500">
            {recipe.minutes} นาที
            {recipe.spice > 0 && <span aria-label={`ความเผ็ดระดับ ${recipe.spice}`}> · {"🌶".repeat(recipe.spice)}</span>}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-line/15 px-2.5 py-1 text-sm font-semibold text-green-800">
          {matchPercent}%
        </span>
      </div>
      {missing.length > 0 && (
        <p className="mt-2 text-sm text-amber-700">ขาดอีก: {missing.map((m) => m.th).join(", ")}</p>
      )}
    </Link>
  );
}
