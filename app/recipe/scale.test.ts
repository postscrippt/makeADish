// Run: node --test app/recipe/scale.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { scaleQty } from "./scale.ts";

test("scaleQty", () => {
  assert.equal(scaleQty("2 ฟอง", 2), "4 ฟอง");
  assert.equal(scaleQty("150 กรัม", 0.5), "75 กรัม");
  assert.equal(scaleQty("1/2 ช้อนโต๊ะ", 3), "1 1/2 ช้อนโต๊ะ");
  assert.equal(scaleQty("1 1/2 ช้อนโต๊ะ", 2), "3 ช้อนโต๊ะ");
  assert.equal(scaleQty("1/4 หัว", 2), "1/2 หัว");
  assert.equal(scaleQty("3-5 เม็ด", 2), "6-10 เม็ด");
  assert.equal(scaleQty("1 ฟอง", 1 / 3), "1/3 ฟอง");
  assert.equal(scaleQty("ตามชอบ", 2), "ตามชอบ");
  assert.equal(scaleQty("2 ฟอง", 1), "2 ฟอง");
});
