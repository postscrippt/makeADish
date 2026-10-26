import test from "node:test";
import assert from "node:assert/strict";
import { rowToRecipe } from "./recipeStore.ts";

const row = (over: Record<string, unknown> = {}) =>
  ({
    id: 7,
    title_th: "ผัดกะเพรา",
    title_en: null,
    category: "stir-fry",
    spice_level: 2,
    base_servings: 1,
    cook_minutes: 15,
    steps: ["หั่น", "ผัด"],
    allergen_status: "tagged",
    recipe_ingredients: [
      { quantity_text: "200 กรัม", ingredients: { slug: "pork", name_th: "หมู" } },
      { quantity_text: null, ingredients: { slug: "holy-basil", name_th: "กะเพรา" } },
    ],
    recipe_allergens: [{ allergen_id: "soy" }, { allergen_id: "fish" }],
    ...over,
  }) as Parameters<typeof rowToRecipe>[0];

test("a tagged row becomes a Recipe with a string id, sorted allergens and display quantities", () => {
  assert.deepEqual(rowToRecipe(row()), {
    id: "7", th: "ผัดกะเพรา", en: "", category: "stir-fry", spice: 2, minutes: 15, baseServings: 1,
    allergens: ["fish", "soy"],
    ingredients: [{ id: "pork", th: "หมู", qty: "200 กรัม" }, { id: "holy-basil", th: "กะเพรา", qty: "" }],
    steps: ["หั่น", "ผัด"],
  });
});

test("a tagged recipe with no allergen rows means no allergens, an empty list", () => {
  assert.deepEqual(rowToRecipe(row({ recipe_allergens: [] })).allergens, []);
});

test("unknown status is null, even if allergen rows exist", () => {
  assert.equal(rowToRecipe(row({ allergen_status: "unknown" })).allergens, null);
  assert.equal(rowToRecipe(row({ allergen_status: "unknown", recipe_allergens: [] })).allergens, null);
});

test("an unexpected status is treated as unknown, never as safe", () => {
  assert.equal(rowToRecipe(row({ allergen_status: "reviewed-ok" })).allergens, null);
  assert.equal(rowToRecipe(row({ allergen_status: "" })).allergens, null);
});

test("'verified' counts as recorded", () => {
  assert.deepEqual(rowToRecipe(row({ allergen_status: "verified" })).allergens, ["fish", "soy"]);
});

test("odd data does not crash: missing ingredient link, non-list steps, null fields", () => {
  const r = rowToRecipe(row({ recipe_ingredients: [{ quantity_text: "1", ingredients: null }], steps: "not a list", cook_minutes: null, category: null }));
  assert.deepEqual(r.ingredients, []);
  assert.deepEqual(r.steps, []);
  assert.equal(r.minutes, 0);
  assert.equal(r.category, "");
});
