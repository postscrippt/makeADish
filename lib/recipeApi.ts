// POST /api/recommend, GET /api/recipes and GET /api/recipes/:id (docs/api-contract.md).
// Hard rules live here and in lib/match.ts: unknown allergen data is never returned, a user's allergens are removed
// by code, and the allergy filter is the union of what the client sent and what the profile has saved.
import type { Recipe, RecipeSummary, SearchRequest, SpiceLevel } from "../types/api.ts";
import { categoryOptions, allergenOptions } from "../data/options.ts";
import { rankRecipes } from "./match.ts";
import { DEFAULT_PROFILE, error, readAnonId, type ProfileStore } from "./profile.ts";
import type { RecipeStore } from "./recipeStore.ts";

export type Deps = { recipes: RecipeStore | null; profiles: ProfileStore | null };

const ALLERGEN_IDS = new Set(allergenOptions.map((a) => a.id));
const CATEGORY_IDS = new Set(categoryOptions.map((c) => c.id));
const MAX_INGREDIENTS = 100;

const summary = ({ id, th, en, category, spice, minutes }: Recipe): RecipeSummary => ({ id, th, en, category, spice, minutes });

// Why: a database failure must not turn into "no allergies". We answer 500 and show nothing.
const fail = (what: string, e: unknown) => {
  console.error(`${what} failed:`, e instanceof Error ? e.message : "unknown error");
  return error(500, "server_error", "Could not reach the database");
};

type Ready = { anonId: string; recipes: RecipeStore; profiles: ProfileStore };
function ready(request: Request, deps: Deps): Ready | Response {
  const anonId = readAnonId(request);
  if (!anonId) return error(400, "bad_request", "Missing or invalid x-anon-id header");
  if (!deps.recipes || !deps.profiles) return error(503, "unavailable", "The database is not configured");
  return { anonId, recipes: deps.recipes, profiles: deps.profiles };
}

export function validateSearch(body: unknown): { ok: true; req: SearchRequest } | { ok: false; message: string } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return { ok: false, message: "Body must be a SearchRequest object" };
  const { ingredientIds, spice, category, allergies } = body as Record<string, unknown>;
  if (!Array.isArray(ingredientIds) || ingredientIds.length > MAX_INGREDIENTS || !ingredientIds.every((x) => typeof x === "string" && x.length > 0 && x.length <= 64)) {
    return { ok: false, message: `ingredientIds must be a list of at most ${MAX_INGREDIENTS} ingredient ids` };
  }
  if (spice !== 0 && spice !== 1 && spice !== 2 && spice !== 3) return { ok: false, message: "spice must be 0, 1, 2 or 3" };
  if (category !== null && !(typeof category === "string" && CATEGORY_IDS.has(category))) return { ok: false, message: "category must be null or a known category id" };
  if (!Array.isArray(allergies) || !allergies.every((a) => typeof a === "string")) return { ok: false, message: "allergies must be a list of allergen ids" };
  const unknown = allergies.filter((a) => !ALLERGEN_IDS.has(a));
  if (unknown.length) return { ok: false, message: `Unknown allergen id: ${unknown.slice(0, 3).join(", ")}` };
  return { ok: true, req: { ingredientIds: [...new Set(ingredientIds as string[])], spice: spice as SpiceLevel, category, allergies: allergies as string[] } };
}

export async function handleRecommend(request: Request, deps: Deps): Promise<Response> {
  const r = ready(request, deps);
  if (r instanceof Response) return r;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error(400, "bad_request", "Body is not JSON");
  }
  const checked = validateSearch(body);
  if (!checked.ok) return error(400, "bad_request", checked.message);

  try {
    // The saved allergies are added to whatever the client sent, so a stale or tampered client cannot weaken the filter.
    const saved = await r.profiles.getOrCreate(r.anonId, DEFAULT_PROFILE);
    const allergies = [...new Set([...checked.req.allergies, ...saved.allergies])];
    const all = await r.recipes.all();
    return Response.json(rankRecipes(all, { ...checked.req, allergies }));
  } catch (e) {
    return fail("recommend", e);
  }
}

export async function handleRecipeList(request: Request, deps: Deps): Promise<Response> {
  const r = ready(request, deps);
  if (r instanceof Response) return r;
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const category = url.searchParams.get("category");
  if (category !== null && category !== "" && !CATEGORY_IDS.has(category)) return error(400, "bad_request", "Unknown category");

  try {
    const saved = await r.profiles.getOrCreate(r.anonId, DEFAULT_PROFILE);
    const all = await r.recipes.all();
    const list = all
      // Unknown allergen data is never shown; the user's own saved allergens are removed (never sent in the URL).
      .filter((x) => x.allergens !== null && !x.allergens.some((a) => saved.allergies.includes(a)))
      .filter((x) => !category || x.category === category)
      .filter((x) => !q || x.th.toLowerCase().includes(q) || x.en.toLowerCase().includes(q))
      .map(summary);
    return Response.json(list);
  } catch (e) {
    return fail("recipe list", e);
  }
}

export async function handleRecipeGet(request: Request, id: string, deps: Deps): Promise<Response> {
  const r = ready(request, deps);
  if (r instanceof Response) return r;
  try {
    const recipe = await r.recipes.byId(id);
    // Unknown id and unknown allergen data look the same on purpose.
    if (!recipe || recipe.allergens === null) return error(404, "not_found", "Recipe not found");
    return Response.json(recipe);
  } catch (e) {
    return fail("recipe get", e);
  }
}
