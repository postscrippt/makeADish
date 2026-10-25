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
