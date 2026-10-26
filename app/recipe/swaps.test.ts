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
