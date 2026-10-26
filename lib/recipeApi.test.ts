import test from "node:test";
import assert from "node:assert/strict";
import { handleRecipeGet, handleRecipeList, handleRecommend, validateSearch, type Deps } from "./recipeApi.ts";
import type { ProfileStore, SavedProfile } from "./profile.ts";
import type { RecipeStore } from "./recipeStore.ts";
import type { Recipe, SearchResult, RecipeSummary } from "../types/api.ts";

const ID = "3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b";

const recipe = (id: string, th: string, ingredients: string[], over: Partial<Recipe> = {}): Recipe => ({
  id, th, en: "", category: "stir-fry", spice: 1, minutes: 10, baseServings: 1, allergens: [],
  ingredients: ingredients.map((i) => ({ id: i, th: i, qty: "1" })), steps: ["go"], ...over,
});

const CATALOG: Recipe[] = [
  recipe("1", "ไข่เจียว", ["egg", "oil"], { allergens: ["egg"] }),
  recipe("2", "ผัดหมู", ["pork", "garlic"], { allergens: [] }),
  recipe("3", "ผัดลึกลับ", ["pork", "mystery"], { allergens: null }),
  recipe("4", "ต้มยำ", ["shrimp", "lime"], { category: "soup", spice: 3, allergens: ["shellfish"], en: "Tom Yum" }),
];

function deps(opts: { saved?: SavedProfile; failRecipes?: boolean; failProfile?: boolean; none?: boolean } = {}): Deps {
  if (opts.none) return { recipes: null, profiles: null };
  const recipes: RecipeStore = {
    async all() {
      if (opts.failRecipes) throw new Error("recipes down postgres://secret");
      return CATALOG;
    },
    async byId(id) {
      if (opts.failRecipes) throw new Error("recipes down");
      return CATALOG.find((r) => r.id === id) ?? null;
    },
  };
  const profiles: ProfileStore = {
    async getOrCreate() {
      if (opts.failProfile) throw new Error("profile down");
      return opts.saved ?? { allergies: [], spice: 1 };
    },
    async save() {},
    async linkLine() {},
    async findByLineUserId() {
      return null;
    },
  };
  return { recipes, profiles };
}

const headers = { "x-anon-id": ID };
const post = (body: unknown, h: Record<string, string> = headers) => new Request("http://x/api/recommend", { method: "POST", headers: h, body: JSON.stringify(body) });
const get = (path = "/api/recipes", h: Record<string, string> = headers) => new Request("http://x" + path, { headers: h });
const search = (over: Record<string, unknown> = {}) => ({ ingredientIds: ["pork", "garlic", "egg", "oil", "shrimp", "lime"], spice: 3, category: null, allergies: [], ...over });
const titles = (r: SearchResult) => [...r.matches, ...r.almostThere].map((m) => m.recipe.th);

test("recommend ranks the catalog and never returns a recipe with unknown allergens", async () => {
  const res = await handleRecommend(post(search()), deps());
  assert.equal(res.status, 200);
  const body = (await res.json()) as SearchResult;
  assert.deepEqual(titles(body).sort(), ["ต้มยำ", "ผัดหมู", "ไข่เจียว"].sort());
  assert.ok(!titles(body).includes("ผัดลึกลับ"), "the unknown-allergen dish is hidden even though it nearly matches");
});

test("recommend removes dishes with the allergens sent in the request", async () => {
  const body = (await (await handleRecommend(post(search({ allergies: ["egg"] })), deps())).json()) as SearchResult;
  assert.ok(!titles(body).includes("ไข่เจียว"));
});

test("recommend also applies the SAVED allergies, so an empty list from a stale client changes nothing", async () => {
  const body = (await (await handleRecommend(post(search({ allergies: [] })), deps({ saved: { allergies: ["shellfish"], spice: 1 } }))).json()) as SearchResult;
  assert.ok(!titles(body).includes("ต้มยำ"));
  assert.ok(titles(body).includes("ผัดหมู"));
});

test("recommend respects spice (up to) and category", async () => {
  const mild = (await (await handleRecommend(post(search({ spice: 1 })), deps())).json()) as SearchResult;
  assert.ok(!titles(mild).includes("ต้มยำ"));
  const soup = (await (await handleRecommend(post(search({ category: "soup" })), deps())).json()) as SearchResult;
  assert.deepEqual(titles(soup), ["ต้มยำ"]);
});

test("recommend: an empty result is a normal 200", async () => {
  const res = await handleRecommend(post(search({ ingredientIds: [] })), deps());
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { matches: [], almostThere: [], tries: 1 });
});

test("recommend validates the body and the header", async () => {
  const d = deps();
  const bad: unknown[] = [
    search({ ingredientIds: "pork" }), search({ ingredientIds: [1] }), search({ ingredientIds: new Array(101).fill("a") }),
    search({ spice: 4 }), search({ spice: "2" }), search({ category: "dessert" }), search({ category: undefined }),
    search({ allergies: ["gluten"] }), search({ allergies: "egg" }), [], null,
  ];
  for (const b of bad) assert.equal((await handleRecommend(post(b), d)).status, 400, JSON.stringify(b));
  assert.equal((await handleRecommend(post(search(), {}), d)).status, 400, "no x-anon-id");
  assert.equal((await handleRecommend(new Request("http://x", { method: "POST", headers, body: "{nope" }), d)).status, 400);
});

test("no database settings is 503; a database failure is 500 with no details", async () => {
  assert.equal((await handleRecommend(post(search()), deps({ none: true }))).status, 503);
  for (const o of [{ failRecipes: true }, { failProfile: true }]) {
    const res = await handleRecommend(post(search()), deps(o));
    assert.equal(res.status, 500);
    assert.doesNotMatch(JSON.stringify(await res.json()), /secret|postgres/);
  }
});

test("if the saved profile cannot be read, nothing is returned instead of an unfiltered list", async () => {
  const res = await handleRecommend(post(search()), deps({ failProfile: true }));
  assert.equal(res.status, 500);
});

test("validateSearch removes duplicate ingredient ids", () => {
  const r = validateSearch(search({ ingredientIds: ["egg", "egg", "pork"] }));
  assert.ok(r.ok && r.req.ingredientIds.length === 2);
});

// ---- catalog ----
test("the list hides unknown-allergen dishes and the saved allergens, and needs no allergies in the URL", async () => {
  const all = (await (await handleRecipeList(get(), deps())).json()) as RecipeSummary[];
  assert.deepEqual(all.map((r) => r.th), ["ไข่เจียว", "ผัดหมู", "ต้มยำ"]);
  const filtered = (await (await handleRecipeList(get(), deps({ saved: { allergies: ["egg"], spice: 1 } }))).json()) as RecipeSummary[];
  assert.deepEqual(filtered.map((r) => r.th), ["ผัดหมู", "ต้มยำ"]);
});

test("the list can be searched by Thai or English text and by category", async () => {
  const d = deps();
  assert.deepEqual(((await (await handleRecipeList(get("/api/recipes?q=หมู"), d)).json()) as RecipeSummary[]).map((r) => r.id), ["2"]);
  assert.deepEqual(((await (await handleRecipeList(get("/api/recipes?q=tom"), d)).json()) as RecipeSummary[]).map((r) => r.id), ["4"]);
  assert.deepEqual(((await (await handleRecipeList(get("/api/recipes?category=soup"), d)).json()) as RecipeSummary[]).map((r) => r.id), ["4"]);
  assert.equal((await handleRecipeList(get("/api/recipes?category=dessert"), d)).status, 400);
});

test("recipe detail: found, unknown id and unknown-allergen dish are 200, 404, 404", async () => {
  const d = deps();
  const ok = await handleRecipeGet(get("/api/recipes/2"), "2", d);
  assert.equal(ok.status, 200);
  assert.equal(((await ok.json()) as Recipe).th, "ผัดหมู");
  assert.equal((await handleRecipeGet(get(), "999", d)).status, 404);
  assert.equal((await handleRecipeGet(get(), "3", d)).status, 404, "unknown allergens look like a missing recipe");
});

test("catalog and detail need x-anon-id and a database", async () => {
  assert.equal((await handleRecipeList(get("/api/recipes", {}), deps())).status, 400);
  assert.equal((await handleRecipeGet(get("/x", {}), "2", deps())).status, 400);
  assert.equal((await handleRecipeList(get(), deps({ none: true }))).status, 503);
  assert.equal((await handleRecipeGet(get(), "2", deps({ none: true }))).status, 503);
  assert.equal((await handleRecipeList(get(), deps({ failRecipes: true }))).status, 500);
});
