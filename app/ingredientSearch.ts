// Search for the ingredient picker. It forgives what a person really types: spaces, missing Thai tone marks,
// and one wrong letter ("chiken", "กระเทียน"). It only ever suggests catalog items, so nothing outside the
// canonical list can be added. normalize() is Person B's (lib/ingredients.ts), imported as is.
import { normalize } from "../lib/ingredients.ts";
import type { Ingredient } from "../types/api.ts";

const MAX_SUGGESTIONS = 6;
const MIN_TYPO_LENGTH = 3; // shorter text matches only by containing, to avoid noise

// Normalized, and without Thai tone marks (่ ้ ๊ ๋), so "ไก" finds ไก่ and "ขาว" finds ข้าว.
const fold = (s: string) => normalize(s).replace(/[่-๋]/g, "");

// True when a and b differ by at most one inserted, deleted or changed letter.
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1);
  return a.length > b.length ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
}

// Best first: a name that starts with the text, then one that contains it, then a one-letter typo.
export function searchIngredients(catalog: Ingredient[], query: string, exclude: Ingredient[] = []): Ingredient[] {
  const q = fold(query);
  if (!q) return [];
  const taken = new Set(exclude.map((x) => x.id));
  const rank = (x: Ingredient): number => {
    const names = [x.th, x.en, ...x.aliases].map(fold);
    if (names.some((n) => n.startsWith(q))) return 0;
    if (names.some((n) => n.includes(q))) return 1;
    if (q.length >= MIN_TYPO_LENGTH && names.some((n) => withinOneEdit(n, q))) return 2;
    return 3;
  };
  return catalog
    .filter((x) => !taken.has(x.id))
    .map((x) => [x, rank(x)] as const)
    .filter(([, r]) => r < 3)
    .sort((a, b) => a[1] - b[1])
    .slice(0, MAX_SUGGESTIONS)
    .map(([x]) => x);
}
