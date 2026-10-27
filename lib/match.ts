// Hard filters and match % in plain code (README rules; never the LLM). The LINE webhook uses this on the stand-in
// recipe list today; the real search endpoint (Task 2) runs the same rules on recipes from the database.
import type { Recipe, RecipeMatch, SearchRequest, SearchResult } from "../types/api.ts";
import { STAPLES } from "../data/staples.ts";

const ALMOST_THERE_MAX_MISSING = 2;
const MIN_RESULTS = 3; // the search relaxes (tries 2 and 3) while all groups together hold fewer dishes than this
const PARTIAL_FLOOR_PERCENT = 30; // try 2: a partial dish must match at least this much
const PARTIAL_MIN_OWNED = 2; // a partial dish needs this many owned non-staple ingredients, so garlic + chili alone do not flood it
const PARTIAL_MAX = 5;

type Scored = { match: RecipeMatch; owned: number };

// Every dish that passes the hard filters and shares at least one core ingredient, best match first.
// The allergy, unknown-allergen and spice filters are here and nowhere else, so no retry can relax them.
// `staples` are assumed to be in the kitchen: they are never missing and do not count toward the percentage.
function scoreRecipes(recipes: Recipe[], req: SearchRequest, isStaple: Set<string>, category: string | null): Scored[] {
  const have = new Set(req.ingredientIds);
  return recipes
    // Unknown allergen data (null) is never shown; any overlap with the user's allergies is dropped.
    .filter((r) => r.allergens !== null && !r.allergens.some((a) => req.allergies.includes(a)))
    .filter((r) => r.spice <= req.spice && (category === null || r.category === category))
    .flatMap(({ id, th, en, category, spice, minutes, ingredients }) => {
      const core = ingredients.filter((x) => !isStaple.has(x.id));
      const missing = core.filter((x) => !have.has(x.id)).map((x) => ({ id: x.id, th: x.th }));
      const owned = core.length - missing.length;
      // A dish you hold nothing for is not a suggestion, and neither is one made only of staples.
      if (core.length === 0 || owned === 0) return [];
      return [{ match: { recipe: { id, th, en, category, spice, minutes }, matchPercent: Math.round((owned / core.length) * 100), missing }, owned }];
    })
    .sort((a, b) => b.match.matchPercent - a.match.matchPercent);
}

function group(ranked: Scored[], partialFloor: number) {
  const all = ranked.map((s) => s.match);
  return {
    matches: all.filter((m) => m.missing.length === 0),
    almostThere: all.filter((m) => m.missing.length > 0 && m.missing.length <= ALMOST_THERE_MAX_MISSING),
    partial: ranked
      .filter((s) => s.match.missing.length > ALMOST_THERE_MAX_MISSING && s.match.matchPercent >= partialFloor && s.owned >= PARTIAL_MIN_OWNED)
      .map((s) => s.match)
      .slice(0, PARTIAL_MAX),
  };
}

const total = (g: ReturnType<typeof group>) => g.matches.length + g.almostThere.length + g.partial.length;

// Try 1 is strict (no partial group). Try 2 adds partial dishes at the floor. Try 3 also drops the food-type filter and
// the percentage floor (the owned-ingredient minimum stays). Each try runs only while there are fewer than MIN_RESULTS dishes.
export function rankRecipes(recipes: Recipe[], req: SearchRequest, staples: readonly string[] = STAPLES): SearchResult & { partial: RecipeMatch[] } {
  const isStaple = new Set(staples);
  const strict = scoreRecipes(recipes, req, isStaple, req.category);

  const try1 = group(strict, Infinity);
  if (total(try1) >= MIN_RESULTS) return { ...try1, tries: 1 };

  const try2 = group(strict, PARTIAL_FLOOR_PERCENT);
  if (total(try2) >= MIN_RESULTS) return { ...try2, tries: 2 };

  const anyCategory = req.category === null ? strict : scoreRecipes(recipes, req, isStaple, null);
  return { ...group(anyCategory, 0), tries: 3 };
}
