// Run: node --test app/nav.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { canGoBackNow, recordPath } from "./nav.ts";

// The stack is module state, so the steps below run in order as one story.
test("no back on the first page, back after moving on, none again after going back", () => {
  recordPath("/form");
  assert.equal(canGoBackNow(), false);
  recordPath("/results");
  assert.equal(canGoBackNow(), true);
  recordPath("/recipe/1");
  assert.equal(canGoBackNow(), true);
  recordPath("/results"); // router.back()
  assert.equal(canGoBackNow(), true);
  recordPath("/form"); // router.back() to where the user entered
  assert.equal(canGoBackNow(), false);
});
