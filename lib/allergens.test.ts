import test from "node:test";
import assert from "node:assert/strict";
import { allergenRules, ALLERGEN_IDS } from "../data/allergen-rules.ts";
import { ingredients } from "../data/ingredients.ts";
import { allergensOf, isSafe, recipeTags, swapAllergens } from "./allergens.ts";
import { recipes } from "../mocks/recipes.ts";

const rules = allergenRules;

test("every ingredient has a rule, and every rule is for a real ingredient", () => {
  const slugs = new Set(ingredients.map((e) => e.slug));
  for (const e of ingredients) assert.ok(Object.hasOwn(rules, e.slug), `${e.slug} has no allergen rule`);
  for (const slug of Object.keys(rules)) assert.ok(slugs.has(slug), `rule for unknown ingredient ${slug}`);
});

test("rules only use allergen ids that exist in the allergens table", () => {
  for (const [slug, list] of Object.entries(rules)) for (const a of list ?? []) assert.ok((ALLERGEN_IDS as readonly string[]).includes(a), `${slug}: ${a}`);
});

test("the key Thai allergen sources are tagged", () => {
  assert.deepEqual(rules["fish-sauce"], ["fish"]);
  assert.deepEqual(rules["oyster-sauce"], ["shellfish", "soy", "wheat"]);
  assert.deepEqual(rules["shrimp-paste"], ["shellfish"]);
  assert.deepEqual(rules["dried-shrimp"], ["shellfish"]);
  assert.deepEqual(rules["red-curry-paste"], ["shellfish"]);
  assert.deepEqual(rules["soy-sauce"], ["soy", "wheat"]);
  assert.deepEqual(rules["peanut"], ["peanut"]);
  assert.deepEqual(rules["cashew"], ["tree_nut"]);
  assert.deepEqual(rules["tofu"], ["soy"]);
  assert.deepEqual(rules["squid"], ["shellfish"]);
  assert.deepEqual(rules["coconut-milk"], [], "coconut is not a tree nut");
});

test("brand-dependent ingredients are unknown, not 'none'", () => {
  for (const slug of ["stock", "chili-paste", "chili-sauce", "curry-powder", "instant-noodle", "bread", "sausage", "cooking-oil"]) {
    assert.equal(rules[slug], null, slug);
  }
});

test("allergens are the sorted union of the ingredients", () => {
  assert.deepEqual(allergensOf(["pork", "egg", "oyster-sauce"], rules), ["egg", "shellfish", "soy", "wheat"]);
  assert.deepEqual(allergensOf(["pork", "garlic"], rules), []);
});

test("one unknown ingredient makes the whole result unknown", () => {
  assert.equal(allergensOf(["pork", "egg", "stock"], rules), null);
  assert.equal(recipeTags(["pork", "stock"], rules).status, "unknown");
  assert.equal(recipeTags(["pork", "egg"], rules).status, "tagged");
});

test("an ingredient with no rule, or a recipe with no ingredients, is unknown", () => {
  assert.equal(allergensOf(["pork", "not-in-the-list"], rules), null);
  assert.equal(allergensOf([], rules), null);
});

test("a rule name like 'constructor' is not mistaken for an ingredient", () => {
  assert.equal(allergensOf(["constructor"], rules), null);
});

test("swap options use the same union and unknown rules", () => {
  assert.deepEqual(swapAllergens(["dark-soy-sauce", "sugar"], rules), ["soy", "wheat"]);
  assert.equal(swapAllergens(["stock"], rules), null);
});

test("the hard filter drops unknown and any overlap with the user's allergies", () => {
  assert.equal(isSafe(null, []), false);
  assert.equal(isSafe(["egg"], ["egg"]), false);
  assert.equal(isSafe(["egg"], ["peanut"]), true);
  assert.equal(isSafe([], ["egg", "peanut"]), true);
});

// The rules should reproduce the hand-made tags on the mock recipes. A difference is either a wrong rule or a wrong hand tag.
// Two mock recipes differ on purpose or by a data gap, and are checked separately below.
const MOCK_EXCEPTIONS = new Set(["kaeng-khiao-wan-kai", "moo-kratiam"]);
for (const r of recipes.filter((x) => !MOCK_EXCEPTIONS.has(x.id))) {
  test(`rules reproduce the hand tags for ${r.id}`, () => {
    const derived = allergensOf(r.ingredients.map((x) => x.id), rules);
    assert.deepEqual(derived, r.allergens === null ? null : [...r.allergens].sort());
  });
}

test("green curry: the mock forgot to list the curry paste; with it, the rules match the hand tag", () => {
  const green = recipes.find((x) => x.id === "kaeng-khiao-wan-kai")!;
  const ids = green.ingredients.map((x) => x.id);
  assert.ok(!ids.includes("green-curry-paste"), "if the mock now lists the paste, remove this exception");
  assert.deepEqual(allergensOf(ids, rules), ["fish"], "without the paste the shellfish is missed");
  assert.deepEqual(allergensOf([...ids, "green-curry-paste"], rules), [...green.allergens!].sort());
});

test("garlic fried pork: the mock marks it unknown on purpose; by the rules it has no allergens", () => {
  const pork = recipes.find((x) => x.id === "moo-kratiam")!;
  assert.equal(pork.allergens, null);
  assert.deepEqual(allergensOf(pork.ingredients.map((x) => x.id), rules), []);
});
