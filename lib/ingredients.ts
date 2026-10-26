// Maps free text (what the vision model returns, or what a user types) to canonical ingredient slugs.
// Used by the scan endpoint and the LINE webhook; matching later in the app uses the slugs only.
import type { IngredientEntry } from "../data/ingredients.ts";

export type IngredientIndex = {
  byKey: Map<string, string>; // normalized name or alias -> slug
  thaiKeys: string[]; // Thai keys, longest first, for the containment fallback
};

const MIN_CONTAINED_KEY = 3; // shorter Thai keys must match the whole text, to avoid false hits

// Lowercase, Unicode-normalize, and drop everything except letters, marks and digits,
// so "หมู สับ", "หมูสับ" and "หมูสับ " are the same key. Thai marks (tone, vowels) are kept.
export function normalize(text: string): string {
  return text.normalize("NFC").toLowerCase().replace(/[^\p{L}\p{M}\p{N}]/gu, "");
}

const hasThai = (s: string) => /[฀-๿]/.test(s);

// Throws when one key points at two different ingredients, so a clash is caught when the list changes.
export function buildIndex(entries: IngredientEntry[]): IngredientIndex {
  const byKey = new Map<string, string>();
  const add = (raw: string, slug: string) => {
    const key = normalize(raw);
    if (!key) return;
    const existing = byKey.get(key);
    if (existing && existing !== slug) throw new Error(`"${raw}" maps to both ${existing} and ${slug}`);
    byKey.set(key, slug);
  };
  for (const e of entries) {
    add(e.slug, e.slug);
    add(e.th, e.slug);
    add(e.en, e.slug);
    for (const alias of e.aliases) add(alias, e.slug);
  }
  const thaiKeys = [...byKey.keys()].filter(hasThai).sort((a, b) => b.length - a.length);
  return { byKey, thaiKeys };
}

// An exact match wins. Otherwise a known Thai name inside the text wins, longest first, so
// "เนื้อหมูสับ" finds หมูสับ and "น้ำมันหอย" finds oyster sauce, not "น้ำมัน" (oil). Returns null if nothing matches.
export function mapName(text: string, index: IngredientIndex): string | null {
  const key = normalize(text);
  if (!key) return null;
  const exact = index.byKey.get(key);
  if (exact) return exact;
  if (!hasThai(key)) return null;
  const found = index.thaiKeys.find((k) => k.length >= MIN_CONTAINED_KEY && key.includes(k));
  return found ? index.byKey.get(found)! : null;
}

// Several names to unique slugs, in order of first appearance; names it cannot place come back as `unmapped`.
export function mapNames(names: string[], index: IngredientIndex): { ids: string[]; unmapped: string[] } {
  const ids: string[] = [];
  const unmapped: string[] = [];
  for (const name of names) {
    const id = mapName(name, index);
    if (id === null) {
      if (normalize(name)) unmapped.push(name.trim());
    } else if (!ids.includes(id)) {
      ids.push(id);
    }
  }
  return { ids, unmapped };
}
