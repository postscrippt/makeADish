// Run: node --test app/dishStatus.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { dishStatus, READY_LABEL } from "./dishStatus.ts";

test("a dish with nothing missing is ready", () => {
  assert.deepEqual(dishStatus({ missing: [] }), { ready: true, label: READY_LABEL });
});

test("a dish with missing items says how many and which", () => {
  const s = dishStatus({ missing: [{ id: "a", th: "หมูสับ" }, { id: "b", th: "กระเทียม" }] });
  assert.deepEqual(s, { ready: false, label: "ขาด 2 อย่าง", missing: "หมูสับ, กระเทียม" });
});
