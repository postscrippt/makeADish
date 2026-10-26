// Run: node --test app/recipe/steps.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseStep } from "./steps.ts";
import { recipes } from "../../mocks/recipes.ts";

test("parseStep", () => {
  assert.deepEqual(parseStep("นึ่งไฟกลาง 15 นาทีจนไข่สุก", 0), { verb: "นึ่ง", detail: "ไฟกลาง 15 นาทีจนไข่สุก", icon: "steam", heat: 2, minutes: 15 });
  assert.deepEqual(parseStep("ตั้งกระทะน้ำมันให้ร้อนจัด", 1), { verb: "ตั้ง", detail: "กระทะน้ำมันให้ร้อนจัด", icon: "pan", heat: 3, minutes: null });
  assert.equal(parseStep("ใส่ผักบุ้งและซอส ผัดเร็ว ๆ ไม่เกิน 1 นาที", 2).minutes, 1);
  assert.deepEqual(parseStep("ปรุงรส โรยกระเทียมเจียว", 2), { verb: "ปรุงรส", detail: "โรยกระเทียมเจียว", icon: "season", heat: null, minutes: null });
  assert.equal(parseStep("ปิดไฟ ปรุงด้วยน้ำปลา มะนาว พริก", 2).heat, null);
  assert.deepEqual(parseStep("พักไว้ให้เย็น", 2), { verb: "ขั้นที่ 3", detail: "พักไว้ให้เย็น", icon: "generic", heat: null, minutes: null });
});

test("every mock step gets a real icon", () => {
  for (const r of recipes) r.steps.forEach((s, i) => assert.notEqual(parseStep(s, i).icon, "generic", s));
});
