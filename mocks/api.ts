// The one place pages get data from. NEXT_PUBLIC_USE_MOCKS=false calls Person B's endpoints (docs/api-contract.md);
// otherwise everything runs on mock data with no keys. History, favorites and swaps stay local until their endpoints land.
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

// Every call except options/ingredients says who is calling with the anonymous id kept in this browser.
async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!path.startsWith("/api/options") && !path.startsWith("/api/ingredients")) headers.set("x-anon-id", localProfile().anonId);
  const res = await fetch(path, { ...init, headers });
  if (!res.ok) throw new Error(`${path} failed (${res.status})`);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

const json = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

function localProfile(): Profile {
  const saved = localStorage.getItem(PROFILE_KEY);
  if (saved) return JSON.parse(saved) as Profile;
  const fresh: Profile = { anonId: crypto.randomUUID(), allergies: [], spice: 1 };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(fresh));
  return fresh;
}

export async function scan(photo: Blob): Promise<ScanResult> {
  if (!USE_MOCKS) {
    const form = new FormData();
    form.append("photo", photo, "photo.jpg");
    return api<ScanResult>("/api/scan", { method: "POST", body: form });
  }
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
  if (!USE_MOCKS) return api<Ingredient[]>("/api/ingredients");
  return ingredients;
}

export async function getOptions(): Promise<Options> {
  if (!USE_MOCKS) return api<Options>("/api/options");
  return { allergens, categories };
}

// The anonymous id lives in this browser; with real endpoints the allergies and spice come from the server.
export async function getProfile(): Promise<Profile> {
  if (USE_MOCKS) return localProfile();
  const profile = await api<Profile>("/api/profile");
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

// Inside LINE the save also sends the LINE ID token, which links this profile to the chat user.
// Throws when the server save fails (401 bad/expired login, 503 not set up): nothing was saved there.
export async function saveProfile(profile: Profile): Promise<void> {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  const token = await lineIdToken();
  if (USE_MOCKS && !token) return;
  await api<void>("/api/profile", {
    method: "PUT",
    headers: { "content-type": "application/json", ...(token ? { "x-line-id-token": token } : {}) },
    body: JSON.stringify(profile),
  });
}

// The real version runs the agent on the server; the hard filters and overlap math below mirror the README rules.
export async function searchRecipes(req: SearchRequest): Promise<SearchResult> {
  if (!USE_MOCKS) return api<SearchResult>("/api/recommend", json(req));
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
// The real endpoint filters on the allergies saved on the server, so they never go in the URL.
export async function listRecipes(allergies: string[]): Promise<RecipeSummary[]> {
  if (!USE_MOCKS) return api<RecipeSummary[]>("/api/recipes");
  await wait(300);
  return recipes
    .filter((r) => r.allergens !== null && !r.allergens.some((a) => allergies.includes(a)))
    .map(({ id, th, en, category, spice, minutes }) => ({ id, th, en, category, spice, minutes }));
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  if (!USE_MOCKS) {
    return api<Recipe>(`/api/recipes/${encodeURIComponent(id)}`).catch((e: Error) => {
      if (e.message.includes("(404)")) return null;
      throw e;
    });
  }
  await wait(300);
  return recipes.find((r) => r.id === id && r.allergens !== null) ?? null;
}

// shortcut: history, favorites and swaps stay in this browser in both modes; switch when Person B's endpoints land.
export async function logCooked(entry: HistoryEntry): Promise<void> {
  localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...readList<HistoryEntry>(HISTORY_KEY)]));
}

export async function getHistory(): Promise<HistoryEntry[]> {
  return readList<HistoryEntry>(HISTORY_KEY);
}

export async function getFavorites(): Promise<Favorite[]> {
  // Skips entries saved by an earlier build that stored bare ids.
  return readList<Favorite>(FAVORITES_KEY).filter((f) => typeof f === "object" && f !== null);
}

export async function setFavorite(recipe: Favorite, favorite: boolean): Promise<void> {
  const rest = (await getFavorites()).filter((f) => f.id !== recipe.id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorite ? [recipe, ...rest] : rest));
}

// Swaps for one missing ingredient, with the user's allergies filtered out in code (never by the LLM).
export async function getSubstitutes(ingredientId: string, allergies: string[]): Promise<SwapResult> {
  await wait(400);
  if (devSwitch() === "error") throw new Error("mock substitutes error");
  return safeSwaps(substitutes[ingredientId], allergies);
}

// Unused by the UI since the Ask page was removed; kept as reference for Person B. Mock data only.
// shortcut: keyword lookup stands in for the agent; the real one answers from the recipe DB and history.
export async function ask(history: ChatMessage[]): Promise<ChatMessage> {
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
