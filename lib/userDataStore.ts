// Cook history and favorites in the database (tables `history` and `favorites`). Server-only.
// Safety: a recipe whose allergen status is not a recorded one is dropped from every list, the same rule as search.
import type { Db } from "./db.ts";
import type { Favorite, HistoryEntry } from "../types/api.ts";

export type UserDataStore = {
  addHistory(userId: string, recipeId: number, rating: number): Promise<{ cookedAt: string }>;
  listHistory(userId: string): Promise<HistoryEntry[]>;
  listFavorites(userId: string): Promise<Favorite[]>;
  setFavorite(userId: string, recipeId: number, favorite: boolean): Promise<void>;
};

type RecipeRef = { title_th: string; allergen_status: string } | null;
export type HistoryRow = { recipe_id: number; rating: number | null; cooked_at: string; recipes: RecipeRef };
export type FavoriteRow = { recipe_id: number; recipes: RecipeRef };

const known = (r: RecipeRef): r is NonNullable<RecipeRef> => !!r && (r.allergen_status === "tagged" || r.allergen_status === "verified");

export function mapHistory(rows: HistoryRow[]): HistoryEntry[] {
  return rows.flatMap((row) =>
    known(row.recipes) && Number.isInteger(row.rating) && row.rating! >= 1 && row.rating! <= 5
      ? [{ recipeId: String(row.recipe_id), th: row.recipes.title_th, rating: row.rating as HistoryEntry["rating"], cookedAt: new Date(row.cooked_at).toISOString() }]
      : [],
  );
}

export function mapFavorites(rows: FavoriteRow[]): Favorite[] {
  return rows.flatMap((row) => (known(row.recipes) ? [{ id: String(row.recipe_id), th: row.recipes.title_th }] : []));
}

export function createUserDataStore(db: Db): UserDataStore {
  return {
    async addHistory(userId, recipeId, rating) {
      const { data, error } = await db.from("history").insert({ user_id: userId, recipe_id: recipeId, rating }).select("cooked_at").single();
      if (error) throw new Error(`history insert: ${error.message}`);
      return { cookedAt: new Date((data as { cooked_at: string }).cooked_at).toISOString() };
    },
    async listHistory(userId) {
      const { data, error } = await db
        .from("history")
        .select("recipe_id, rating, cooked_at, recipes(title_th, allergen_status)")
        .eq("user_id", userId)
        .order("cooked_at", { ascending: false })
        .limit(200);
      if (error) throw new Error(`history list: ${error.message}`);
      return mapHistory(data as unknown as HistoryRow[]);
    },
    async listFavorites(userId) {
      const { data, error } = await db
        .from("favorites")
        .select("recipe_id, recipes(title_th, allergen_status)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(`favorites list: ${error.message}`);
      return mapFavorites(data as unknown as FavoriteRow[]);
    },
    async setFavorite(userId, recipeId, favorite) {
      const res = favorite
        ? await db.from("favorites").upsert({ user_id: userId, recipe_id: recipeId }, { onConflict: "user_id,recipe_id", ignoreDuplicates: true })
        : await db.from("favorites").delete().eq("user_id", userId).eq("recipe_id", recipeId);
      if (res.error) throw new Error(`favorite ${favorite ? "add" : "remove"}: ${res.error.message}`);
    },
  };
}
