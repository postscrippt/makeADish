// Regenerates supabase/seed/recipes-batch-1.sql from data/recipes/batch-1.md.
// Run from the repo root: node scripts/build-recipes-sql.mjs   (Node 22.18+ runs the .ts imports directly)
// It stops with an error if any dish has an unknown ingredient id or allergens that differ from the rules.
import { readFileSync, writeFileSync } from "node:fs";
import { allergenRules } from "../data/allergen-rules.ts";
import { ingredients } from "../data/ingredients.ts";
import { checkDrafts, parseBatch } from "../lib/recipeBatch.ts";
import { buildRecipeSql } from "../lib/recipeSql.ts";

const batchFile = "data/recipes/batch-1.md";
const drafts = checkDrafts(parseBatch(readFileSync(batchFile, "utf8")), new Set(ingredients.map((i) => i.slug)), allergenRules);
writeFileSync("supabase/seed/recipes-batch-1.sql", buildRecipeSql("own:batch-1", drafts, batchFile));
console.log(`Wrote supabase/seed/recipes-batch-1.sql (${drafts.length} dishes)`);
