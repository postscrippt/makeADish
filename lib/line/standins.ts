// STAND-INS so the LINE chat works end to end before the real backend exists.
// Replace each one in Task 2 and nothing else in the webhook changes:
//   standInScan       -> the Gemini vision scan (same as POST /api/scan)
//   standInSearch     -> the Supabase + agent search (same as POST /api/recommend)
//   standInGetProfile -> the saved profile found through users.line_user_id
import { rankRecipes } from "../match.ts";
import { ingredients } from "../../mocks/data.ts";
import { recipes } from "../../mocks/recipes.ts";
import type { ScanResult, SearchRequest, SearchResult, SpiceLevel } from "../../types/api.ts";

const FOUND = ["pork", "egg", "garlic", "chili", "holy-basil"]; // same fixed result as the browser mock

// The photo is ignored; the bytes are dropped as soon as the caller lets go of them.
export async function standInScan(): Promise<ScanResult> {
  return { ok: true, ingredients: ingredients.filter((x) => FOUND.includes(x.id)) };
}

export async function standInSearch(req: SearchRequest): Promise<SearchResult> {
  return rankRecipes(recipes, req);
}

// LINE users have no saved profile yet, so nothing is filtered. The confirm card says so
// ("ยังไม่ได้ระบุอาหารที่แพ้") and links to the form where allergies are set.
export async function standInGetProfile(): Promise<{ allergies: string[]; spice: SpiceLevel }> {
  return { allergies: [], spice: 1 };
}
