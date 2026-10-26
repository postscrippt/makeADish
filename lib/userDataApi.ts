// POST and GET /api/history, GET /api/favorites, PUT /api/favorites/:recipeId (docs/api-contract.md).
import type { HistoryEntry } from "../types/api.ts";
import { DEFAULT_PROFILE, error, readAnonId, type ProfileStore } from "./profile.ts";
import type { RecipeStore } from "./recipeStore.ts";
import type { UserDataStore } from "./userDataStore.ts";

export type UserDataDeps = { users: UserDataStore | null; profiles: ProfileStore | null; recipes: RecipeStore | null };

const RECIPE_ID = /^\d{1,9}$/;

const fail = (what: string, e: unknown) => {
  console.error(`${what} failed:`, e instanceof Error ? e.message : "unknown error");
  return error(500, "server_error", "Could not reach the database");
};

type Ready = { anonId: string; users: UserDataStore; profiles: ProfileStore; recipes: RecipeStore };
function ready(request: Request, deps: UserDataDeps): Ready | Response {
  const anonId = readAnonId(request);
  if (!anonId) return error(400, "bad_request", "Missing or invalid x-anon-id header");
  if (!deps.users || !deps.profiles || !deps.recipes) return error(503, "unavailable", "The database is not configured");
  return { anonId, users: deps.users, profiles: deps.profiles, recipes: deps.recipes };
}

// The history and favorites tables point at users(id), so the user row has to exist first ("created on first use").
const ensureUser = (r: Ready) => r.profiles.getOrCreate(r.anonId, DEFAULT_PROFILE);

async function readJson(request: Request): Promise<{ ok: true; body: unknown } | { ok: false }> {
  try {
    return { ok: true, body: await request.json() };
  } catch {
    return { ok: false };
  }
}

export async function handleHistoryPost(request: Request, deps: UserDataDeps): Promise<Response> {
  const r = ready(request, deps);
  if (r instanceof Response) return r;
  const parsed = await readJson(request);
  if (!parsed.ok) return error(400, "bad_request", "Body is not JSON");
  const { recipeId, rating } = (parsed.body ?? {}) as Record<string, unknown>;
  if (typeof recipeId !== "string" || !RECIPE_ID.test(recipeId)) return error(400, "bad_request", "recipeId must be a recipe id string");
  if (!Number.isInteger(rating) || (rating as number) < 1 || (rating as number) > 5) return error(400, "bad_request", "rating must be 1 to 5");

  try {
    const recipe = await r.recipes.byId(recipeId);
    // A dish with unknown allergen data is never shown anywhere, so it cannot be cooked either.
    if (!recipe || recipe.allergens === null) return error(404, "not_found", "Recipe not found");
    await ensureUser(r);
    const { cookedAt } = await r.users.addHistory(r.anonId, Number(recipeId), rating as number);
    const entry: HistoryEntry = { recipeId, th: recipe.th, rating: rating as HistoryEntry["rating"], cookedAt };
    return Response.json(entry, { status: 201 });
  } catch (e) {
    return fail("history post", e);
  }
}

export async function handleHistoryGet(request: Request, deps: UserDataDeps): Promise<Response> {
  const r = ready(request, deps);
  if (r instanceof Response) return r;
  try {
    await ensureUser(r);
    return Response.json(await r.users.listHistory(r.anonId));
  } catch (e) {
    return fail("history get", e);
  }
}

export async function handleFavoritesGet(request: Request, deps: UserDataDeps): Promise<Response> {
  const r = ready(request, deps);
  if (r instanceof Response) return r;
  try {
    await ensureUser(r);
    return Response.json(await r.users.listFavorites(r.anonId));
  } catch (e) {
    return fail("favorites get", e);
  }
}

export async function handleFavoritePut(request: Request, recipeId: string, deps: UserDataDeps): Promise<Response> {
  const r = ready(request, deps);
  if (r instanceof Response) return r;
  if (!RECIPE_ID.test(recipeId)) return error(404, "not_found", "Recipe not found");
  const parsed = await readJson(request);
  if (!parsed.ok) return error(400, "bad_request", "Body is not JSON");
  const favorite = (parsed.body as { favorite?: unknown } | null)?.favorite;
  if (typeof favorite !== "boolean") return error(400, "bad_request", "favorite must be true or false");

  try {
    if (favorite) {
      const recipe = await r.recipes.byId(recipeId);
      if (!recipe || recipe.allergens === null) return error(404, "not_found", "Recipe not found");
    }
    await ensureUser(r);
    await r.users.setFavorite(r.anonId, Number(recipeId), favorite);
    return new Response(null, { status: 204 });
  } catch (e) {
    return fail("favorite put", e);
  }
}
