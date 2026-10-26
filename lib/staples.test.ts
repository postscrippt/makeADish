import test from "node:test";
import assert from "node:assert/strict";
import { STAPLES } from "../data/staples.ts";
import { ingredients } from "../data/ingredients.ts";

test("every staple is an ingredient in the table, listed once", () => {
  const known = new Set(ingredients.map((i) => i.slug));
  for (const s of STAPLES) assert.ok(known.has(s), `${s} is not in data/ingredients.ts`);
  assert.equal(new Set(STAPLES).size, STAPLES.length);
});

test("the staples are basics, not main ingredients", () => {
  const mains = new Set(["meat", "seafood", "egg-dairy", "vegetable", "fruit", "noodle", "herb"]);
  for (const s of STAPLES) assert.ok(!mains.has(ingredients.find((i) => i.slug === s)!.category), `${s} looks like a main ingredient`);
});
