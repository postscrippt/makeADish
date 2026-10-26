import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkDrafts, parseBatch } from "./recipeBatch.ts";
import { buildRecipeSql } from "./recipeSql.ts";
import type { AllergenRules } from "./allergens.ts";
import { allergenRules } from "../data/allergen-rules.ts";
import { ingredients } from "../data/ingredients.ts";

const known = new Set(ingredients.map((i) => i.slug));
const rules: AllergenRules = { salt: [], egg: ["egg"], "fish-sauce": ["fish"], stock: null };
const readFile = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

const dish = (over: { header?: string; rows?: string; steps?: string } = {}) => `# Batch

## 1. ไข่เกลือ (\`egg-salt\`)

Salted egg. fried · spice 0 · 10 min · serves 2 · allergens: \`egg\`

| Ingredient | id | Amount |
|---|---|---|
${over.rows ?? "| ไข่ | `egg` | 2 ฟอง |\n| เกลือ | `salt` | 1 ช้อนชา |"}

${over.steps ?? "1. ตอกไข่\n2. ใส่เกลือ"}

Review: [ ] ok  Notes:
`.replace("fried · spice 0 · 10 min · serves 2 · allergens: `egg`", over.header ?? "fried · spice 0 · 10 min · serves 2 · allergens: `egg`");
const okIds = new Set(["egg", "salt", "stock", "fish-sauce"]);
const check = (md: string) => checkDrafts(parseBatch(md), okIds, rules);

test("a dish is read into its fields", () => {
  const [d] = parseBatch(dish());
  assert.deepEqual(d, {
    slug: "egg-salt", th: "ไข่เกลือ", description: "Salted egg.", category: "fried", spice: 0, minutes: 10, servings: 2,
    documentedAllergens: ["egg"],
    ingredients: [{ slug: "egg", qty: "2 ฟอง" }, { slug: "salt", qty: "1 ช้อนชา" }],
    steps: ["ตอกไข่", "ใส่เกลือ"],
  });
});

test("a good dish passes and carries the allergens the rules derive", () => {
  assert.deepEqual(check(dish()).map((d) => d.allergens), [["egg"]]);
});

test("allergens written in the file that differ from the rules stop the load", () => {
  assert.throws(() => check(dish({ header: "fried · spice 0 · 10 min · serves 2 · allergens: `egg`, `fish`" })), /differ from the ingredient rules/);
  assert.throws(() => check(dish({ header: "fried · spice 0 · 10 min · serves 2 · allergens: `fish`" })), /differ from the ingredient rules/);
});

test("a missing allergen note is caught: a forgotten ingredient cannot slip through as 'none'", () => {
  assert.throws(() => check(dish({ header: "fried · spice 0 · 10 min · serves 2 · allergens: " })), /differ from the ingredient rules/);
});

test("an ingredient with unknown allergens stops the load", () => {
  assert.throws(() => check(dish({ rows: "| ไข่ | `egg` | 2 ฟอง |\n| น้ำซุป | `stock` | 1 ถ้วย |" })), /unknown allergens/);
});

test("an ingredient id that is not in the table stops the load", () => {
  assert.throws(() => check(dish({ rows: "| ไข่ | `egg` | 2 ฟอง |\n| ลับ | `mystery` | 1 |" })), /not in the table: mystery/);
});

test("bad category, spice, time, empty steps and duplicates are refused", () => {
  assert.throws(() => check(dish({ header: "dessert · spice 0 · 10 min · serves 2 · allergens: `egg`" })), /unknown category/);
  assert.throws(() => check(dish({ header: "fried · spice 4 · 10 min · serves 2 · allergens: `egg`" })), /spice must be 0 to 3/);
  assert.throws(() => check(dish({ header: "fried · spice 0 · 0 min · serves 2 · allergens: `egg`" })), /minutes/);
  assert.throws(() => check(dish({ steps: "" })), /no steps/);
  assert.throws(() => check(dish({ rows: "| ไข่ | `egg` | 2 ฟอง |\n| ไข่ | `egg` | 1 ฟอง |" })), /listed twice/);
  assert.throws(() => check(dish() + dish().replace("# Batch", "")), /duplicate dish id/);
});

test("a dish with no header line is refused with its id in the message", () => {
  assert.throws(() => parseBatch(dish({ header: "just some words" })), /egg-salt: no header line/);
});

test("the generated SQL is one transaction, finds a dish by source and title, and keeps ids on re-run", () => {
  const sql = buildRecipeSql("own:test", check(dish()), "x.md");
  assert.match(sql, /^begin;$/m);
  assert.match(sql, /^commit;$/m);
  assert.match(sql, /where source = 'own:test' and title_th = 'ไข่เกลือ'/);
  assert.match(sql, /update recipes set/);
  assert.doesNotMatch(sql, /delete from recipes/, "deleting a recipe would break history and favorites that point at it");
  assert.match(sql, /\(rid, 'egg'\)/);
});

test("quotes in text are escaped", () => {
  const sql = buildRecipeSql("own:test", check(dish({ steps: "1. ใส่ 'เกลือ'" })), "x.md");
  assert.match(sql, /''เกลือ''/);
});

// ---- the real draft file ----
const real = parseBatch(readFile("../data/recipes/batch-1.md"));

test("the draft file has 10 dishes and every one passes the checks", () => {
  assert.equal(real.length, 10);
  assert.doesNotThrow(() => checkDrafts(real, known, allergenRules));
});

test("every real dish has a Thai title, at least 3 ingredients and 3 steps", () => {
  for (const d of real) {
    assert.match(d.th, /[฀-๿]/, d.slug);
    assert.ok(d.ingredients.length >= 3, `${d.slug} ingredients`);
    assert.ok(d.steps.length >= 3, `${d.slug} steps`);
  }
});

test("supabase/seed/recipes-batch-1.sql is up to date (run node scripts/build-recipes-sql.mjs)", () => {
  const onDisk = readFile("../supabase/seed/recipes-batch-1.sql").replace(/\r\n/g, "\n");
  assert.equal(onDisk, buildRecipeSql("own:batch-1", checkDrafts(real, known, allergenRules), "data/recipes/batch-1.md"));
});
