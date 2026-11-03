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
  // A category with no dish is dropped on try 3, so the dish still shows, after all 3 tries.
  const wrongCategory = rankRecipes([hot], { ...base, ingredientIds: ["egg"], category: "soup" });
  assert.deepEqual([wrongCategory.matches.length, wrongCategory.tries], [1, 3]);
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

// ---- retry loop and the partial group (#79) ----
// Each dish has 4 core ingredients (a-d plus a unique one) so the match % is easy to read: owning 1 of 4 is 25%, 2 of 4 is 50%.
const owned = (...ids: string[]): SearchRequest => ({ ...base, ingredientIds: ids });
const dish = (id: string, ids: string[], over: Partial<Recipe> = {}) => recipe(id, { ids, ...over });

test("try 1 stops the loop when there are already 3 dishes", () => {
  const r = rankRecipes([dish("a", ["egg"]), dish("b", ["egg", "x"]), dish("c", ["egg", "y"]), dish("far", ["egg", "p", "q", "r"])], owned("egg"));
  assert.equal(r.tries, 1);
  assert.deepEqual(r.partial, [], "partial stays empty until try 2");
});

test("try 2 adds partial dishes at the 30% floor, sorted by match %", () => {
  const r = rankRecipes(
    [dish("one", ["egg"]), dish("half", ["egg", "pork", "p", "q"]), dish("third", ["egg", "pork", "p", "q", "r", "s"]), dish("quarter", ["egg", "p", "q", "r"])],
    owned("egg", "pork"),
  );
  // one: 100%. half: 50% (missing 2, almost there). third: 2 of 6 = 33% partial. quarter: 1 of 4 = 25%, below the floor.
  assert.equal(r.tries, 2);
  assert.deepEqual(r.partial?.map((m) => [m.recipe.id, m.matchPercent]), [["third", 33]]);
  assert.deepEqual(r.partial?.[0].missing.map((m) => m.id), ["p", "q", "r", "s"], "each partial dish carries what is missing");
});

test("try 3 lowers the floor to any owned core ingredient", () => {
  const r = rankRecipes([dish("quarter", ["egg", "p", "q", "r"]), dish("tenth", ["egg", "p", "q", "r", "s", "t", "u", "v", "w", "x"])], owned("egg"));
  assert.equal(r.tries, 3);
  assert.deepEqual(r.partial?.map((m) => [m.recipe.id, m.matchPercent]), [["quarter", 25], ["tenth", 10]]);
});

test("try 3 drops the category, tries 1 and 2 keep it", () => {
  const soup = dish("soup", ["egg", "x"], { category: "soup" });
  const fry = dish("fry", ["egg", "y"], { category: "stir-fry" });
  const strict = rankRecipes([soup, fry, dish("fry2", ["egg"], { category: "stir-fry" }), dish("fry3", ["egg", "z"], { category: "stir-fry" })], { ...owned("egg"), category: "stir-fry" });
  assert.equal(strict.tries, 1);
  assert.ok(![...strict.matches, ...strict.almostThere].some((m) => m.recipe.id === "soup"));
  const relaxed = rankRecipes([soup, fry], { ...owned("egg"), category: "stir-fry" });
  assert.equal(relaxed.tries, 3);
  assert.ok([...relaxed.matches, ...relaxed.almostThere].some((m) => m.recipe.id === "soup"));
});

test("the partial group is capped at 5, keeping the best matches", () => {
  const many = Array.from({ length: 8 }, (_, i) => dish(`d${i}`, ["egg", "a", "b", "c", `x${i}`, ...Array.from({ length: i }, (_, k) => `pad${i}-${k}`)]));
  const r = rankRecipes(many, owned("egg"));
  assert.equal(r.partial?.length, 5);
  assert.deepEqual(r.partial?.map((m) => m.recipe.id), ["d0", "d1", "d2", "d3", "d4"]);
});

test("the allergy filter holds on all 3 tries, even for the best partial match", () => {
  const nutty = dish("nutty", ["egg", "pork", "a", "b"], { allergens: ["peanut"] });
  for (const [catalogSize, tries] of [[3, 1], [0, 3]] as const) {
    const filler = Array.from({ length: catalogSize }, (_, i) => dish(`f${i}`, ["egg"]));
    const r = rankRecipes([nutty, ...filler], { ...owned("egg", "pork"), allergies: ["peanut"] });
    assert.equal(r.tries, tries);
    assert.ok(![...r.matches, ...r.almostThere, ...(r.partial ?? [])].some((m) => m.recipe.id === "nutty"), `tries=${tries}`);
  }
});

test("a dish with unknown allergen data is excluded even when it is the best partial match", () => {
  const unknown = dish("unknown", ["egg", "pork", "a", "b"], { allergens: null });
  const r = rankRecipes([unknown, dish("ok", ["egg", "p", "q", "r"])], owned("egg", "pork"));
  assert.equal(r.tries, 3);
  assert.deepEqual([...r.matches, ...r.almostThere, ...(r.partial ?? [])].map((m) => m.recipe.id), ["ok"]);
});

test("spice is never relaxed, on any try", () => {
  const hot = dish("hot", ["egg"], { spice: 3 });
  const r = rankRecipes([hot], { ...owned("egg"), spice: 1 });
  assert.equal(r.tries, 3);
  assert.deepEqual([r.matches, r.almostThere, r.partial], [[], [], []]);
});

test("nothing is returned when the user owns no core ingredient of any dish", () => {
  const r = rankRecipes(catalog, owned("durian"));
  assert.deepEqual([r.matches, r.almostThere, r.partial, r.tries], [[], [], [], 3]);
});

test("staples do not count toward partial matches either", () => {
  const r = rankRecipes([dish("saltonly", ["salt", "sugar", "a", "b", "c", "d"])], owned("salt", "sugar"));
  assert.deepEqual([r.matches, r.almostThere, r.partial], [[], [], []]);
});

test("pork and garlic alone still give at least 3 dishes, ordered by match %", () => {
  const dishes = [
    dish("pork-garlic-rice", ["pork", "garlic", "rice"]),
    dish("pork-stir-fry", ["pork", "basil", "chili", "garlic", "lime"]),
    dish("garlic-soup", ["garlic", "chicken", "galangal", "lemongrass", "lime"]),
    dish("pork-curry", ["pork", "coconut-milk", "curry-paste", "basil", "lime"]),
  ];
  const r = rankRecipes(dishes, owned("pork", "garlic"));
  const all = [...r.matches, ...r.almostThere, ...(r.partial ?? [])];
  assert.ok(all.length >= 3);
  assert.deepEqual(r.almostThere.map((m) => m.recipe.id), ["pork-garlic-rice"]);
  assert.deepEqual(r.partial?.map((m) => m.matchPercent), [...(r.partial ?? [])].map((m) => m.matchPercent).sort((x, y) => y - x));
});
