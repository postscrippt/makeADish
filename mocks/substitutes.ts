// shortcut: hand-picked swaps for the mock recipes; real data comes from Person B later.
// Keyed by the missing ingredient id. Every option lists its allergens explicitly (ids from data.ts).
import type { SwapOption } from "@/app/recipe/swaps";

const o = (label: string, ingredientIds: string[], allergens: string[] | null): SwapOption => ({ label, ingredientIds, allergens });

export const substitutes: Record<string, SwapOption[]> = {
  "oyster-sauce": [o("ซีอิ๊วดำ + น้ำตาล", ["dark-soy-sauce", "sugar"], ["soy", "wheat"]), o("ซอสปรุงรส", ["seasoning-sauce"], ["soy", "wheat"])],
  "fish-sauce": [o("ซีอิ๊วขาว", ["light-soy-sauce"], ["soy", "wheat"]), o("เกลือ", ["salt"], [])],
  "holy-basil": [o("ใบโหระพา", ["thai-basil"], [])],
  "thai-basil": [o("ใบกะเพรา", ["holy-basil"], [])],
  lime: [o("มะขามเปียก", ["tamarind"], []), o("น้ำส้มสายชู", ["vinegar"], [])],
  chili: [o("พริกป่น", ["chili-flakes"], []), o("พริกไทย", ["pepper"], [])],
  garlic: [o("หอมแดง", ["shallot"], []), o("กระเทียมเจียวสำเร็จ", ["fried-garlic"], [])],
  pork: [o("ไก่สับ", ["chicken"], []), o("เต้าหู้", ["tofu"], ["soy"])],
  chicken: [o("หมู", ["pork"], []), o("เต้าหู้", ["tofu"], ["soy"])],
  shrimp: [o("ไก่", ["chicken"], []), o("ปลาหมึก", ["squid"], ["shellfish"])],
  tofu: [o("ไข่", ["egg"], ["egg"]), o("เห็ด", ["mushroom"], [])],
  "morning-glory": [o("คะน้า", ["kale"], []), o("ผักกาดขาว", ["napa-cabbage"], [])],
  cabbage: [o("ผักกาดขาว", ["napa-cabbage"], []), o("หัวไชเท้า", ["daikon"], [])],
  "coconut-milk": [o("นมสด", ["milk"], ["milk"]), o("นมอัลมอนด์", ["almond-milk"], ["tree_nut"]), o("น้ำซุป", ["stock"], null) /* store-bought stock varies (soy, wheat, milk): unknown, so always hidden */],
  lemongrass: [o("ผิวมะนาว", ["lime-zest"], [])],
  "kaffir-lime-leaf": [o("ผิวมะนาว", ["lime-zest"], [])],
  galangal: [o("ขิง", ["ginger"], [])],
  egg: [o("เต้าหู้อ่อน", ["silken-tofu"], ["soy"])],
  rice: [o("เส้นก๋วยเตี๋ยว", ["rice-noodle"], []), o("ขนมปัง", ["bread"], ["wheat", "milk"])],
};
