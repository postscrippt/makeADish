// Hard filters and match % in plain code (README rules; never the LLM). The LINE webhook uses this on the stand-in
// recipe list today; the real search endpoint (Task 2) runs the same rules on recipes from the database.
import type { Recipe, RecipeMatch, SearchRequest, SearchResult } from "../types/api.ts";
import { STAPLES } from "../data/staples.ts";

const ALMOST_THERE_MAX_MISSING = 2;

// `staples` are assumed to be in the kitchen: they are never missing and do not count toward the percentage.
export function rankRecipes(recipes: Recipe[], req: SearchRequest, staples: readonly string[] = STAPLES): SearchResult {
  const have = new Set(req.ingredientIds);
  const isStaple = new Set(staples);
  const ranked: RecipeMatch[] = recipes
    // Unknown allergen data (null) is never shown; any overlap with the user's allergies is dropped.
    .filter((r) => r.allergens !== null && !r.allergens.some((a) => req.allergies.includes(a)))
    .filter((r) => r.spice <= req.spice && (req.category === null || r.category === req.category))
    .flatMap(({ id, th, en, category, spice, minutes, ingredients }) => {
      const core = ingredients.filter((x) => !isStaple.has(x.id));
      const missing = core.filter((x) => !have.has(x.id)).map((x) => ({ id: x.id, th: x.th }));
      const owned = core.length - missing.length;
      // A dish you hold nothing for is not a suggestion, and neither is one made only of staples.
      if (core.length === 0 || owned === 0) return [];
      return [{ recipe: { id, th, en, category, spice, minutes }, matchPercent: Math.round((owned / core.length) * 100), missing }];
    })
    .sort((a, b) => b.matchPercent - a.matchPercent);

  return {
    matches: ranked.filter((m) => m.missing.length === 0),
    almostThere: ranked.filter((m) => m.missing.length > 0 && m.missing.length <= ALMOST_THERE_MAX_MISSING),
    tries: 1, // no retry loop yet; the agent (Task 2) sets this, capped at 3
  };
}
