import type { Ingredient } from "../types/api.ts";

// What the ingredient page posts into the chat for the user: the bot's typed-search trigger (SEARCH_TRIGGER in
// lib/line/handler.ts, which a test keeps in step) followed by the picked names. Names only, no allergies:
// the bot reads those from the saved profile. The bot reads at most 20 names.
export const SEARCH_TEXT = "หาเมนูจาก";
const MAX_NAMES = 20;

export function searchMessage(tags: Pick<Ingredient, "th">[]): string {
  return `${SEARCH_TEXT} ${tags.slice(0, MAX_NAMES).map((t) => t.th).join(", ")}`;
}
