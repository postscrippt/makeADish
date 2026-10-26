import test from "node:test";
import assert from "node:assert/strict";
import { rankRecipes } from "./match.ts";
import type { Recipe, SearchRequest } from "../types/api.ts";

const ing = (id: string) => ({ id, th: id, qty: "1" });
const recipe = (id: string, over: Partial<Recipe> & { ids: string[] }): Recipe => ({
  id, th: id, en: id, category: "stir-fry", spice: 1, minutes: 10, baseServings: 1, allergens: [],
  ingredients: over.ids.map(ing), steps: [], ...over,
});

const base: SearchRequest = { ingredientIds: ["egg", "pork", "garlic"], spice: 3, category: null, allergies: [] };
const catalog: Recipe[] = [
  recipe("full", { ids: ["egg", "pork", "garlic"] }), // 100%, nothing missing
  recipe("one-short", { ids: ["egg", "pork", "garlic", "lime"] }), // 75%, 1 missing
  recipe("two-short", { ids: ["egg", "pork", "lime", "chili"] }), // 50%, 2 missing
  recipe("three-short", { ids: ["egg", "lime", "chili", "basil"] }), // 25%, 3 missing: hidden
];

test("match % is computed from ingredient-id overlap, in code", () => {
  const r = rankRecipes(catalog, base);
  assert.deepEqual(r.matches.map((m) => [m.recipe.id, m.matchPercent]), [["full", 100]]);
  assert.deepEqual(r.almostThere.map((m) => [m.recipe.id, m.matchPercent]), [["one-short", 75], ["two-short", 50]]);
  assert.deepEqual(r.almostThere[0].missing, [{ id: "lime", th: "lime" }]);
});

test("more than 2 missing items is hidden", () => {
  const r = rankRecipes(catalog, base);
  assert.ok(![...r.matches, ...r.almostThere].some((m) => m.recipe.id === "three-short"));
});

test("a recipe with unknown allergen data (null) is never returned", () => {
  const r = rankRecipes([recipe("unknown", { ids: ["egg"], allergens: null })], { ...base, ingredientIds: ["egg"] });
  assert.equal(r.matches.length + r.almostThere.length, 0);
});

test("allergy hard filter removes the dish for each allergen", () => {
  for (const allergen of ["egg", "fish", "shellfish", "peanut", "soy", "tree_nut"]) {
    const r = rankRecipes([recipe("dish", { ids: ["egg"], allergens: [allergen, "wheat"] })], {
      ...base, ingredientIds: ["egg"], allergies: [allergen],
    });
    assert.equal(r.matches.length + r.almostThere.length, 0, `${allergen} must be filtered`);
  }
});

test("a different allergy does not remove the dish", () => {
  const r = rankRecipes([recipe("dish", { ids: ["egg"], allergens: ["egg"] })], { ...base, ingredientIds: ["egg"], allergies: ["peanut"] });
  assert.equal(r.matches.length, 1);
});

test("spice level means up to this level; category null means any", () => {
  const hot = recipe("hot", { ids: ["egg"], spice: 3 });
  assert.equal(rankRecipes([hot], { ...base, ingredientIds: ["egg"], spice: 2 }).matches.length, 0);
  assert.equal(rankRecipes([hot], { ...base, ingredientIds: ["egg"], spice: 3 }).matches.length, 1);
  assert.equal(rankRecipes([hot], { ...base, ingredientIds: ["egg"], category: "soup" }).matches.length, 0);
});

test("no ingredients entered gives nothing, not a crash", () => {
  const r = rankRecipes(catalog, { ...base, ingredientIds: [] });
  assert.equal(r.matches.length, 0);
});
