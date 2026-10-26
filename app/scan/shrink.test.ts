// Run: node --test app/scan/shrink.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { fitSize, MAX_SIDE, MAX_BYTES } from "./shrink.ts";

test("fitSize caps the longest side and keeps the shape", () => {
  assert.deepEqual(fitSize(4032, 3024), { width: 1600, height: 1200 }); // iPhone landscape
  assert.deepEqual(fitSize(3024, 4032), { width: 1200, height: 1600 }); // portrait
  assert.deepEqual(fitSize(4000, 4000), { width: 1600, height: 1600 });
  assert.deepEqual(fitSize(1000, 3), { width: 1000, height: 3 }); // already small: never upscaled
  assert.deepEqual(fitSize(9000, 1), { width: 1600, height: 1 }); // never rounds to 0
});

test("limits match the API contract", () => {
  assert.equal(MAX_SIDE, 1600);
  assert.equal(MAX_BYTES, 5 * 1024 * 1024);
});
