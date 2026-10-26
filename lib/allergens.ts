// Turns ingredient-level allergen rules into recipe-level and swap-level allergens (issue #21).
// Unknown wins: one unknown ingredient makes the whole result unknown (null), and null is never shown.
import type { AllergenId } from "../data/allergen-rules.ts";

export type AllergenRules = Record<string, AllergenId[] | null>;

// null = unknown. An ingredient with no rule at all also counts as unknown, never as "none".
export function allergensOf(slugs: string[], rules: AllergenRules): AllergenId[] | null {
  if (slugs.length === 0) return null; // nothing to judge from
  const found = new Set<AllergenId>();
  for (const slug of slugs) {
    const rule = Object.hasOwn(rules, slug) ? rules[slug] : null;
    if (rule === null) return null;
    for (const a of rule) found.add(a);
  }
  return [...found].sort();
}

// What the `recipes` table stores: the derived allergens plus the status the search filter relies on.
export function recipeTags(slugs: string[], rules: AllergenRules): { allergens: AllergenId[] | null; status: "tagged" | "unknown" } {
  const allergens = allergensOf(slugs, rules);
  return { allergens, status: allergens === null ? "unknown" : "tagged" };
}

// A swap option is the same: the union of its ingredients' allergens, or unknown.
export const swapAllergens = allergensOf;

// The hard filter, as plain code: unknown (null) is excluded, and so is any overlap with the user's allergies.
export function isSafe(allergens: string[] | null, userAllergies: string[]): boolean {
  return allergens !== null && !allergens.some((a) => userAllergies.includes(a));
}
