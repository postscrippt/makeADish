import test from "node:test";
import assert from "node:assert/strict";
import { handleFavoritePut, handleFavoritesGet, handleHistoryGet, handleHistoryPost, type UserDataDeps } from "./userDataApi.ts";
import { mapFavorites, mapHistory, type FavoriteRow, type HistoryRow } from "./userDataStore.ts";
import type { UserDataStore } from "./userDataStore.ts";
import type { ProfileStore } from "./profile.ts";
import type { RecipeStore } from "./recipeStore.ts";
import type { Favorite, HistoryEntry, Recipe } from "../types/api.ts";

const ID = "3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b";
const recipe = (id: string, th: string, allergens: string[] | null): Recipe => ({
  id, th, en: "", category: "stir-fry", spice: 1, minutes: 10, baseServings: 1, allergens, ingredients: [], steps: ["go"],
});
const CATALOG = [recipe("1", "ผัดหมู", []), recipe("2", "ผัดลึกลับ", null)];

function setup(opts: { none?: boolean; failUsers?: boolean } = {}) {
  const log: string[] = [];
  const history: HistoryEntry[] = [];
  const favs = new Set<string>();
  const users: UserDataStore = {
    async addHistory(uid, rid, rating) {
      if (opts.failUsers) throw new Error("db down postgres://secret");
      log.push(`history ${uid} ${rid} ${rating}`);
      return { cookedAt: "2026-10-26T10:00:00.000Z" };
    },
    async listHistory() {
      if (opts.failUsers) throw new Error("db down");
      return history;
    },
    async listFavorites() {
      if (opts.failUsers) throw new Error("db down");
      return [...favs].map((id) => ({ id, th: "x" }));
    },
    async setFavorite(uid, rid, fav) {
      if (opts.failUsers) throw new Error("db down");
      log.push(`favorite ${uid} ${rid} ${fav}`);
      fav ? favs.add(String(rid)) : favs.delete(String(rid));
    },
  };
  const profiles: ProfileStore = {
    async getOrCreate(uid, d) {
      log.push(`ensure ${uid}`);
      return d;
    },
    async save() {},
    async linkLine() {},
    async findByLineUserId() {
      return null;
    },
  };
  const recipes: RecipeStore = { async all() { return CATALOG; }, async byId(id) { return CATALOG.find((r) => r.id === id) ?? null; } };
  const deps: UserDataDeps = opts.none ? { users: null, profiles: null, recipes: null } : { users, profiles, recipes };
  return { deps, log, history };
}

const headers = { "x-anon-id": ID };
const post = (body: unknown, h: Record<string, string> = headers) => new Request("http://x/api/history", { method: "POST", headers: h, body: JSON.stringify(body) });
const put = (body: unknown, h: Record<string, string> = headers) => new Request("http://x/api/favorites/1", { method: "PUT", headers: h, body: JSON.stringify(body) });
const get = (h: Record<string, string> = headers) => new Request("http://x/api/history", { headers: h });

// ---- history ----
test("POST /api/history records the dish, creates the user first, and answers 201 with the HistoryEntry", async () => {
  const { deps, log } = setup();
  const res = await handleHistoryPost(post({ recipeId: "1", rating: 4 }), deps);
  assert.equal(res.status, 201);
  assert.deepEqual(await res.json(), { recipeId: "1", th: "ผัดหมู", rating: 4, cookedAt: "2026-10-26T10:00:00.000Z" });
  assert.deepEqual(log, [`ensure ${ID}`, `history ${ID} 1 4`], "the user row must exist before the history row");
});

test("history: bad bodies are 400 and nothing is written", async () => {
  const { deps, log } = setup();
  const bad: unknown[] = [
    { recipeId: 1, rating: 4 }, { recipeId: "1", rating: 0 }, { recipeId: "1", rating: 6 }, { recipeId: "1", rating: 3.5 },
    { recipeId: "1", rating: "4" }, { recipeId: "1" }, { rating: 4 }, { recipeId: "abc", rating: 4 }, { recipeId: "1; drop", rating: 4 }, null,
  ];
  for (const b of bad) assert.equal((await handleHistoryPost(post(b), deps)).status, 400, JSON.stringify(b));
  assert.equal((await handleHistoryPost(new Request("http://x", { method: "POST", headers, body: "{nope" }), deps)).status, 400);
  assert.deepEqual(log, []);
});

test("history: an unknown dish or one with unknown allergens is 404 and nothing is written", async () => {
  const { deps, log } = setup();
  assert.equal((await handleHistoryPost(post({ recipeId: "99", rating: 4 }), deps)).status, 404);
  assert.equal((await handleHistoryPost(post({ recipeId: "2", rating: 4 }), deps)).status, 404);
  assert.deepEqual(log, []);
});

test("history: GET returns the user's entries", async () => {
  const { deps, history } = setup();
  history.push({ recipeId: "1", th: "ผัดหมู", rating: 5, cookedAt: "2026-10-26T10:00:00.000Z" });
  assert.deepEqual(await (await handleHistoryGet(get(), deps)).json(), history);
});

// ---- favorites ----
test("favorites: PUT true adds, PUT false removes, both answer 204, and GET lists them", async () => {
  const { deps, log } = setup();
  assert.equal((await handleFavoritePut(put({ favorite: true }), "1", deps)).status, 204);
  assert.deepEqual(await (await handleFavoritesGet(get(), deps)).json(), [{ id: "1", th: "x" }]);
  assert.equal((await handleFavoritePut(put({ favorite: false }), "1", deps)).status, 204);
  assert.deepEqual(await (await handleFavoritesGet(get(), deps)).json(), []);
  assert.ok(log.includes(`favorite ${ID} 1 true`) && log.includes(`favorite ${ID} 1 false`));
});

test("favorites: a dish with unknown allergens or an unknown id cannot be added, but removing is always allowed", async () => {
  const { deps, log } = setup();
  assert.equal((await handleFavoritePut(put({ favorite: true }), "2", deps)).status, 404);
  assert.equal((await handleFavoritePut(put({ favorite: true }), "99", deps)).status, 404);
  assert.equal((await handleFavoritePut(put({ favorite: false }), "2", deps)).status, 204);
  assert.ok(!log.some((l) => l.endsWith("2 true")));
});

test("favorites: bad ids and bodies are refused", async () => {
  const { deps } = setup();
  assert.equal((await handleFavoritePut(put({ favorite: true }), "abc", deps)).status, 404);
  assert.equal((await handleFavoritePut(put({ favorite: "yes" }), "1", deps)).status, 400);
  assert.equal((await handleFavoritePut(put({}), "1", deps)).status, 400);
  assert.equal((await handleFavoritePut(put(null), "1", deps)).status, 400);
});

// ---- shared ----
test("every route needs x-anon-id and a database; a failure is 500 with no details", async () => {
  const off = setup({ none: true }).deps;
  const on = setup().deps;
  const calls = (d: UserDataDeps, h: Record<string, string>) => [
    handleHistoryPost(post({ recipeId: "1", rating: 4 }, h), d), handleHistoryGet(get(h), d), handleFavoritesGet(get(h), d), handleFavoritePut(put({ favorite: true }, h), "1", d),
  ];
  for (const res of await Promise.all(calls(on, {}))) assert.equal(res.status, 400);
  for (const res of await Promise.all(calls(off, headers))) assert.equal(res.status, 503);
  for (const res of await Promise.all(calls(setup({ failUsers: true }).deps, headers))) {
    assert.equal(res.status, 500);
    assert.doesNotMatch(JSON.stringify(await res.json()), /secret|postgres/);
  }
});

// ---- row mapping ----
const ref = (status: string) => ({ title_th: "ผัดหมู", allergen_status: status });
const hrow = (over: Partial<HistoryRow> = {}): HistoryRow => ({ recipe_id: 1, rating: 4, cooked_at: "2026-10-26T10:00:00+00:00", recipes: ref("tagged"), ...over });

test("history rows map to entries with ISO dates; unknown-status dishes and bad ratings are dropped", () => {
  const out = mapHistory([hrow(), hrow({ recipes: ref("unknown") }), hrow({ recipes: null }), hrow({ rating: null }), hrow({ rating: 9 }), hrow({ recipes: ref("verified"), recipe_id: 3 })]);
  assert.deepEqual(out.map((e) => e.recipeId), ["1", "3"]);
  assert.equal(out[0].cookedAt, "2026-10-26T10:00:00.000Z");
});

test("favorite rows map to {id, th}; unknown-status dishes and unexpected statuses are dropped", () => {
  const rows: FavoriteRow[] = [{ recipe_id: 1, recipes: ref("tagged") }, { recipe_id: 2, recipes: ref("unknown") }, { recipe_id: 4, recipes: ref("ok") }, { recipe_id: 5, recipes: null }];
  assert.deepEqual(mapFavorites(rows) satisfies Favorite[], [{ id: "1", th: "ผัดหมู" }]);
});
