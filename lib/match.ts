// Hard filters and match % in plain code (README rules; never the LLM). The LINE webhook uses this on the stand-in
// recipe list today; the real search endpoint (Task 2) runs the same rules on recipes from the database.
import type { Recipe, RecipeMatch, SearchRequest, SearchResult } from "../types/api.ts";
import { STAPLES } from "../data/staples.ts";

const ALMOST_THERE_MAX_MISSING = 2;
export const MIN_DISHES = 3; // the retry loop stops as soon as the three groups hold this many dishes
export const PARTIAL_FLOOR_PERCENT = 30; // try 2: a partial match needs at least this match %
export const PARTIAL_MAX = 5; // the partial group never holds more dishes than this
export const MAX_TRIES = 3;

// `staples` are assumed to be in the kitchen: they are never missing and do not count toward the percentage.
// Retry loop (docs/api-contract.md): try 1 is strict, try 2 adds `partial` at the floor, try 3 also drops the category
// and lowers the floor to any owned core ingredient. Allergies, unknown allergen data and spice are never relaxed.
export function rankRecipes(recipes: Recipe[], req: SearchRequest, staples: readonly string[] = STAPLES): SearchResult {
  const have = new Set(req.ingredientIds);
  const isStaple = new Set(staples);
  const safe = recipes
    // Unknown allergen data (null) is never shown; any overlap with the user's allergies is dropped. Same on every try.
    .filter((r) => r.allergens !== null && !r.allergens.some((a) => req.allergies.includes(a)))
    .filter((r) => r.spice <= req.spice);

  const rank = (category: string | null, partialFloor: number | null): SearchResult => {
    const ranked: RecipeMatch[] = safe
      .filter((r) => category === null || r.category === category)
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
      partial:
        partialFloor === null
          ? []
          : ranked.filter((m) => m.missing.length > ALMOST_THERE_MAX_MISSING && m.matchPercent >= partialFloor).slice(0, PARTIAL_MAX),
      tries: 0,
    };
  };
  const dishes = (r: SearchResult) => r.matches.length + r.almostThere.length + (r.partial?.length ?? 0);

  // Any owned core ingredient means a floor of 1%, since owned > 0 already gives a match % of at least 1.
  const plan: [string | null, number | null][] = [[req.category, null], [req.category, PARTIAL_FLOOR_PERCENT], [null, 1]];
  let result = rank(...plan[0]);
  let tries = 1;
  while (dishes(result) < MIN_DISHES && tries < MAX_TRIES) {
    result = rank(...plan[tries]);
    tries++;
  }
  return { ...result, tries };
}
