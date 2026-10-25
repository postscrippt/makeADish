// The one place pages get data from. Today it returns mock data; issue #13 swaps
// the insides for Person B's real endpoints without touching any page.
import type { Ingredient, Options, Profile, ScanResult } from "@/types/api";
import { allergens, categories, ingredients } from "./data";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";
const PROFILE_KEY = "aimenu.profile";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function notWired(): never {
  throw new Error("Real endpoints are not wired yet (issue #13). Set NEXT_PUBLIC_USE_MOCKS=true.");
}

export async function scan(photo: File): Promise<ScanResult> {
  if (!USE_MOCKS) notWired();
  void photo; // the mock ignores the photo; it is never stored
  await wait(1200);
  // Dev switch: add ?mock=nofood, ?mock=blurry or ?mock=error to the page URL to see those states.
  const forced = new URLSearchParams(location.search).get("mock");
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
