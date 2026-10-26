// The recipe batches that get loaded into the database. Each has its own `source` tag, so re-running one batch's
// SQL only touches that batch's dishes. Add a new batch here, then run `node scripts/build-recipes-sql.mjs`.
export const RECIPE_BATCHES = [
  { file: "data/recipes/batch-0.md", sql: "supabase/seed/recipes-batch-0.sql", source: "own:batch-0" },
  { file: "data/recipes/batch-1.md", sql: "supabase/seed/recipes-batch-1.sql", source: "own:batch-1" },
  { file: "data/recipes/batch-2.md", sql: "supabase/seed/recipes-batch-2.sql", source: "own:batch-2" },
] as const;
