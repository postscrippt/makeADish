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
  const soup = rankRecipes([hot], { ...base, ingredientIds: ["egg"], category: "soup" });
  assert.equal(soup.tries, 3, "the category is only dropped on the last try");
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
  assert.deepEqual(rankRecipes([dish], { ...base, ingredientIds: ["salt", "fish-sauce"] }), { matches: [], almostThere: [], partial: [], tries: 3 });
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

// ---- retry loop and the partial group ----
const have2: SearchRequest = { ...base, ingredientIds: ["pork", "egg"] };
const forty = (id: string, over: Partial<Recipe> = {}) => recipe(id, { ids: ["pork", "egg", `${id}-a`, `${id}-b`, `${id}-c`], ...over }); // 2 of 5 = 40%, 3 missing
const twenty = (id: string, over: Partial<Recipe> = {}) => recipe(id, { ids: ["pork", "egg", `${id}-a`, `${id}-b`, `${id}-c`, `${id}-d`, `${id}-e`], ...over }); // 2 of 7 = 29%, 5 missing: under the 30% floor

test("three or more dishes from the strict search stop at try 1 with no partial group", () => {
  const r = rankRecipes(catalog, base);
  assert.equal(r.tries, 1);
  assert.deepEqual(r.partial, []);
});

test("try 2 adds partial dishes at the 30% floor, best match first, with what is missing", () => {
  const r = rankRecipes([forty("a"), forty("b"), forty("c"), twenty("low")], have2);
  assert.equal(r.tries, 2);
  assert.deepEqual(r.partial.map((m) => m.recipe.id), ["a", "b", "c"]);
  assert.ok(r.partial.every((m) => m.matchPercent === 40 && m.missing.length === 3));
  assert.deepEqual(r.partial[0].missing.map((x) => x.id), ["a-a", "a-b", "a-c"]);
});

test("try 3 accepts a dish below the floor, and reports 3 tries even when it is still short", () => {
  const r = rankRecipes([forty("a"), twenty("low")], have2);
  assert.equal(r.tries, 3);
  assert.deepEqual(r.partial.map((m) => [m.recipe.id, m.matchPercent]), [["a", 40], ["low", 29]]);
});

test("a partial dish needs at least 2 owned non-staple ingredients, on every try", () => {
  const onePork = recipe("one-owned", { ids: ["pork", "a", "b", "c"] }); // 1 of 4: one owned, three missing
  const r = rankRecipes([onePork], { ...base, ingredientIds: ["pork"] });
  assert.equal(r.tries, 3);
  assert.deepEqual(r.partial, []);
  const two = rankRecipes([recipe("two-owned", { ids: ["pork", "egg", "a", "b", "c", "d", "e"] })], have2);
  assert.deepEqual(two.partial.map((m) => m.recipe.id), ["two-owned"]);
});

test("the partial group is capped at 5, and a dish is in one group only", () => {
  const many = Array.from({ length: 8 }, (_, i) => forty(`d${i}`));
  const r = rankRecipes([...many, recipe("full", { ids: ["pork", "egg"] })], have2);
  assert.equal(r.partial.length, 5);
  assert.deepEqual(r.matches.map((m) => m.recipe.id), ["full"]);
  assert.ok(!r.partial.some((m) => m.recipe.id === "full"));
});

test("the food-type filter is respected until try 3, then dropped", () => {
  const stirFry = [forty("a"), forty("b"), forty("c")];
  assert.equal(rankRecipes(stirFry, { ...have2, category: "stir-fry" }).tries, 2);
  const soupOnly = rankRecipes(stirFry, { ...have2, category: "soup" });
  assert.equal(soupOnly.tries, 3);
  assert.equal(soupOnly.partial.length, 3);
});

test("allergies, unknown allergen data and spice are never relaxed, on any try", () => {
  const dishes = [
    forty("egg-dish", { allergens: ["egg"] }),
    forty("unknown", { allergens: null }),
    forty("hot", { spice: 3 }),
    twenty("egg-low", { allergens: ["egg"] }),
  ];
  const r = rankRecipes(dishes, { ...have2, spice: 1, allergies: ["egg"] });
  assert.equal(r.tries, 3);
  assert.deepEqual([r.matches, r.almostThere, r.partial], [[], [], []]);
});

test("staples do not count toward the partial percentage either", () => {
  const dish = recipe("staple-heavy", { ids: ["pork", "egg", "a", "b", "c", "salt", "sugar", "fish-sauce"] });
  const r = rankRecipes([dish], have2);
  assert.equal(r.partial[0].matchPercent, 40);
  assert.ok(r.partial[0].missing.every((x) => !["salt", "sugar", "fish-sauce"].includes(x.id)));
});

test("holding no core ingredient of any dish still gives nothing, even on try 3", () => {
  const r = rankRecipes([forty("a"), twenty("b")], { ...base, ingredientIds: ["unrelated"] });
  assert.deepEqual([r.matches, r.almostThere, r.partial], [[], [], []]);
  assert.equal(r.tries, 3);
});
