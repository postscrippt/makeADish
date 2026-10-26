// The choices the app offers for GET /api/options (docs/api-contract.md). The real endpoint must not import the
// browser mocks, so the lists live here. Allergen ids must match `allergens` in the database (a test checks).
import type { Option } from "../types/api.ts";

export const allergenOptions: Option[] = [
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

export const categoryOptions: Option[] = [
  { id: "stir-fry", th: "ผัด" },
  { id: "soup", th: "ต้ม" },
  { id: "curry", th: "แกง" },
  { id: "salad", th: "ยำ" },
  { id: "fried", th: "ทอด" },
];
