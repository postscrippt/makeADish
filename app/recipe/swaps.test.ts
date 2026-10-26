// Run: node --test app/recipe/swaps.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { safeSwaps } from "./swaps.ts";

const soy = { label: "ซีอิ๊วดำ + น้ำตาล", ingredientIds: ["dark-soy", "sugar"], allergens: ["soy", "wheat"] };
const unknown = { label: "ผงปรุงรส", ingredientIds: ["seasoning"], allergens: null };
const salt = { label: "เกลือ", ingredientIds: ["salt"], allergens: [] };

test("safeSwaps", () => {
  assert.deepEqual(safeSwaps(undefined, []), { kind: "none" });
  assert.deepEqual(safeSwaps([], []), { kind: "none" });
  assert.deepEqual(safeSwaps([soy, salt], []), { kind: "ok", options: [soy, salt] });
  assert.deepEqual(safeSwaps([soy, salt], ["soy"]), { kind: "ok", options: [salt] });
  assert.deepEqual(safeSwaps([soy], ["soy"]), { kind: "unsafe" });
  assert.deepEqual(safeSwaps([unknown], []), { kind: "unsafe" });
});

test("every ingredient in the mock recipes has at least one swap", async () => {
  const { recipes } = await import("../../mocks/recipes.ts");
  const { substitutes } = await import("../../mocks/substitutes.ts");
  for (const r of recipes) for (const x of r.ingredients) assert.ok((substitutes[x.id] ?? []).length > 0, x.id);
});
