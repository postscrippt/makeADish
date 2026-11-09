import type { Ingredient, IngredientCategory } from "../types/api.ts";

// Section names for the picker's "all ingredients" list, in the order they show. The API sends the ids; the wording is the UI's.
export const CATEGORY_LABELS: { id: IngredientCategory; th: string; en: string }[] = [
  { id: "meat", th: "เนื้อสัตว์", en: "Meat" },
  { id: "seafood", th: "อาหารทะเล", en: "Seafood" },
  { id: "egg-dairy", th: "ไข่และนม", en: "Eggs and dairy" },
  { id: "vegetable", th: "ผัก", en: "Vegetables" },
  { id: "herb", th: "สมุนไพร", en: "Herbs" },
  { id: "fruit", th: "ผลไม้", en: "Fruit" },
  { id: "staple", th: "ข้าว แป้ง เต้าหู้", en: "Rice, flour, tofu" },
  { id: "noodle", th: "เส้น", en: "Noodles" },
  { id: "nut-seed", th: "ถั่วและงา", en: "Nuts and seeds" },
  { id: "sauce", th: "ซอสและน้ำปรุง", en: "Sauces" },
  { id: "seasoning", th: "เครื่องปรุง", en: "Seasonings" },
  { id: "other", th: "อื่น ๆ", en: "Other" },
];

// Items grouped under their section, empty sections left out. An item with no category (an older response) goes under "อื่น ๆ".
export function groupByCategory(items: Ingredient[]): { id: IngredientCategory; th: string; en: string; items: Ingredient[] }[] {
  return CATEGORY_LABELS.map((c) => ({ ...c, items: items.filter((x) => (x.category ?? "other") === c.id) })).filter((g) => g.items.length > 0);
}
