import type { Ingredient, IngredientCategory, Option } from "@/types/api";

const i = (id: string, th: string, en: string, category: IngredientCategory, aliases: string[] = []): Ingredient => ({ id, th, en, aliases, category });

export const ingredients: Ingredient[] = [
  i("pork", "หมู", "pork", "meat", ["หมูสับ", "หมูชิ้น", "minced pork"]),
  i("chicken", "ไก่", "chicken", "meat", ["อกไก่", "chicken breast"]),
  i("beef", "เนื้อวัว", "beef", "meat", ["เนื้อ"]),
  i("shrimp", "กุ้ง", "shrimp", "seafood", ["prawn"]),
  i("egg", "ไข่", "egg", "egg-dairy", ["ไข่ไก่"]),
  i("tofu", "เต้าหู้", "tofu", "staple"),
  i("garlic", "กระเทียม", "garlic", "vegetable"),
  i("shallot", "หอมแดง", "shallot", "vegetable"),
  i("chili", "พริก", "chili", "vegetable", ["พริกขี้หนู", "bird's eye chili"]),
  i("holy-basil", "กะเพรา", "holy basil", "herb"),
  i("thai-basil", "โหระพา", "Thai basil", "herb"),
  i("lemongrass", "ตะไคร้", "lemongrass", "herb"),
  i("galangal", "ข่า", "galangal", "herb"),
  i("kaffir-lime-leaf", "ใบมะกรูด", "kaffir lime leaf", "herb"),
  i("lime", "มะนาว", "lime", "fruit"),
  i("fish-sauce", "น้ำปลา", "fish sauce", "sauce"),
  i("oyster-sauce", "ซอสหอยนางรม", "oyster sauce", "sauce"),
  i("coconut-milk", "กะทิ", "coconut milk", "fruit"),
  i("rice", "ข้าว", "rice", "staple", ["ข้าวสวย"]),
  i("rice-noodle", "เส้นก๋วยเตี๋ยว", "rice noodle", "noodle", ["เส้นเล็ก", "เส้นใหญ่"]),
  i("morning-glory", "ผักบุ้ง", "morning glory", "vegetable"),
  i("tomato", "มะเขือเทศ", "tomato", "vegetable"),
  i("cabbage", "กะหล่ำปลี", "cabbage", "vegetable"),
];

export const allergens: Option[] = [
  { id: "shellfish", th: "อาหารทะเลมีเปลือก" },
  { id: "fish", th: "ปลา / น้ำปลา" },
  { id: "peanut", th: "ถั่วลิสง" },
  { id: "tree_nut", th: "ถั่วเปลือกแข็ง" },
  { id: "egg", th: "ไข่" },
  { id: "milk", th: "นม" },
  { id: "soy", th: "ถั่วเหลือง" },
  { id: "wheat", th: "แป้งสาลี" },
  { id: "sesame", th: "งา" },
];

export const categories: Option[] = [
  { id: "stir-fry", th: "ผัด" },
  { id: "soup", th: "ต้ม" },
  { id: "curry", th: "แกง" },
  { id: "salad", th: "ยำ" },
  { id: "fried", th: "ทอด" },
];
