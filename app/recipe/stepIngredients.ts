// Which recipe ingredients a cooking step mentions, so cook mode can show "ใช้ในขั้นนี้" with their amounts.
// shortcut: plain substring match on Thai names; swap for structured step fields once Person B adds them to the recipe data.
import type { RecipeIngredient } from "../../types/api.ts";

// A recipe may list "กระเทียมสับ" while the step says "กระเทียม", so also try the name without its trailing prep word.
const PREP = /(สับ|ซอย|ทุบ|บุบ|หั่น.*|สด|ต้ม|ลวก)$/;

export function stepIngredients(step: string, ingredients: RecipeIngredient[]): RecipeIngredient[] {
  return ingredients.filter((x) => [x.th, x.th.replace(PREP, "")].some((name) => name.length >= 2 && step.includes(name)));
}
