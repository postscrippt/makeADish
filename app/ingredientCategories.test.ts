import assert from "node:assert/strict";
import { test } from "node:test";
import { groupByCategory } from "./ingredientCategories.ts";
import type { Ingredient } from "../types/api.ts";

const x = (id: string, category?: Ingredient["category"]): Ingredient => ({ id, th: id, en: id, aliases: [], category });

test("groups by category in a fixed order and leaves out empty sections", () => {
  const groups = groupByCategory([x("rice", "staple"), x("pork", "meat"), x("chicken", "meat")]);
  assert.deepEqual(groups.map((g) => [g.id, g.items.map((i) => i.id)]), [["meat", ["pork", "chicken"]], ["staple", ["rice"]]]);
});

test("an item without a category lands under other", () => {
  const groups = groupByCategory([x("mystery")]);
  assert.deepEqual(groups.map((g) => g.id), ["other"]);
});
