import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildIngredientsSql } from "./ingredientSql.ts";
import { ingredients, type IngredientEntry } from "../data/ingredients.ts";

const entry = (over: Partial<IngredientEntry>): IngredientEntry => ({ slug: "x", th: "ก", en: "x", aliases: [], category: "other", ...over });

test("single quotes are doubled so the SQL stays valid", () => {
  const sql = buildIngredientsSql([entry({ slug: "chili", aliases: ["bird's eye chili"] })]);
  assert.match(sql, /'bird''s eye chili'/);
});

test("no aliases becomes an empty text array", () => {
  assert.match(buildIngredientsSql([entry({})]), /'\{\}'::text\[\]/);
});

test("it upserts by slug and never touches allergen_status", () => {
  const sql = buildIngredientsSql([entry({})]);
  assert.match(sql, /on conflict \(slug\) do update/);
  assert.doesNotMatch(sql, /allergen_status/);
});

test("one row per ingredient", () => {
  const sql = buildIngredientsSql(ingredients);
  assert.equal((sql.match(/^  \('/gm) ?? []).length, ingredients.length);
});

test("supabase/seed/ingredients.sql is up to date (run node scripts/build-ingredients-sql.mjs)", () => {
  const onDisk = readFileSync(new URL("../supabase/seed/ingredients.sql", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  assert.equal(onDisk, buildIngredientsSql(ingredients));
});
