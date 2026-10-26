// Run: node --test app/recipe/timer.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { secondsLeft } from "./timer.ts";
import { safeSwaps } from "./swaps.ts";
import { substitutes } from "../../mocks/substitutes.ts";

test("secondsLeft follows the wall clock, so a throttled background tab can't fall behind", () => {
  assert.equal(secondsLeft(900_000, 0), 900);
  assert.equal(secondsLeft(900_000, 899_001), 1);
  assert.equal(secondsLeft(900_000, 600_000), 300); // 5 minutes away from the page
  assert.equal(secondsLeft(900_000, 1_000_000), 0);
});

test("store-bought stock is not offered as a safe swap (unknown allergens)", () => {
  const r = safeSwaps(substitutes["coconut-milk"], ["wheat"]);
  assert.ok(r.kind !== "ok" || !r.options.some((o) => o.label === "น้ำซุป"));
});
