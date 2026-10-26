// Run: node --test app/linkIds.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { idsFromLink } from "./linkIds.ts";

const known = [
  { id: "pork", th: "หมู", en: "pork", aliases: [] },
  { id: "egg", th: "ไข่", en: "egg", aliases: [] },
  { id: "garlic", th: "กระเทียม", en: "garlic", aliases: [] },
];

test("idsFromLink keeps known ingredient ids in link order, once each", () => {
  assert.deepEqual(idsFromLink("egg,pork", known).map((x) => x.id), ["egg", "pork"]);
  assert.deepEqual(idsFromLink("egg,egg, pork ,", known).map((x) => x.id), ["egg", "pork"]);
});

test("idsFromLink ignores anything that isn't a known ingredient", () => {
  assert.deepEqual(idsFromLink("pork,shellfish,<script>", known).map((x) => x.id), ["pork"]);
  assert.deepEqual(idsFromLink("", known), []);
  assert.deepEqual(idsFromLink(null, known), []);
});
