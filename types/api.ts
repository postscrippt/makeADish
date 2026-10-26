// PROPOSED shapes for docs/api-contract.md (issue #2). Not yet agreed with Person B.

export type Ingredient = { id: string; th: string; en: string; aliases: string[] };

export type ScanResult =
  | { ok: true; ingredients: Ingredient[] }
  | { ok: false; reason: "no_food" | "blurry" | "error" };

export type SpiceLevel = 0 | 1 | 2 | 3;

export type Option = { id: string; th: string };

// staples: ingredient ids assumed to be in every kitchen. Search never counts them as missing, and pages should not
// list them under "ต้องซื้อเพิ่ม". Optional so old mocks still type-check.
export type Options = { allergens: Option[]; categories: Option[]; staples?: string[] };

export type Profile = {
  anonId: string;
  allergies: string[];
  spice: SpiceLevel;
};

export type SearchRequest = {
  ingredientIds: string[]; // canonical ids only
  spice: SpiceLevel;
  category: string | null; // null = any
  allergies: string[]; // allergen ids, hard filter
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

export type RecipeSummary = RecipeMatch["recipe"];

export type Favorite = Pick<Recipe, "id" | "th">;

export type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  recipes?: Pick<Recipe, "id" | "th">[]; // dishes the answer refers to, shown as links
};
