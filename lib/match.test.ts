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
  assert.equal(r.almostThere.length, 0, "a dish with 2 ingredients must not show as almost-there at 0%");
});

test("a dish you hold none of is never suggested, however few ingredients it has", () => {
  const tiny = [{ ...catalog[0], ingredients: [{ id: "x", th: "x", qty: "1" }, { id: "y", th: "y", qty: "1" }], allergens: [] }];
  const r = rankRecipes(tiny, { ...base, ingredientIds: ["z"] });
  assert.deepEqual([r.matches, r.almostThere], [[], []]);
  assert.equal(rankRecipes(tiny, { ...base, ingredientIds: ["x"] }).almostThere.length, 1);
});

// ---- pantry staples ----
test("staples are never missing and do not count toward the percentage", () => {
  const dish = recipe("with-staples", { ids: ["egg", "pork", "salt", "fish-sauce", "cooking-oil", "sugar"] });
  const r = rankRecipes([dish], { ...base, ingredientIds: ["egg", "pork"] });
  assert.equal(r.matches.length, 1, "has every non-staple ingredient");
  assert.equal(r.matches[0].matchPercent, 100);
  assert.deepEqual(r.matches[0].missing, []);
});

test("a missing non-staple still counts, out of the non-staple ingredients only", () => {
  const dish = recipe("half", { ids: ["egg", "pork", "salt", "fish-sauce", "sugar"] });
  const r = rankRecipes([dish], { ...base, ingredientIds: ["egg"] });
  assert.equal(r.almostThere[0].matchPercent, 50);
  assert.deepEqual(r.almostThere[0].missing.map((m) => m.id), ["pork"]);
});

test("holding only staples is not holding the dish, and a dish of only staples is never suggested", () => {
  const dish = recipe("needs-egg", { ids: ["egg", "salt"] });
  assert.deepEqual(rankRecipes([dish], { ...base, ingredientIds: ["salt", "fish-sauce"] }), { matches: [], almostThere: [], tries: 1 });
  const onlyStaples = recipe("only-staples", { ids: ["salt", "sugar"] });
  assert.deepEqual(rankRecipes([onlyStaples], { ...base, ingredientIds: ["salt"] }).matches, []);
});

test("a dish with many staples now shows with few typed ingredients", () => {
  const dish = recipe("khai-jiao", { ids: ["egg", "pork", "fish-sauce", "cooking-oil", "pepper", "salt", "oyster-sauce", "soy-sauce"] });
  const r = rankRecipes([dish], { ...base, ingredientIds: ["egg", "pork"] });
  assert.equal(r.matches.length, 1);
});

test("staples never weaken the allergy filter: fish sauce is a staple, but a fish allergy still removes the dish", () => {
  const dish = recipe("fishy", { ids: ["egg", "fish-sauce"], allergens: ["fish"] });
  assert.equal(rankRecipes([dish], { ...base, allergies: ["fish"] }).matches.length, 0);
  assert.equal(rankRecipes([dish], { ...base, allergies: [] }).matches.length, 1);
});

test("a custom staples list can be passed, and an empty one restores the strict rule", () => {
  const dish = recipe("strict", { ids: ["egg", "pork", "salt"] });
  const strict = rankRecipes([dish], { ...base, ingredientIds: ["egg", "pork"] }, []);
  assert.equal(strict.almostThere.length, 1, "salt is missing when nothing is a staple");
});
