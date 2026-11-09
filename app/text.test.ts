// Run: node --test app/text.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { ALLERGEN_EN, DISH_CATEGORY_EN, allergenName, dictionary, t } from "./text.ts";
import { pickLang } from "./lang.ts";
import { allergenOptions, categoryOptions } from "../data/options.ts";
import { ALLERGEN_IDS } from "../data/allergen-rules.ts";

const THAI = /[฀-๿]/;

test("every dictionary key has non-empty th and en", () => {
  for (const [key, v] of Object.entries(dictionary)) {
    assert.ok(v.th.trim(), `${key} th`);
    assert.ok(v.en.trim(), `${key} en`);
  }
});

test("English values contain no Thai characters", () => {
  for (const [key, v] of Object.entries(dictionary)) assert.doesNotMatch(v.en, THAI, key);
});

test("every allergen id has its standard English label", () => {
  for (const id of ALLERGEN_IDS) assert.ok(ALLERGEN_EN[id], id);
  for (const o of allergenOptions) assert.ok(ALLERGEN_EN[o.id], o.id);
  assert.equal(allergenName({ id: "tree_nut", th: "ถั่วเปลือกแข็ง" }, "en"), "Tree nuts");
  assert.equal(allergenName({ id: "tree_nut", th: "ถั่วเปลือกแข็ง" }, "th"), "ถั่วเปลือกแข็ง");
});

test("every dish category has an English label", () => {
  for (const o of categoryOptions) assert.ok(DISH_CATEGORY_EN[o.id], o.id);
});

test("t fills values and English plurals", () => {
  assert.equal(t("menus.count", "en", { n: 1 }), "1 dish");
  assert.equal(t("menus.count", "en", { n: 2 }), "2 dishes");
  assert.equal(t("menus.count", "th", { n: 2 }), "2 เมนู");
});

test("language: saved choice, then LINE, then the browser, else Thai", () => {
  assert.equal(pickLang("th", "en-US"), "th");
  assert.equal(pickLang("en", "th"), "en");
  assert.equal(pickLang(null, "en-US", "th"), "en");
  assert.equal(pickLang(null, "th", "en-US"), "th");
  assert.equal(pickLang(null, undefined, "en-GB"), "en");
  assert.equal(pickLang(null, "ja"), "th");
  assert.equal(pickLang(null, undefined, undefined), "th");
  assert.equal(pickLang("junk", undefined, "th"), "th");
});
