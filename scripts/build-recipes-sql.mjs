// Regenerates supabase/seed/recipes-batch-N.sql from data/recipes/batch-N.md for every batch below.
// Run from the repo root: node scripts/build-recipes-sql.mjs   (Node 22.18+ runs the .ts imports directly)
// It stops with an error if any dish has an unknown ingredient id or allergens that differ from the rules.
import { readFileSync, writeFileSync } from "node:fs";
import { allergenRules } from "../data/allergen-rules.ts";
import { ingredients } from "../data/ingredients.ts";
import { checkDrafts, parseBatch } from "../lib/recipeBatch.ts";
import { buildRecipeSql } from "../lib/recipeSql.ts";
import { RECIPE_BATCHES } from "../data/recipes/batches.ts";

const known = new Set(ingredients.map((i) => i.slug));
for (const b of RECIPE_BATCHES) {
  const drafts = checkDrafts(parseBatch(readFileSync(b.file, "utf8")), known, allergenRules);
  writeFileSync(b.sql, buildRecipeSql(b.source, drafts, b.file));
  console.log(`Wrote ${b.sql} (${drafts.length} dishes)`);
}
