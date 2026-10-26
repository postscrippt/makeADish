// The one place pages get data from. Today it returns mock data; issue #13 swaps
// the insides for Person B's real endpoints without touching any page.
import type {
  ChatMessage, Favorite, HistoryEntry, Ingredient, Options, Profile, Recipe, RecipeMatch, RecipeSummary, ScanResult,
  SearchRequest, SearchResult,
} from "@/types/api";
import { allergens, categories, ingredients } from "./data";
import { recipes } from "./recipes";
import { substitutes } from "./substitutes";
import { safeSwaps, type SwapResult } from "@/app/recipe/swaps";
import { lineIdToken } from "@/app/liff";

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

export async function scan(photo: Blob): Promise<ScanResult> {
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
  const fresh: Profile = { anonId: crypto.randomUUID(), allergies: [], spice: 1 };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(fresh));
  return fresh;
}

// Inside LINE the profile is also saved on the server and linked to the LINE user, so the chat filters the same allergies.
// Throws when that save fails (401 bad/expired login, 503 not set up): the chat would not know the allergies.
export async function saveProfile(profile: Profile): Promise<void> {
  if (!USE_MOCKS) notWired();
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  const token = await lineIdToken();
  if (!token) return;
  const res = await fetch("/api/profile", {
    method: "PUT",
    headers: { "content-type": "application/json", "x-anon-id": profile.anonId, "x-line-id-token": token },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error(`profile not saved (${res.status})`);
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

// Full catalog for the Menus page. Allergy filtering stays a hard filter here too.
export async function listRecipes(allergies: string[]): Promise<RecipeSummary[]> {
  if (!USE_MOCKS) notWired();
  await wait(300);
  return recipes
    .filter((r) => r.allergens !== null && !r.allergens.some((a) => allergies.includes(a)))
    .map(({ id, th, en, category, spice, minutes }) => ({ id, th, en, category, spice, minutes }));
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

export async function getFavorites(): Promise<Favorite[]> {
  if (!USE_MOCKS) notWired();
  // Skips entries saved by an earlier build that stored bare ids.
  return readList<Favorite>(FAVORITES_KEY).filter((f) => typeof f === "object" && f !== null);
}

export async function setFavorite(recipe: Favorite, favorite: boolean): Promise<void> {
  if (!USE_MOCKS) notWired();
  const rest = (await getFavorites()).filter((f) => f.id !== recipe.id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorite ? [recipe, ...rest] : rest));
}

// Swaps for one missing ingredient, with the user's allergies filtered out in code (never by the LLM).
export async function getSubstitutes(ingredientId: string, allergies: string[]): Promise<SwapResult> {
  if (!USE_MOCKS) notWired();
  await wait(400);
  if (devSwitch() === "error") throw new Error("mock substitutes error");
  return safeSwaps(substitutes[ingredientId], allergies);
}

// Unused by the UI since the Ask page was removed; kept as reference for Person B.
// shortcut: keyword lookup stands in for the agent; the real one answers from the recipe DB and history.
export async function ask(history: ChatMessage[]): Promise<ChatMessage> {
  if (!USE_MOCKS) notWired();
  await wait(900);
  if (devSwitch() === "error") throw new Error("mock ask error");
  const question = history[history.length - 1].text.toLowerCase();
  const { allergies, spice } = await getProfile();
  // Thai has no spaces between words, so match any 5-character piece of a name ("ต้มยำ" finds "ต้มยำกุ้ง").
  const mentions = (name: string) => {
    const n = name.toLowerCase();
    if (n.length <= 5) return question.includes(n);
    return Array.from({ length: n.length - 4 }, (_, i) => n.slice(i, i + 5)).some((piece) => question.includes(piece));
  };
  const related = recipes.filter(
    (r) => r.allergens !== null && [r.th, r.en, ...r.ingredients.flatMap((x) => [x.th, x.id])].some(mentions),
  );
  const safe = related.filter((r) => !r.allergens!.some((a) => allergies.includes(a)));
  const hits = safe.filter((r) => r.spice <= spice).slice(0, 3);
  if (related.length > 0 && safe.length === 0) {
    return { role: "assistant", text: "เมนูที่ตรงคำถามนี้มีส่วนผสมที่คุณแพ้ เลยไม่แนะนำนะ ลองถามเมนูอื่นดู" };
  }
  if (safe.length > 0 && hits.length === 0) {
    return { role: "assistant", text: "เมนูที่ตรงคำถามนี้เผ็ดกว่าระดับที่คุณเลือกไว้ ปรับระดับความเผ็ดได้ที่หน้าเลือกเงื่อนไข" };
  }
  if (hits.length === 0) {
    return { role: "assistant", text: "ยังไม่เจอเมนูที่ตรงคำถามนี้ ลองบอกชื่อวัตถุดิบหรือชื่อเมนู เช่น \"มีไข่กับหมู ทำอะไรดี\"" };
  }
  return {
    role: "assistant",
    text: `ลองเมนูเหล่านี้ดูนะ: ${hits.map((r) => `${r.th} (${r.minutes} นาที)`).join(", ")}`,
    recipes: hits.map(({ id, th }) => ({ id, th })),
  };
}
