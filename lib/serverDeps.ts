// Builds the stores the API routes use from the environment. Server-only (it reaches for the service key).
// With no database settings both are null, and the routes answer 503 instead of crashing.
import { getDb } from "./db.ts";
import { createProfileStore } from "./profileStore.ts";
import { createRecipeStore } from "./recipeStore.ts";
import type { Deps } from "./recipeApi.ts";

export function recipeDeps(): Deps {
  const db = getDb();
  return db ? { recipes: createRecipeStore(db), profiles: createProfileStore(db) } : { recipes: null, profiles: null };
}
