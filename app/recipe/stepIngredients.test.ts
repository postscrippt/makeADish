// Run: node --test app/recipe/stepIngredients.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { stepIngredients } from "./stepIngredients.ts";
import { recipes } from "../../mocks/recipes.ts";

const omelette = recipes.find((r) => r.id === "khai-jiao-moo-sap")!;

test("finds the ingredients a step names, also when the recipe lists a prep word", () => {
  const ids = stepIngredients(omelette.steps[0], omelette.ingredients).map((x) => x.id);
  assert.deepEqual(ids, ["egg", "pork", "garlic"]); // the step says "กระเทียม", the recipe says "กระเทียมสับ"
});

test("a step with no ingredient in it finds none", () => {
  assert.deepEqual(stepIngredients(omelette.steps[1], omelette.ingredients), []);
});

test("most mock recipes have at least one step that names an ingredient", () => {
  const withHits = recipes.filter((r) => r.steps.some((s) => stepIngredients(s, r.ingredients).length > 0));
  assert.ok(withHits.length >= recipes.length * 0.8, `${withHits.length}/${recipes.length}`);
});
