// Carries the in-progress scan and search between pages for this browser tab only.
// sessionStorage (not the URL) so allergies never appear in links or history.
import type { Ingredient, SearchRequest } from "@/types/api";

type Drafts = { ingredients: Ingredient[]; search: SearchRequest };

export function readDraft<K extends keyof Drafts>(key: K): Drafts[K] | null {
  const raw = sessionStorage.getItem(`aimenu.${key}`);
  return raw ? (JSON.parse(raw) as Drafts[K]) : null;
}

export function writeDraft<K extends keyof Drafts>(key: K, value: Drafts[K]) {
  sessionStorage.setItem(`aimenu.${key}`, JSON.stringify(value));
}
