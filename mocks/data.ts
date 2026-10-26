import type { Ingredient, Option } from "@/types/api";

const i = (id: string, th: string, en: string, aliases: string[] = []): Ingredient => ({ id, th, en, aliases });

export const ingredients: Ingredient[] = [
  i("pork", "หมู", "pork", ["หมูสับ", "หมูชิ้น", "minced pork"]),
  i("chicken", "ไก่", "chicken", ["อกไก่", "chicken breast"]),
  i("beef", "เนื้อวัว", "beef", ["เนื้อ"]),
  i("shrimp", "กุ้ง", "shrimp", ["prawn"]),
  i("egg", "ไข่", "egg", ["ไข่ไก่"]),
  i("tofu", "เต้าหู้", "tofu"),
  i("garlic", "กระเทียม", "garlic"),
  i("shallot", "หอมแดง", "shallot"),
  i("chili", "พริก", "chili", ["พริกขี้หนู", "bird's eye chili"]),
  i("holy-basil", "กะเพรา", "holy basil"),
  i("thai-basil", "โหระพา", "Thai basil"),
  i("lemongrass", "ตะไคร้", "lemongrass"),
  i("galangal", "ข่า", "galangal"),
  i("kaffir-lime-leaf", "ใบมะกรูด", "kaffir lime leaf"),
  i("lime", "มะนาว", "lime"),
  i("fish-sauce", "น้ำปลา", "fish sauce"),
  i("oyster-sauce", "ซอสหอยนางรม", "oyster sauce"),
  i("coconut-milk", "กะทิ", "coconut milk"),
  i("rice", "ข้าว", "rice", ["ข้าวสวย"]),
  i("rice-noodle", "เส้นก๋วยเตี๋ยว", "rice noodle", ["เส้นเล็ก", "เส้นใหญ่"]),
  i("morning-glory", "ผักบุ้ง", "morning glory"),
  i("tomato", "มะเขือเทศ", "tomato"),
  i("cabbage", "กะหล่ำปลี", "cabbage"),
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
