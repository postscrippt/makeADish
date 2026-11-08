import type { Ingredient, IngredientCategory } from "../types/api.ts";

// Thai section names for the picker's "all ingredients" list, in the order they show. The API sends the ids; the wording is the UI's.
export const CATEGORY_LABELS: { id: IngredientCategory; th: string }[] = [
  { id: "meat", th: "เนื้อสัตว์" },
  { id: "seafood", th: "อาหารทะเล" },
  { id: "egg-dairy", th: "ไข่และนม" },
  { id: "vegetable", th: "ผัก" },
  { id: "herb", th: "สมุนไพร" },
  { id: "fruit", th: "ผลไม้" },
  { id: "staple", th: "ข้าว แป้ง เต้าหู้" },
  { id: "noodle", th: "เส้น" },
  { id: "nut-seed", th: "ถั่วและงา" },
  { id: "sauce", th: "ซอสและน้ำปรุง" },
  { id: "seasoning", th: "เครื่องปรุง" },
  { id: "other", th: "อื่น ๆ" },
];

// Items grouped under their section, empty sections left out. An item with no category (an older response) goes under "อื่น ๆ".
export function groupByCategory(items: Ingredient[]): { id: IngredientCategory; th: string; items: Ingredient[] }[] {
  return CATEGORY_LABELS.map((c) => ({ ...c, items: items.filter((x) => (x.category ?? "other") === c.id) })).filter((g) => g.items.length > 0);
}
