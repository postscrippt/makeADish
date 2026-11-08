// Carries the in-progress scan and search between pages for this browser tab only.
// sessionStorage (not the URL) so allergies never appear in links or history.
import type { Ingredient, Profile, SearchRequest } from "@/types/api";

type Drafts = { ingredients: Ingredient[]; search: SearchRequest };

export function readDraft<K extends keyof Drafts>(key: K): Drafts[K] | null {
  const raw = sessionStorage.getItem(`aimenu.${key}`);
  return raw ? (JSON.parse(raw) as Drafts[K]) : null;
}

export function writeDraft<K extends keyof Drafts>(key: K, value: Drafts[K]) {
  sessionStorage.setItem(`aimenu.${key}`, JSON.stringify(value));
}

// Starts a search from the ingredients the user has and their saved allergies and spice. Results reads both drafts.
export function startSearch(tags: Ingredient[], { allergies, spice }: Pick<Profile, "allergies" | "spice">): SearchRequest {
  const search: SearchRequest = { ingredientIds: tags.map((t) => t.id), spice, category: null, allergies };
  writeDraft("ingredients", tags);
  writeDraft("search", search);
  return search;
}
