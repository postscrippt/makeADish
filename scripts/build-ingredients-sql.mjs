// Regenerates supabase/seed/ingredients.sql from data/ingredients.ts.
// Run from the repo root: node scripts/build-ingredients-sql.mjs   (Node 22.18+ runs the .ts imports directly)
import { mkdirSync, writeFileSync } from "node:fs";
import { ingredients } from "../data/ingredients.ts";
import { buildIngredientsSql } from "../lib/ingredientSql.ts";

mkdirSync("supabase/seed", { recursive: true });
writeFileSync("supabase/seed/ingredients.sql", buildIngredientsSql(ingredients));
console.log(`Wrote supabase/seed/ingredients.sql (${ingredients.length} ingredients)`);
