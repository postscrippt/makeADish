import type { Recipe, RecipeIngredient } from "@/types/api";

const g = (id: string, th: string, qty: string): RecipeIngredient => ({ id, th, qty });

export const recipes: Recipe[] = [
  {
    id: "khai-jiao-moo-sap", th: "ไข่เจียวหมูสับ", en: "Thai omelette with minced pork",
    category: "fried", spice: 0, minutes: 10, baseServings: 1, allergens: ["egg"],
    ingredients: [g("egg", "ไข่", "2 ฟอง"), g("pork", "หมูสับ", "50 กรัม"), g("garlic", "กระเทียมสับ", "1 ช้อนชา")],
    steps: [
      "ตีไข่กับหมูสับและกระเทียมให้เข้ากัน",
      "ตั้งกระทะน้ำมันให้ร้อนจัด",
      "เทไข่ลงทอดจนพองและเหลืองกรอบทั้งสองด้าน",
      "ตักขึ้นสะเด็ดน้ำมัน เสิร์ฟกับข้าวสวย",
    ],
  },
  {
    id: "khai-tun", th: "ไข่ตุ๋นหมูสับ", en: "Steamed egg with minced pork",
    category: "soup", spice: 0, minutes: 20, baseServings: 2, allergens: ["egg"],
    ingredients: [g("egg", "ไข่", "3 ฟอง"), g("pork", "หมูสับ", "80 กรัม")],
    steps: ["ตีไข่กับน้ำ 1/2 ถ้วยให้เข้ากัน", "ใส่หมูสับ คนให้ทั่ว", "นึ่งไฟกลาง 15 นาทีจนไข่สุก"],
  },
  {
    id: "pad-kra-pao-moo", th: "ผัดกะเพราหมู", en: "Stir-fried pork with holy basil",
    category: "stir-fry", spice: 1, minutes: 15, baseServings: 1, allergens: ["fish", "shellfish", "soy", "wheat"],
    ingredients: [
      g("pork", "หมูสับ", "150 กรัม"), g("holy-basil", "ใบกะเพรา", "1 กำมือ"), g("garlic", "กระเทียม", "4 กลีบ"),
      g("chili", "พริกขี้หนู", "3-5 เม็ด"), g("oyster-sauce", "ซอสหอยนางรม", "1 ช้อนโต๊ะ"), g("fish-sauce", "น้ำปลา", "1/2 ช้อนโต๊ะ"),
    ],
    steps: [
      "โขลกกระเทียมกับพริกพอแหลก",
      "ผัดพริกกระเทียมกับน้ำมันจนหอม",
      "ใส่หมูสับ ผัดจนสุก ปรุงด้วยซอสหอยนางรมและน้ำปลา",
      "ใส่ใบกะเพรา ผัดเร็ว ๆ แล้วปิดไฟ",
    ],
  },
  {
    id: "khao-pad-khai", th: "ข้าวผัดไข่", en: "Egg fried rice",
    category: "stir-fry", spice: 0, minutes: 15, baseServings: 1, allergens: ["egg"],
    ingredients: [g("rice", "ข้าวสวย", "1 ถ้วย"), g("egg", "ไข่", "1 ฟอง"), g("garlic", "กระเทียมสับ", "1 ช้อนชา")],
    steps: ["เจียวกระเทียมให้หอม", "ตอกไข่ลงไป ยีให้แตก", "ใส่ข้าว ผัดให้เข้ากัน ปรุงรสตามชอบ"],
  },
  {
    id: "yam-khai-dao", th: "ยำไข่ดาว", en: "Fried egg salad",
    category: "salad", spice: 3, minutes: 15, baseServings: 1, allergens: ["egg", "fish"],
    ingredients: [
      g("egg", "ไข่", "2 ฟอง"), g("chili", "พริกขี้หนู", "5 เม็ด"),
      g("lime", "มะนาว", "1 ลูก"), g("fish-sauce", "น้ำปลา", "1 ช้อนโต๊ะ"),
    ],
    steps: ["ทอดไข่ดาวให้ขอบกรอบ แล้วหั่นชิ้นพอดีคำ", "ผสมพริก มะนาว น้ำปลาเป็นน้ำยำ", "ราดน้ำยำบนไข่ คลุกเบา ๆ"],
  },
  {
    id: "pad-pak-boong", th: "ผัดผักบุ้งไฟแดง", en: "Stir-fried morning glory",
    category: "stir-fry", spice: 1, minutes: 10, baseServings: 2, allergens: ["shellfish", "soy", "wheat"],
    ingredients: [
      g("morning-glory", "ผักบุ้ง", "1 กำ"), g("garlic", "กระเทียม", "5 กลีบ"),
      g("chili", "พริก", "2 เม็ด"), g("oyster-sauce", "ซอสหอยนางรม", "1 ช้อนโต๊ะ"),
    ],
    steps: ["หั่นผักบุ้งเป็นท่อน", "ผัดกระเทียมพริกไฟแรงจนหอม", "ใส่ผักบุ้งและซอส ผัดเร็ว ๆ ไม่เกิน 1 นาที"],
  },
  {
    id: "tom-jued-tao-hoo", th: "ต้มจืดเต้าหู้หมูสับ", en: "Clear soup with tofu and minced pork",
    category: "soup", spice: 0, minutes: 20, baseServings: 2, allergens: ["soy"],
    ingredients: [
      g("tofu", "เต้าหู้ไข่", "1 หลอด"), g("pork", "หมูสับ", "100 กรัม"),
      g("garlic", "กระเทียมเจียว", "1 ช้อนโต๊ะ"), g("cabbage", "กะหล่ำปลี", "1/4 หัว"),
    ],
    steps: ["ต้มน้ำให้เดือด ปั้นหมูสับเป็นก้อนเล็ก ๆ ใส่ลงไป", "ใส่กะหล่ำปลีและเต้าหู้", "ปรุงรส โรยกระเทียมเจียว"],
  },
  {
    id: "tom-yum-goong", th: "ต้มยำกุ้ง", en: "Spicy shrimp soup",
    category: "soup", spice: 3, minutes: 25, baseServings: 2, allergens: ["shellfish", "fish"],
    ingredients: [
      g("shrimp", "กุ้ง", "300 กรัม"), g("lemongrass", "ตะไคร้", "2 ต้น"), g("galangal", "ข่า", "5 แว่น"),
      g("kaffir-lime-leaf", "ใบมะกรูด", "4 ใบ"), g("chili", "พริกขี้หนู", "5 เม็ด"),
      g("lime", "มะนาว", "2 ลูก"), g("fish-sauce", "น้ำปลา", "2 ช้อนโต๊ะ"),
    ],
    steps: ["ต้มตะไคร้ ข่า ใบมะกรูดจนหอม", "ใส่กุ้ง ต้มจนสุก", "ปิดไฟ ปรุงด้วยน้ำปลา มะนาว พริก"],
  },
  {
    id: "kaeng-khiao-wan-kai", th: "แกงเขียวหวานไก่", en: "Green curry with chicken",
    category: "curry", spice: 2, minutes: 30, baseServings: 3, allergens: ["fish", "shellfish"],
    ingredients: [
      g("chicken", "ไก่", "300 กรัม"), g("coconut-milk", "กะทิ", "2 ถ้วย"), g("thai-basil", "โหระพา", "1 กำมือ"),
      g("chili", "พริกชี้ฟ้า", "2 เม็ด"), g("fish-sauce", "น้ำปลา", "1 1/2 ช้อนโต๊ะ"),
    ],
    steps: ["ผัดพริกแกงกับหัวกะทิจนแตกมัน", "ใส่ไก่ ผัดจนสุก เติมกะทิที่เหลือ", "ปรุงรส ใส่โหระพาและพริก"],
  },
  {
    // Allergen data unknown on purpose: must never appear in results.
    id: "moo-kratiam", th: "หมูทอดกระเทียม", en: "Garlic fried pork",
    category: "fried", spice: 0, minutes: 20, baseServings: 2, allergens: null,
    ingredients: [g("pork", "หมู", "200 กรัม"), g("garlic", "กระเทียม", "1 หัว")],
    steps: ["หมักหมูกับกระเทียม", "ทอดจนเหลือง"],
  },
];
