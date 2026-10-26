// Hard filters and match % in plain code (README rules; never the LLM). The LINE webhook uses this on the stand-in
// recipe list today; the real search endpoint (Task 2) runs the same rules on recipes from the database.
import type { Recipe, RecipeMatch, SearchRequest, SearchResult } from "../types/api.ts";

const ALMOST_THERE_MAX_MISSING = 2;

export function rankRecipes(recipes: Recipe[], req: SearchRequest): SearchResult {
  const have = new Set(req.ingredientIds);
  const ranked: RecipeMatch[] = recipes
    // Unknown allergen data (null) is never shown; any overlap with the user's allergies is dropped.
    .filter((r) => r.allergens !== null && !r.allergens.some((a) => req.allergies.includes(a)))
    .filter((r) => r.spice <= req.spice && (req.category === null || r.category === req.category))
    .filter((r) => r.ingredients.length > 0)
    .map(({ id, th, en, category, spice, minutes, ingredients }) => {
      const missing = ingredients.filter((x) => !have.has(x.id)).map((x) => ({ id: x.id, th: x.th }));
      const matchPercent = Math.round(((ingredients.length - missing.length) / ingredients.length) * 100);
      return { recipe: { id, th, en, category, spice, minutes }, matchPercent, missing };
    })
    // A dish you have nothing for is not a suggestion, even if it only has two ingredients.
    .filter((m) => m.matchPercent > 0)
    .sort((a, b) => b.matchPercent - a.matchPercent);

  return {
    matches: ranked.filter((m) => m.missing.length === 0),
    almostThere: ranked.filter((m) => m.missing.length > 0 && m.missing.length <= ALMOST_THERE_MAX_MISSING),
    tries: 1, // no retry loop yet; the agent (Task 2) sets this, capped at 3
  };
}
