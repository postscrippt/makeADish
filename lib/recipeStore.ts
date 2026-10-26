// Recipes from the database, in the shape the API uses (types/api.ts). Server-only.
// Safety: a recipe whose allergen_status is 'unknown' comes back with allergens = null, and every filter in
// lib/match.ts drops null. The mapping below is the one place that decision is made.
import type { Db } from "./db.ts";
import type { Recipe, SpiceLevel } from "../types/api.ts";

export type RecipeStore = {
  all(): Promise<Recipe[]>;
  byId(id: string): Promise<Recipe | null>;
};

type Row = {
  id: number;
  title_th: string;
  title_en: string | null;
  category: string | null;
  spice_level: number;
  base_servings: number;
  cook_minutes: number | null;
  steps: unknown;
  allergen_status: string;
  recipe_ingredients: { quantity_text: string | null; ingredients: { slug: string; name_th: string } | null }[];
  recipe_allergens: { allergen_id: string }[];
};

const SELECT =
  "id, title_th, title_en, category, spice_level, base_servings, cook_minutes, steps, allergen_status," +
  " recipe_ingredients(quantity_text, ingredients(slug, name_th)), recipe_allergens(allergen_id)";

export function rowToRecipe(row: Row): Recipe {
  const known = row.allergen_status === "tagged" || row.allergen_status === "verified";
  return {
    id: String(row.id),
    th: row.title_th,
    en: row.title_en ?? "",
    category: row.category ?? "",
    spice: row.spice_level as SpiceLevel,
    minutes: row.cook_minutes ?? 0,
    baseServings: row.base_servings,
    // Anything other than a recorded status is unknown, so a new status value can never accidentally mean "safe".
    allergens: known ? row.recipe_allergens.map((a) => a.allergen_id).sort() : null,
    ingredients: row.recipe_ingredients.flatMap((ri) =>
      ri.ingredients ? [{ id: ri.ingredients.slug, th: ri.ingredients.name_th, qty: ri.quantity_text ?? "" }] : [],
    ),
    steps: Array.isArray(row.steps) ? row.steps.filter((s): s is string => typeof s === "string") : [],
  };
}

export function createRecipeStore(db: Db): RecipeStore {
  return {
    async all() {
      const { data, error } = await db.from("recipes").select(SELECT).order("id");
      if (error) throw new Error(`recipes load: ${error.message}`);
      return (data as unknown as Row[]).map(rowToRecipe);
    },
    async byId(id) {
      if (!/^\d{1,9}$/.test(id)) return null;
      const { data, error } = await db.from("recipes").select(SELECT).eq("id", Number(id)).maybeSingle();
      if (error) throw new Error(`recipe load: ${error.message}`);
      return data ? rowToRecipe(data as unknown as Row) : null;
    },
  };
}
