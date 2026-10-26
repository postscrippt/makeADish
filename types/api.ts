// PROPOSED shapes for docs/api-contract.md (issue #2). Not yet agreed with Person B.

export type Ingredient = { id: string; th: string; en: string; aliases: string[] };

export type ScanResult =
  | { ok: true; ingredients: Ingredient[] }
  | { ok: false; reason: "no_food" | "blurry" | "error" };

export type SpiceLevel = 0 | 1 | 2 | 3;

export type Option = { id: string; th: string };

export type Options = { allergens: Option[]; categories: Option[] };

export type Profile = {
  anonId: string;
  allergies: string[];
  spice: SpiceLevel;
  servings: number;
};

export type SearchRequest = {
  ingredientIds: string[]; // canonical ids only
  spice: SpiceLevel;
  category: string | null; // null = any
  allergies: string[]; // allergen ids, hard filter
  servings: number; // display only, never affects matching
};

export type RecipeIngredient = { id: string; th: string; qty: string }; // qty is display text, e.g. "2 ช้อนโต๊ะ"

export type Recipe = {
  id: string;
  th: string;
  en: string;
  category: string;
  spice: SpiceLevel;
  minutes: number;
  baseServings: number;
  allergens: string[] | null; // null = unknown, never shown
  ingredients: RecipeIngredient[];
  steps: string[];
};

export type RecipeMatch = {
  recipe: Pick<Recipe, "id" | "th" | "en" | "category" | "spice" | "minutes">;
  matchPercent: number; // computed in code from ingredient-id overlap, never by the LLM
  missing: Pick<Ingredient, "id" | "th">[];
};

export type SearchResult = {
  matches: RecipeMatch[]; // missing nothing
  almostThere: RecipeMatch[]; // missing 1-2 items
  tries: number; // agent attempts, max 3
};

export type HistoryEntry = { recipeId: string; th: string; rating: 1 | 2 | 3 | 4 | 5; cookedAt: string }; // cookedAt: ISO date
