// Pantry staples: ingredients nearly every Thai kitchen already has. Search assumes you have them, so a dish is
// never "missing" salt or fish sauce, and they do not count toward the match percentage.
// This only affects matching. Allergens are unchanged: a dish with fish sauce still carries the fish tag.
// Edit the list here; every id must exist in data/ingredients.ts (a test checks). Shown to the pages via GET /api/options.
export const STAPLES: string[] = [
  "salt",
  "sugar",
  "pepper",
  "cooking-oil",
  "fish-sauce",
  "soy-sauce",
  "oyster-sauce",
];
