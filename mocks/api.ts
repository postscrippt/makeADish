// The one place pages get data from. Today it returns mock data; issue #13 swaps
// the insides for Person B's real endpoints without touching any page.
import type {
  HistoryEntry, Ingredient, Options, Profile, Recipe, RecipeMatch, ScanResult, SearchRequest, SearchResult,
} from "@/types/api";
import { allergens, categories, ingredients } from "./data";
import { recipes } from "./recipes";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";
const PROFILE_KEY = "aimenu.profile";
const HISTORY_KEY = "aimenu.history";
const FAVORITES_KEY = "aimenu.favorites";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Dev switch: add ?mock=nofood, ?mock=blurry, ?mock=error or ?mock=empty to a page URL to see those states.
const devSwitch = () => new URLSearchParams(location.search).get("mock");

const readList = <T,>(key: string): T[] => JSON.parse(localStorage.getItem(key) ?? "[]") as T[];

function notWired(): never {
  throw new Error("Real endpoints are not wired yet (issue #13). Set NEXT_PUBLIC_USE_MOCKS=true.");
}

export async function scan(photo: File): Promise<ScanResult> {
  if (!USE_MOCKS) notWired();
  void photo; // the mock ignores the photo; it is never stored
  await wait(1200);
  const forced = devSwitch();
  if (forced === "nofood") return { ok: false, reason: "no_food" };
  if (forced === "blurry") return { ok: false, reason: "blurry" };
  if (forced === "error") return { ok: false, reason: "error" };
  const found = ["pork", "egg", "garlic", "chili", "holy-basil"];
  return { ok: true, ingredients: ingredients.filter((x) => found.includes(x.id)) };
}

export async function getIngredients(): Promise<Ingredient[]> {
  if (!USE_MOCKS) notWired();
  return ingredients;
}

export async function getOptions(): Promise<Options> {
  if (!USE_MOCKS) notWired();
  return { allergens, categories };
}

// shortcut: profile lives in localStorage under an anonymous id; move to the DB when #13 lands.
export async function getProfile(): Promise<Profile> {
  if (!USE_MOCKS) notWired();
  const saved = localStorage.getItem(PROFILE_KEY);
  if (saved) return JSON.parse(saved) as Profile;
  const fresh: Profile = { anonId: crypto.randomUUID(), allergies: [], spice: 1, servings: 2 };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(fresh));
  return fresh;
}

export async function saveProfile(profile: Profile): Promise<void> {
  if (!USE_MOCKS) notWired();
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

// The real version runs the agent on the server; the hard filters and overlap math below mirror the README rules.
export async function searchRecipes(req: SearchRequest): Promise<SearchResult> {
  if (!USE_MOCKS) notWired();
  await wait(1000);
  if (devSwitch() === "error") throw new Error("mock search error");
  if (devSwitch() === "empty") return { matches: [], almostThere: [], tries: 3 };
  const have = new Set(req.ingredientIds);
  const ranked: RecipeMatch[] = recipes
    .filter((r) => r.allergens !== null && !r.allergens.some((a) => req.allergies.includes(a)))
    .filter((r) => r.spice <= req.spice && (req.category === null || r.category === req.category))
    .map(({ id, th, en, category, spice, minutes, ingredients: list }) => {
      const missing = list.filter((x) => !have.has(x.id)).map((x) => ({ id: x.id, th: x.th }));
      const matchPercent = Math.round(((list.length - missing.length) / list.length) * 100);
      return { recipe: { id, th, en, category, spice, minutes }, matchPercent, missing };
    })
    .sort((a, b) => b.matchPercent - a.matchPercent);
  const matches = ranked.filter((m) => m.missing.length === 0);
  const almostThere = ranked.filter((m) => m.missing.length > 0 && m.missing.length <= 2);
  return { matches, almostThere, tries: matches.length + almostThere.length > 0 ? 1 : 3 };
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  if (!USE_MOCKS) notWired();
  await wait(300);
  return recipes.find((r) => r.id === id && r.allergens !== null) ?? null;
}

// shortcut: history and favorites live in localStorage; move to the DB when #13 lands.
export async function logCooked(entry: HistoryEntry): Promise<void> {
  if (!USE_MOCKS) notWired();
  localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...readList<HistoryEntry>(HISTORY_KEY)]));
}

export async function getHistory(): Promise<HistoryEntry[]> {
  if (!USE_MOCKS) notWired();
  return readList<HistoryEntry>(HISTORY_KEY);
}

export async function getFavorites(): Promise<string[]> {
  if (!USE_MOCKS) notWired();
  return readList<string>(FAVORITES_KEY);
}

export async function setFavorite(recipeId: string, favorite: boolean): Promise<void> {
  if (!USE_MOCKS) notWired();
  const rest = readList<string>(FAVORITES_KEY).filter((id) => id !== recipeId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorite ? [recipeId, ...rest] : rest));
}
