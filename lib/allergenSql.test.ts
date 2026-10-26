import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildAllergenSql } from "./allergenSql.ts";
import { allergenRules } from "../data/allergen-rules.ts";

test("tagged ingredients get their rows; unknown ones are marked unknown and have none", () => {
  const sql = buildAllergenSql({ "fish-sauce": ["fish"], salt: [], stock: null });
  assert.match(sql, /\('fish-sauce', 'fish'\)/);
  assert.match(sql, /update ingredients set allergen_status = 'tagged' where slug in \('fish-sauce', 'salt'\)/);
  assert.match(sql, /update ingredients set allergen_status = 'unknown' where slug in \('stock'\)/);
  assert.doesNotMatch(sql, /\('salt', /, "an ingredient with no allergens has no rows");
});

test("it runs in one transaction so a failure cannot leave half-written rules", () => {
  const sql = buildAllergenSql({ salt: [] });
  assert.match(sql, /^begin;$/m);
  assert.match(sql, /^commit;$/m);
});

test("an unknown allergen id is rejected", () => {
  assert.throws(() => buildAllergenSql({ x: ["gluten" as never] }), /unknown allergen id/);
});

test("supabase/seed/ingredient-allergens.sql is up to date (run node scripts/build-allergen-sql.mjs)", () => {
  const onDisk = readFileSync(new URL("../supabase/seed/ingredient-allergens.sql", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  assert.equal(onDisk, buildAllergenSql(allergenRules));
});
