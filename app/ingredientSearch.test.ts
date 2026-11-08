// Run: node --test app/ingredientSearch.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { searchIngredients } from "./ingredientSearch.ts";
import type { Ingredient } from "../types/api.ts";

const i = (id: string, th: string, en: string, aliases: string[] = []): Ingredient => ({ id, th, en, aliases });
const catalog = [
  i("pork", "หมู", "pork", ["หมูสับ"]),
  i("chicken", "ไก่", "chicken"),
  i("garlic", "กระเทียม", "garlic"),
  i("rice", "ข้าว", "rice", ["ข้าวสวย"]),
  i("fish", "ปลา", "fish"),
];
const ids = (r: Ingredient[]) => r.map((x) => x.id);

test("finds by Thai name, English name and alias", () => {
  assert.deepEqual(ids(searchIngredients(catalog, "กระเทียม")), ["garlic"]);
  assert.deepEqual(ids(searchIngredients(catalog, "Garlic")), ["garlic"]);
  assert.deepEqual(ids(searchIngredients(catalog, "หมูสับ")), ["pork"]);
});

test("ignores spaces and missing Thai tone marks", () => {
  assert.deepEqual(ids(searchIngredients(catalog, " หมู สับ ")), ["pork"]);
  assert.deepEqual(ids(searchIngredients(catalog, "ไก")), ["chicken"]);
  assert.deepEqual(ids(searchIngredients(catalog, "ขาว")), ["rice"]);
});

test("forgives one wrong letter, in English and Thai", () => {
  assert.deepEqual(ids(searchIngredients(catalog, "chiken")), ["chicken"]);
  assert.deepEqual(ids(searchIngredients(catalog, "กระเทียน")), ["garlic"]);
});

test("a short text does not get typo matches", () => {
  assert.deepEqual(searchIngredients(catalog, "ปล่"), searchIngredients(catalog, "ปล")); // contains only
});

test("rubbish finds nothing", () => {
  assert.deepEqual(searchIngredients(catalog, "zzzzqq"), []);
  assert.deepEqual(searchIngredients(catalog, "   "), []);
  assert.deepEqual(searchIngredients(catalog, "!!!"), []);
});

test("starts-with beats contains, and chosen items are left out", () => {
  const c = [i("a", "ต้นหอม", "x"), i("b", "หอมแดง", "y"), i("c", "หอม", "z")];
  assert.deepEqual(ids(searchIngredients(c, "หอม")), ["b", "c", "a"]);
  assert.deepEqual(ids(searchIngredients(c, "หอม", [c[2]])), ["b", "a"]);
});

test("returns at most six suggestions", () => {
  const many = Array.from({ length: 10 }, (_, n) => i(`x${n}`, `ผัก${n}`, `veg${n}`));
  assert.equal(searchIngredients(many, "ผัก").length, 6);
});
