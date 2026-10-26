// Regenerates supabase/seed/ingredient-allergens.sql from data/allergen-rules.ts.
// Run from the repo root: node scripts/build-allergen-sql.mjs   (Node 22.18+ runs the .ts imports directly)
import { mkdirSync, writeFileSync } from "node:fs";
import { allergenRules } from "../data/allergen-rules.ts";
import { buildAllergenSql } from "../lib/allergenSql.ts";

mkdirSync("supabase/seed", { recursive: true });
writeFileSync("supabase/seed/ingredient-allergens.sql", buildAllergenSql(allergenRules));
console.log(`Wrote supabase/seed/ingredient-allergens.sql (${Object.keys(allergenRules).length} ingredients)`);
