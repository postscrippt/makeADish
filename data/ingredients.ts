// The canonical ingredient list (issue #20): one row per ingredient, loaded into the `ingredients` table.
// Scan output and recipe ingredients both map to these slugs, so "หมู" and "หมูสับ" are the same ingredient.
// Edit here, then run `node scripts/build-ingredients-sql.mjs` to regenerate supabase/seed/ingredients.sql.
//
// Rules for aliases: every alias must be unique across the whole list (a test checks this), and Thai aliases
// are matched without spaces. Allergen data is NOT here; it is tagged separately (issue #21).
// A native Thai speaker should review the Thai names and aliases.

export type IngredientEntry = {
  slug: string; // stable id used by the API, recipes and swaps
  th: string;
  en: string;
  aliases: string[];
  category: IngredientCategory;
};

export type IngredientCategory =
  | "meat" | "seafood" | "egg-dairy" | "vegetable" | "herb" | "fruit"
  | "sauce" | "seasoning" | "staple" | "noodle" | "nut-seed" | "other";

const i = (slug: string, th: string, en: string, category: IngredientCategory, aliases: string[] = []): IngredientEntry => ({
  slug, th, en, aliases, category,
});

export const ingredients: IngredientEntry[] = [
  // Meat
  i("pork", "หมู", "pork", "meat", ["หมูสับ", "หมูชิ้น", "หมูสามชั้น", "เนื้อหมู", "minced pork", "pork belly"]),
  i("chicken", "ไก่", "chicken", "meat", ["อกไก่", "สะโพกไก่", "น่องไก่", "เนื้อไก่", "ไก่สับ", "chicken breast"]),
  i("beef", "เนื้อวัว", "beef", "meat", ["เนื้อ", "เนื้อวัวสับ", "เนื้อสับ"]),
  i("duck", "เป็ด", "duck", "meat", ["เนื้อเป็ด"]),
  i("sausage", "ไส้กรอก", "sausage", "meat"),
  i("chinese-sausage", "กุนเชียง", "Chinese sausage", "meat"),
  i("bacon", "เบคอน", "bacon", "meat"),
  i("ham", "แฮม", "ham", "meat"),

  // Seafood
  i("shrimp", "กุ้ง", "shrimp", "seafood", ["กุ้งสด", "กุ้งแม่น้ำ", "prawn"]),
  i("dried-shrimp", "กุ้งแห้ง", "dried shrimp", "seafood"),
  i("squid", "ปลาหมึก", "squid", "seafood", ["หมึก", "หมึกกล้วย"]),
  i("fish", "ปลา", "fish", "seafood", ["เนื้อปลา", "ปลากะพง", "ปลานิล"]),
  i("mackerel", "ปลาทู", "mackerel", "seafood"),
  i("crab", "ปู", "crab", "seafood", ["เนื้อปู"]),
  i("clam", "หอยลาย", "clam", "seafood", ["หอย"]),
  i("mussel", "หอยแมลงภู่", "mussel", "seafood"),
  i("fish-ball", "ลูกชิ้นปลา", "fish ball", "seafood"),
  i("shrimp-paste", "กะปิ", "shrimp paste", "seafood"),

  // Egg and dairy
  i("egg", "ไข่", "egg", "egg-dairy", ["ไข่ไก่", "ไข่สด"]),
  i("duck-egg", "ไข่เป็ด", "duck egg", "egg-dairy"),
  i("salted-egg", "ไข่เค็ม", "salted egg", "egg-dairy"),
  i("milk", "นม", "milk", "egg-dairy", ["นมสด", "นมจืด"]),
  i("condensed-milk", "นมข้นหวาน", "condensed milk", "egg-dairy"),
  i("butter", "เนย", "butter", "egg-dairy"),
  i("cheese", "ชีส", "cheese", "egg-dairy", ["เนยแข็ง"]),

  // Vegetables
  i("garlic", "กระเทียม", "garlic", "vegetable", ["กระเทียมสับ", "กระเทียมกลีบ"]),
  i("shallot", "หอมแดง", "shallot", "vegetable"),
  i("onion", "หอมใหญ่", "onion", "vegetable", ["หัวหอม", "หัวหอมใหญ่"]),
  i("spring-onion", "ต้นหอม", "spring onion", "vegetable", ["ต้นหอมญี่ปุ่น"]),
  i("chili", "พริก", "chili", "vegetable", ["พริกขี้หนู", "พริกสด", "bird's eye chili"]),
  i("big-chili", "พริกชี้ฟ้า", "large chili", "vegetable", ["พริกชี้ฟ้าแดง", "พริกชี้ฟ้าเขียว"]),
  i("dried-chili", "พริกแห้ง", "dried chili", "vegetable", ["พริกแห้งเม็ดใหญ่"]),
  i("chili-flakes", "พริกป่น", "chili flakes", "seasoning", ["พริกป่นละเอียด"]),
  i("bell-pepper", "พริกหวาน", "bell pepper", "vegetable", ["พริกหยวก"]),
  i("tomato", "มะเขือเทศ", "tomato", "vegetable", ["มะเขือเทศสีดา", "มะเขือเทศเชอรี่"]),
  i("cabbage", "กะหล่ำปลี", "cabbage", "vegetable"),
  i("cauliflower", "กะหล่ำดอก", "cauliflower", "vegetable"),
  i("broccoli", "บร็อคโคลี่", "broccoli", "vegetable", ["บรอกโคลี", "บร็อกโคลี"]),
  i("chinese-kale", "คะน้า", "Chinese kale", "vegetable", ["kale"]),
  i("morning-glory", "ผักบุ้ง", "morning glory", "vegetable", ["ผักบุ้งจีน"]),
  i("napa-cabbage", "ผักกาดขาว", "napa cabbage", "vegetable"),
  i("choy-sum", "ผักกวางตุ้ง", "choy sum", "vegetable", ["กวางตุ้ง"]),
  i("lettuce", "ผักกาดหอม", "lettuce", "vegetable", ["ผักสลัด", "ผักกาดแก้ว"]),
  i("bean-sprout", "ถั่วงอก", "bean sprout", "vegetable"),
  i("long-bean", "ถั่วฝักยาว", "long bean", "vegetable"),
  i("green-papaya", "มะละกอดิบ", "green papaya", "vegetable", ["มะละกอ"]),
  i("pumpkin", "ฟักทอง", "pumpkin", "vegetable"),
  i("cucumber", "แตงกวา", "cucumber", "vegetable"),
  i("carrot", "แครอท", "carrot", "vegetable", ["แครอต", "แครอทหั่น"]),
  i("potato", "มันฝรั่ง", "potato", "vegetable"),
  i("sweet-potato", "มันเทศ", "sweet potato", "vegetable"),
  i("daikon", "หัวไชเท้า", "daikon", "vegetable", ["หัวผักกาดขาว", "radish"]),
  i("corn", "ข้าวโพด", "corn", "vegetable", ["ข้าวโพดหวาน"]),
  i("baby-corn", "ข้าวโพดอ่อน", "baby corn", "vegetable"),
  i("mushroom", "เห็ด", "mushroom", "vegetable", ["เห็ดฟาง", "เห็ดนางรม", "เห็ดหอม", "เห็ดเข็มทอง", "เห็ดออรินจิ"]),
  i("eggplant", "มะเขือ", "eggplant", "vegetable", ["มะเขือยาว", "มะเขือเปราะ", "มะเขือม่วง"]),
  i("garlic-chive", "กุยช่าย", "garlic chive", "vegetable", ["ต้นกุยช่าย"]),
  i("celery", "คื่นช่าย", "celery", "vegetable", ["ขึ้นฉ่าย"]),
  i("bamboo-shoot", "หน่อไม้", "bamboo shoot", "vegetable", ["หน่อไม้ฝรั่ง"]),
  i("ginger", "ขิง", "ginger", "vegetable", ["ขิงอ่อน", "ขิงแก่"]),
  i("turmeric", "ขมิ้น", "turmeric", "vegetable", ["ขมิ้นชัน"]),

  // Herbs
  i("holy-basil", "กะเพรา", "holy basil", "herb", ["ใบกะเพรา"]),
  i("thai-basil", "โหระพา", "Thai basil", "herb", ["ใบโหระพา"]),
  i("lemon-basil", "แมงลัก", "lemon basil", "herb", ["ใบแมงลัก"]),
  i("lemongrass", "ตะไคร้", "lemongrass", "herb"),
  i("galangal", "ข่า", "galangal", "herb"),
  i("krachai", "กระชาย", "fingerroot", "herb"),
  i("kaffir-lime-leaf", "ใบมะกรูด", "kaffir lime leaf", "herb"),
  i("coriander", "ผักชี", "coriander", "herb", ["ใบผักชี", "ผักชีไทย", "รากผักชี"]),
  i("saw-coriander", "ผักชีฝรั่ง", "culantro", "herb"),
  i("mint", "สะระแหน่", "mint", "herb", ["ใบสะระแหน่"]),
  i("pandan", "ใบเตย", "pandan leaf", "herb"),

  // Fruit
  i("lime", "มะนาว", "lime", "fruit", ["น้ำมะนาว"]),
  i("lime-zest", "ผิวมะนาว", "lime zest", "fruit"),
  i("tamarind-paste", "น้ำมะขามเปียก", "tamarind paste", "fruit", ["มะขามเปียก", "มะขาม"]),
  i("coconut-milk", "กะทิ", "coconut milk", "fruit", ["หัวกะทิ", "หางกะทิ"]),
  i("mango", "มะม่วง", "mango", "fruit"),
  i("pineapple", "สับปะรด", "pineapple", "fruit"),
  i("banana", "กล้วย", "banana", "fruit"),

  // Sauces
  i("fish-sauce", "น้ำปลา", "fish sauce", "sauce"),
  i("oyster-sauce", "ซอสหอยนางรม", "oyster sauce", "sauce", ["น้ำมันหอย"]),
  i("soy-sauce", "ซีอิ๊วขาว", "soy sauce", "sauce", ["ซีอิ้วขาว", "ซอสถั่วเหลือง", "light soy sauce"]),
  i("dark-soy-sauce", "ซีอิ๊วดำ", "dark soy sauce", "sauce", ["ซีอิ้วดำ", "ซีอิ๊วดำหวาน"]),
  i("sweet-soy-sauce", "ซีอิ๊วหวาน", "sweet soy sauce", "sauce", ["ซีอิ้วหวาน"]),
  i("seasoning-sauce", "ซอสปรุงรส", "seasoning sauce", "sauce"),
  i("chili-sauce", "ซอสพริก", "chili sauce", "sauce", ["ซอสศรีราชา", "sriracha"]),
  i("ketchup", "ซอสมะเขือเทศ", "ketchup", "sauce"),
  i("mayonnaise", "มายองเนส", "mayonnaise", "sauce"),
  i("vinegar", "น้ำส้มสายชู", "vinegar", "sauce"),
  i("bean-paste", "เต้าเจี้ยว", "bean paste", "sauce"),
  i("chili-paste", "น้ำพริกเผา", "chili paste", "sauce"),
  i("red-curry-paste", "พริกแกงเผ็ด", "red curry paste", "sauce", ["พริกแกงแดง"]),
  i("green-curry-paste", "พริกแกงเขียวหวาน", "green curry paste", "sauce", ["พริกแกงเขียว"]),
  i("fried-garlic", "กระเทียมเจียว", "fried garlic", "seasoning"),
  i("stock", "น้ำซุป", "stock", "sauce", ["น้ำสต๊อก", "ซุปก้อน", "น้ำต้มกระดูก"]),

  // Seasonings and oils
  i("salt", "เกลือ", "salt", "seasoning", ["เกลือป่น"]),
  i("sugar", "น้ำตาลทราย", "sugar", "seasoning", ["น้ำตาล"]),
  i("palm-sugar", "น้ำตาลปี๊บ", "palm sugar", "seasoning", ["น้ำตาลมะพร้าว", "น้ำตาลโตนด"]),
  i("pepper", "พริกไทย", "pepper", "seasoning", ["พริกไทยป่น", "พริกไทยดำ"]),
  i("five-spice", "ผงพะโล้", "five-spice powder", "seasoning"),
  i("curry-powder", "ผงกะหรี่", "curry powder", "seasoning"),
  i("toasted-rice-powder", "ข้าวคั่ว", "toasted rice powder", "seasoning"),
  i("cooking-oil", "น้ำมันพืช", "cooking oil", "seasoning", ["น้ำมัน", "น้ำมันปาล์ม"]),
  i("sesame-oil", "น้ำมันงา", "sesame oil", "seasoning"),

  // Staples and noodles
  i("rice", "ข้าว", "rice", "staple", ["ข้าวสวย", "ข้าวหอมมะลิ", "ข้าวสาร"]),
  i("sticky-rice", "ข้าวเหนียว", "sticky rice", "staple"),
  i("bread", "ขนมปัง", "bread", "staple"),
  i("flour", "แป้งสาลี", "wheat flour", "staple", ["แป้ง", "แป้งอเนกประสงค์"]),
  i("tapioca-starch", "แป้งมัน", "tapioca starch", "staple", ["แป้งมันสำปะหลัง"]),
  i("cornstarch", "แป้งข้าวโพด", "cornstarch", "staple"),
  i("tofu", "เต้าหู้", "tofu", "staple", ["เต้าหู้แข็ง", "เต้าหู้ขาว"]),
  i("silken-tofu", "เต้าหู้อ่อน", "silken tofu", "staple", ["เต้าหู้หลอด"]),
  i("rice-noodle", "เส้นก๋วยเตี๋ยว", "rice noodle", "noodle", ["เส้นเล็ก", "เส้นใหญ่", "เส้นจันท์"]),
  i("rice-vermicelli", "เส้นหมี่", "rice vermicelli", "noodle", ["หมี่ขาว"]),
  i("glass-noodle", "วุ้นเส้น", "glass noodle", "noodle"),
  i("egg-noodle", "บะหมี่", "egg noodle", "noodle", ["บะหมี่ไข่", "บะหมี่เหลือง"]),
  i("instant-noodle", "บะหมี่กึ่งสำเร็จรูป", "instant noodle", "noodle", ["มาม่า"]),

  // Nuts and seeds
  i("peanut", "ถั่วลิสง", "peanut", "nut-seed", ["ถั่วลิสงคั่ว", "ถั่วลิสงป่น"]),
  i("cashew", "เม็ดมะม่วงหิมพานต์", "cashew", "nut-seed", ["เม็ดมะม่วง"]),
  i("almond", "อัลมอนด์", "almond", "nut-seed"),
  i("almond-milk", "นมอัลมอนด์", "almond milk", "nut-seed"),
  i("sesame", "งา", "sesame", "nut-seed", ["งาขาว", "งาคั่ว"]),
];
