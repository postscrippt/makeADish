// Ingredient ids passed in a link from the LINE chat (?ids=a,b,c). Only ids from the canonical list count;
// allergies are never read from a link (they come from the saved profile).
import type { Ingredient } from "../types/api.ts";

export function idsFromLink(param: string | null, known: Ingredient[]): Ingredient[] {
  const wanted = new Set((param ?? "").split(",").map((s) => s.trim()).filter(Boolean));
  const byId = new Map(known.map((x) => [x.id, x]));
  return [...wanted].flatMap((id) => byId.get(id) ?? []);
}
