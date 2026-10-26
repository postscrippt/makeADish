// Hard allergy filter for swap suggestions, same rule as recipes: unknown allergens (null) are never shown.
export type SwapOption = { label: string; ingredientIds: string[]; allergens: string[] | null };
export type SwapResult = { kind: "none" } | { kind: "unsafe" } | { kind: "ok"; options: SwapOption[] };

export function safeSwaps(options: SwapOption[] | undefined, allergies: string[]): SwapResult {
  if (!options || options.length === 0) return { kind: "none" };
  const safe = options.filter((o) => o.allergens !== null && !o.allergens.some((a) => allergies.includes(a)));
  return safe.length === 0 ? { kind: "unsafe" } : { kind: "ok", options: safe };
}
