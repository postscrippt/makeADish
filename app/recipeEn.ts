// English wording for recipes. Recipe steps and amounts are Thai only in the data, so the web pages read them from here.
// shortcut: app-side overlay, move to steps_en/quantity_en columns when Person B adds them.
// Keyed by the Thai title because database ids differ from mock ids. A dish missing here, or whose step count no longer
// matches, simply shows Thai. Allergy filtering never reads this file.
import { parseStep } from "./recipe/steps.ts";
import type { Lang } from "./text.ts";

export type RecipeEn = { en: string; steps: string[]; qty: Record<string, string> };

export const recipeEn: Record<string, RecipeEn> = {
  // Batch 0 (also the mock recipes)
  "ไข่เจียวหมูสับ": {
    en: "Thai omelette with minced pork",
    steps: [
      "Beat the eggs with the minced pork and garlic until combined.",
      "Heat oil in a pan until very hot.",
      "Pour in the egg and fry until puffed, golden and crisp on both sides.",
      "Lift out, drain the oil, and serve with steamed rice.",
    ],
    qty: { egg: "2", pork: "50 g, minced", garlic: "1 tsp, minced" },
  },
  "ไข่ตุ๋นหมูสับ": {
    en: "Steamed egg with minced pork",
    steps: [
      "Beat the eggs with 1/2 cup of water until combined.",
      "Add the minced pork and stir through.",
      "Steam over medium heat for 15 minutes until the egg is set.",
    ],
    qty: { egg: "3", pork: "80 g, minced" },
  },
  "ผัดกะเพราหมู": {
    en: "Stir-fried pork with holy basil",
    steps: [
      "Pound the garlic and chilies until roughly crushed.",
      "Stir-fry the chili and garlic in oil until fragrant.",
      "Add the minced pork and stir-fry until cooked, then season with oyster sauce and fish sauce.",
      "Add the holy basil, stir-fry quickly, then turn off the heat.",
    ],
    qty: { pork: "150 g, minced", "holy-basil": "1 handful of leaves", garlic: "4 cloves", chili: "3-5 bird's eye", "oyster-sauce": "1 tbsp", "fish-sauce": "1/2 tbsp" },
  },
  "ข้าวผัดไข่": {
    en: "Egg fried rice",
    steps: [
      "Fry the garlic until fragrant.",
      "Crack in the egg and break it up.",
      "Add the rice, stir-fry until combined, and season to taste.",
    ],
    qty: { rice: "1 cup, cooked", egg: "1", garlic: "1 tsp, minced" },
  },
  "ยำไข่ดาว": {
    en: "Fried egg salad",
    steps: [
      "Fry the eggs until the edges are crisp, then cut into bite-size pieces.",
      "Mix the chili, lime and fish sauce into a dressing.",
      "Pour the dressing over the eggs and toss gently.",
    ],
    qty: { egg: "2", chili: "5 bird's eye", lime: "1", "fish-sauce": "1 tbsp" },
  },
  "ผัดผักบุ้งไฟแดง": {
    en: "Stir-fried morning glory",
    steps: [
      "Cut the morning glory into lengths.",
      "Stir-fry the garlic and chili over high heat until fragrant.",
      "Add the morning glory and sauce and stir-fry quickly, for no more than 1 minute.",
    ],
    qty: { "morning-glory": "1 bunch", garlic: "5 cloves", chili: "2", "oyster-sauce": "1 tbsp" },
  },
  "ต้มจืดเต้าหู้หมูสับ": {
    en: "Clear soup with tofu and minced pork",
    steps: [
      "Bring water to a boil, shape the minced pork into small balls and drop them in.",
      "Add the cabbage and tofu.",
      "Season, then sprinkle with fried garlic.",
    ],
    qty: { tofu: "1 tube of egg tofu", pork: "100 g, minced", garlic: "1 tbsp, fried", cabbage: "1/4 head" },
  },
  "ต้มยำกุ้ง": {
    en: "Spicy shrimp soup",
    steps: [
      "Boil the lemongrass, galangal and kaffir lime leaves until fragrant.",
      "Add the shrimp and boil until cooked.",
      "Turn off the heat and season with fish sauce, lime and chili.",
    ],
    qty: { shrimp: "300 g", lemongrass: "2 stalks", galangal: "5 slices", "kaffir-lime-leaf": "4 leaves", chili: "5 bird's eye", lime: "2", "fish-sauce": "2 tbsp" },
  },
  "แกงเขียวหวานไก่": {
    en: "Green curry with chicken",
    steps: [
      "Fry the curry paste with the thick coconut cream until the oil separates.",
      "Add the chicken and stir-fry until cooked, then add the remaining coconut milk.",
      "Season, then add the Thai basil and chili.",
    ],
    qty: { chicken: "300 g", "green-curry-paste": "2 tbsp", "coconut-milk": "2 cups", "thai-basil": "1 handful", chili: "2 spur chilies", "fish-sauce": "1 1/2 tbsp" },
  },

  // Batch 1
  "ต้มข่าไก่": {
    en: "Chicken in coconut galangal soup",
    steps: [
      "Bring 1 cup of water to a boil with the galangal, bruised lemongrass and kaffir lime leaves.",
      "Add the coconut milk and bring to a gentle simmer over medium heat. Do not boil hard, or the coconut milk will split.",
      "Add the chicken, cut into bite-size pieces, and simmer over medium heat until cooked.",
      "Add the mushrooms and chili and simmer for 2 more minutes.",
      "Season with fish sauce, turn off the heat, then squeeze in the lime.",
    ],
    qty: { chicken: "200 g", "coconut-milk": "1 cup", galangal: "5 slices", lemongrass: "2 stalks", "kaffir-lime-leaf": "4 leaves", mushroom: "100 g", chili: "3 bird's eye", lime: "half a lime", "fish-sauce": "1 1/2 tbsp" },
  },
  "ส้มตำไทย": {
    en: "Green papaya salad",
    steps: [
      "Pound the garlic and chilies until roughly crushed, then add the dried shrimp.",
      "Add the palm sugar, fish sauce and lime juice and stir together.",
      "Add the long beans and tomatoes and pound lightly to bruise them.",
      "Add the papaya, pound and toss to combine, then sprinkle with peanuts.",
    ],
    qty: { "green-papaya": "1 cup, shredded", "long-bean": "2 pods", tomato: "3 small", garlic: "2 cloves", chili: "2-5 bird's eye", "dried-shrimp": "1 tbsp", peanut: "1 tbsp, roasted", "palm-sugar": "1 tbsp", lime: "1", "fish-sauce": "1 1/2 tbsp" },
  },
  "ผัดไทยกุ้งสด": {
    en: "Pad Thai with shrimp",
    steps: [
      "Mix the tamarind water, fish sauce and palm sugar into a sauce.",
      "Stir-fry the shallot and tofu in oil until fragrant, then add the shrimp and stir-fry until cooked.",
      "Add the noodles and sauce and stir-fry over medium heat until the noodles are soft and just dry.",
      "Push the noodles to one side, crack the egg into the pan, wait until it starts to set, then stir-fry everything together.",
      "Add the bean sprouts and garlic chives, stir-fry quickly, and sprinkle with peanuts.",
    ],
    qty: { "rice-noodle": "100 g thin noodles, soaked until soft", shrimp: "5", egg: "1", tofu: "30 g, firm", "bean-sprout": "1 handful", "garlic-chive": "3 stalks", shallot: "1", "tamarind-paste": "2 tbsp tamarind water", "fish-sauce": "1 tbsp", "palm-sugar": "1 1/2 tbsp", peanut: "1 tbsp, ground" },
  },
  "ไข่พะโล้": {
    en: "Eggs and pork belly stewed in five-spice",
    steps: [
      "Fry the garlic until fragrant, add the sliced pork belly and stir-fry until it changes color.",
      "Add 3 cups of water, the five-spice powder, light soy sauce and palm sugar, and bring to a boil.",
      "Lower the heat and simmer for about 30 minutes until the pork is tender.",
      "Add the boiled eggs and simmer for 10 more minutes so the eggs take on color.",
    ],
    qty: { egg: "4, hard-boiled", pork: "200 g pork belly", "five-spice": "1/2 tsp", "soy-sauce": "2 tbsp light soy sauce", "palm-sugar": "1 tbsp", garlic: "3 cloves" },
  },
  "ผัดซีอิ๊วหมู": {
    en: "Wide noodles stir-fried with pork and Chinese kale",
    steps: [
      "Fry the garlic until fragrant, add the thinly sliced pork and stir-fry until cooked.",
      "Add the wide noodles, light soy sauce, dark soy sauce, oyster sauce and sugar. Stir-fry over high heat until the noodles turn dark and catch the pan slightly.",
      "Push the noodles to one side, crack in the egg, and stir-fry to combine.",
      "Add the Chinese kale and stir-fry for about 1 more minute.",
    ],
    qty: { "rice-noodle": "150 g wide noodles", pork: "100 g", "chinese-kale": "100 g", egg: "1", garlic: "3 cloves", "soy-sauce": "1 tsp light soy sauce", "dark-soy-sauce": "1 tsp", "oyster-sauce": "1 tbsp", sugar: "1 tsp" },
  },
  "แกงจืดวุ้นเส้นหมูสับ": {
    en: "Clear soup with glass noodles and minced pork",
    steps: [
      "Bring 3 cups of water to a boil with the bruised garlic.",
      "Shape the minced pork into small balls, drop them in, and wait until cooked.",
      "Add the mushrooms and glass noodles and boil for 2-3 minutes.",
      "Season with fish sauce and light soy sauce, then sprinkle with spring onion.",
    ],
    qty: { "glass-noodle": "40 g, soaked until soft", pork: "100 g, minced", mushroom: "3", garlic: "2 cloves", "spring-onion": "2 stalks", "fish-sauce": "1 tbsp", "soy-sauce": "1 tsp light soy sauce" },
  },
  "ลาบหมู": {
    en: "Spicy minced pork salad",
    steps: [
      "Cook the minced pork with 3 tbsp of water until fully done and crumbly, then set aside to stay warm.",
      "Add the sliced shallots, chili flakes, fish sauce and lime juice, and toss to combine.",
      "Add the toasted rice powder, spring onion and mint, and toss gently.",
      "Serve with fresh vegetables and sticky rice.",
    ],
    qty: { pork: "200 g, minced", shallot: "3", "chili-flakes": "1 tsp", lime: "1", "fish-sauce": "1 1/2 tbsp", "toasted-rice-powder": "1 tbsp", mint: "1 handful", "spring-onion": "2 stalks" },
  },
  "ไก่ผัดเม็ดมะม่วงหิมพานต์": {
    en: "Chicken stir-fried with cashews",
    steps: [
      "Toast the cashews in a pan over low heat until golden, then set aside.",
      "Fry the garlic and dried chilies until fragrant, add the chicken and stir-fry until cooked.",
      "Add the onion, oyster sauce, light soy sauce and sugar, and stir-fry to combine.",
      "Add the cashews and spring onion and stir-fry quickly.",
    ],
    qty: { chicken: "200 g", cashew: "1/3 cup", onion: "half an onion", "dried-chili": "4", garlic: "3 cloves", "spring-onion": "2 stalks", "oyster-sauce": "1 tbsp", "soy-sauce": "1 tbsp light soy sauce", sugar: "1 tsp" },
  },
  "ผัดพริกแกงหมูถั่วฝักยาว": {
    en: "Pork and long beans in red curry paste",
    steps: [
      "Fry the curry paste in oil over medium heat until fragrant.",
      "Add the thinly sliced pork and stir-fry until cooked.",
      "Add the long beans, cut into lengths, season with fish sauce and sugar, and stir-fry for about 2-3 minutes.",
      "Add the torn kaffir lime leaves and chili and stir-fry to combine.",
    ],
    qty: { pork: "150 g", "long-bean": "100 g", "red-curry-paste": "1 1/2 tbsp", "kaffir-lime-leaf": "3 leaves", chili: "2 bird's eye", "fish-sauce": "1 tbsp", sugar: "1 tsp" },
  },
  "ผัดฟักทองใส่ไข่": {
    en: "Pumpkin stir-fried with egg",
    steps: [
      "Cut the pumpkin into thin slices.",
      "Fry the garlic until fragrant, add the pumpkin and stir-fry with a little water until soft.",
      "Season with oyster sauce.",
      "Crack in the eggs and stir-fry until the egg is cooked and combined.",
    ],
    qty: { pumpkin: "200 g", egg: "2", garlic: "3 cloves", "oyster-sauce": "1 tbsp" },
  },

  // Batch 2
  "ผัดผักรวม": {
    en: "Mixed vegetable stir-fry",
    steps: [
      "Heat a pan, add the oil and fry the garlic until fragrant.",
      "Add the carrot and broccoli and stir-fry over high heat for 1 minute.",
      "Add the cabbage and season with oyster sauce.",
      "Stir-fry for 1 more minute, keeping the vegetables crisp, then serve.",
    ],
    qty: { cabbage: "1 cup", carrot: "half a carrot", broccoli: "half a cup", garlic: "2 cloves", "oyster-sauce": "1 tbsp", "cooking-oil": "1 tbsp" },
  },
  "ผัดคะน้าหมู": {
    en: "Stir-fried Chinese kale with pork",
    steps: [
      "Pound the garlic and chilies until roughly crushed.",
      "Stir-fry the chili and garlic in oil until fragrant.",
      "Add the pork and stir-fry until cooked.",
      "Add the Chinese kale and season with oyster sauce and sugar.",
      "Stir-fry over high heat so the kale stays bright green, then turn off the heat.",
    ],
    qty: { pork: "100 g", "chinese-kale": "1 handful", garlic: "3 cloves", chili: "2 bird's eye", "oyster-sauce": "1 tbsp", sugar: "half a tsp", "cooking-oil": "1 tbsp" },
  },
  "ข้าวต้มหมู": {
    en: "Rice soup with pork meatballs",
    steps: [
      "Bring 4 cups of water to a boil with the ginger.",
      "Shape the minced pork into small balls, drop them in, and boil until cooked.",
      "Add the cooked rice, lower the heat, and simmer for 10 more minutes.",
      "Season with salt and pepper.",
      "Sprinkle with spring onion and Chinese celery.",
    ],
    qty: { rice: "2 cups, cooked", pork: "100 g, minced", ginger: "3 slices", "spring-onion": "2 stalks", celery: "1 stalk", salt: "half a tsp", pepper: "1/4 tsp" },
  },
  "ต้มจืดผักกาดขาวหมูสับ": {
    en: "Clear soup with napa cabbage and minced pork",
    steps: [
      "Bring 3 cups of water to a boil.",
      "Shape the minced pork into small balls, drop them in, and boil until cooked.",
      "Add the napa cabbage and boil for 3 more minutes.",
      "Season with light soy sauce and pepper.",
      "Add the spring onion, then turn off the heat.",
    ],
    qty: { "napa-cabbage": "2 cups", pork: "100 g, minced", "spring-onion": "1 stalk", "soy-sauce": "1 tbsp light soy sauce", pepper: "1/4 tsp" },
  },
  "ไก่ทอดกระเทียมพริกไทย": {
    en: "Fried chicken with garlic and pepper",
    steps: [
      "Pound the garlic, pepper and coriander root until fine.",
      "Marinate the chicken with the pounded mix and fish sauce for 15 minutes.",
      "Coat the chicken pieces all over with wheat flour.",
      "Heat the oil over medium heat and fry the chicken for about 10 minutes until cooked and golden.",
      "Lift out and drain the oil.",
    ],
    qty: { chicken: "300 g, bite-size pieces", garlic: "5 cloves", coriander: "1 plant (root and stem)", pepper: "1 tsp", "fish-sauce": "1 tbsp", flour: "2 tbsp wheat flour", "cooking-oil": "1 cup, for frying" },
  },
  "ผัดมะเขือยาวหมูสับ": {
    en: "Stir-fried long eggplant with minced pork and basil",
    steps: [
      "Pound the garlic and chilies until roughly crushed.",
      "Stir-fry the chili and garlic in oil until fragrant, add the minced pork and stir-fry until cooked.",
      "Add the eggplant and 3 tbsp of water, and stir-fry until soft.",
      "Season with fermented soybean paste and sugar.",
      "Add the holy basil, stir-fry quickly, then turn off the heat.",
    ],
    qty: { eggplant: "1 long eggplant, cut in lengths", pork: "100 g, minced", garlic: "3 cloves", chili: "3 bird's eye", "holy-basil": "1 handful of leaves", "bean-paste": "1 tbsp", sugar: "half a tsp", "cooking-oil": "1 tbsp" },
  },
  "ข้าวผัดหมู": {
    en: "Pork fried rice",
    steps: [
      "Fry the garlic in oil until fragrant.",
      "Add the minced pork and stir-fry until cooked.",
      "Crack in the egg and break it up.",
      "Add the rice, stir-fry until combined, and season with light soy sauce.",
      "Add the tomato and spring onion, stir-fry once more, then turn off the heat.",
    ],
    qty: { rice: "1 cup, cooked", pork: "80 g, minced", egg: "1", garlic: "2 cloves", tomato: "half a tomato", "spring-onion": "1 stalk", "soy-sauce": "1 tsp light soy sauce", "cooking-oil": "1 tbsp" },
  },
  "ไข่ลูกเขย": {
    en: "Fried boiled eggs with tamarind sauce",
    steps: [
      "Boil the eggs in boiling water for 8 minutes until cooked, then peel.",
      "Fry the eggs in hot oil until golden and crisp outside, then set aside.",
      "Fry the shallots and dried chilies until crisp, then set aside.",
      "Simmer the tamarind water, palm sugar and fish sauce over low heat until slightly thick.",
      "Pour the tamarind sauce over the eggs and sprinkle with the fried shallots and chilies.",
    ],
    qty: { egg: "3", shallot: "3, sliced", "tamarind-paste": "2 tbsp tamarind water", "palm-sugar": "2 tbsp", "fish-sauce": "1 tbsp", "dried-chili": "2", "cooking-oil": "1 cup, for frying" },
  },
  "ยำวุ้นเส้นกุ้ง": {
    en: "Glass noodle salad with shrimp",
    steps: [
      "Soak the glass noodles in hot water for 5 minutes, drain, and cut short.",
      "Blanch the shrimp in boiling water until cooked.",
      "Mix the fish sauce, lime juice, sugar and sliced chili, stirring until the sugar dissolves.",
      "Add the glass noodles, shrimp, shallots, tomato and Chinese celery, and toss gently.",
    ],
    qty: { "glass-noodle": "50 g", shrimp: "5", tomato: "half a tomato", celery: "1 stalk", shallot: "2", lime: "1", chili: "3 bird's eye", "fish-sauce": "1 1/2 tbsp", sugar: "1 tsp" },
  },
  "ผัดเปรี้ยวหวานไก่": {
    en: "Sweet and sour chicken stir-fry",
    steps: [
      "Stir-fry the chicken in oil until cooked.",
      "Add the onion and stir-fry until soft.",
      "Add the ketchup and sugar and stir-fry to combine.",
      "Add the pineapple, tomato and cucumber, stir-fry quickly for about 1 minute, then turn off the heat.",
    ],
    qty: { chicken: "200 g", pineapple: "half a cup", tomato: "1", cucumber: "half a cucumber", onion: "half an onion", ketchup: "3 tbsp", sugar: "1 tsp", "cooking-oil": "1 tbsp" },
  },
  "ผัดถั่วงอกเต้าหู้": {
    en: "Stir-fried bean sprouts with tofu",
    steps: [
      "Heat a pan, add the oil and fry the garlic until fragrant.",
      "Add the tofu and stir-fry until lightly golden.",
      "Add the bean sprouts and garlic chives and season with light soy sauce.",
      "Stir-fry over high heat for 1 minute, then turn off the heat.",
    ],
    qty: { "bean-sprout": "1 cup", tofu: "half a block, firm, diced", "garlic-chive": "1 handful, cut in lengths", garlic: "2 cloves", "soy-sauce": "1 tbsp light soy sauce", "cooking-oil": "1 tbsp" },
  },
  "ต้มยำไก่น้ำใส": {
    en: "Clear spicy and sour chicken soup",
    steps: [
      "Bring 3 cups of water to a boil with the galangal, bruised lemongrass and kaffir lime leaves.",
      "Add the chicken and simmer over medium heat until cooked.",
      "Add the mushrooms and bruised chilies and simmer for 2 more minutes.",
      "Season with fish sauce, turn off the heat, then squeeze in the lime.",
    ],
    qty: { chicken: "200 g", mushroom: "100 g", lemongrass: "2 stalks", galangal: "5 slices", "kaffir-lime-leaf": "4 leaves", chili: "5 bird's eye", lime: "1", "fish-sauce": "2 tbsp" },
  },

  // Only in mocks/recipes.ts
  "หมูทอดกระเทียม": {
    en: "Garlic fried pork",
    steps: ["Marinate the pork with the garlic.", "Fry until golden."],
    qty: { pork: "200 g", garlic: "1 head" },
  },
};

// Swap suggestions (mocks/substitutes.ts) only carry a Thai label.
export const SWAP_EN: Record<string, string> = {
  "ซีอิ๊วดำ + น้ำตาล": "Dark soy sauce + sugar",
  "ซอสปรุงรส": "Seasoning sauce",
  "ซีอิ๊วขาว": "Light soy sauce",
  "เกลือ": "Salt",
  "ใบโหระพา": "Thai basil",
  "ใบกะเพรา": "Holy basil",
  "มะขามเปียก": "Tamarind",
  "น้ำส้มสายชู": "Vinegar",
  "พริกป่น": "Chili flakes",
  "พริกไทย": "Pepper",
  "หอมแดง": "Shallot",
  "กระเทียมเจียวสำเร็จ": "Ready-made fried garlic",
  "ไก่สับ": "Minced chicken",
  "เต้าหู้": "Tofu",
  "หมู": "Pork",
  "ไก่": "Chicken",
  "ปลาหมึก": "Squid",
  "ไข่": "Eggs",
  "เห็ด": "Mushrooms",
  "คะน้า": "Chinese kale",
  "ผักกาดขาว": "Napa cabbage",
  "หัวไชเท้า": "Daikon",
  "นมสด": "Fresh milk",
  "นมอัลมอนด์": "Almond milk",
  "น้ำซุป": "Stock",
  "ผิวมะนาว": "Lime zest",
  "ขิง": "Ginger",
  "เต้าหู้อ่อน": "Silken tofu",
  "เส้นก๋วยเตี๋ยว": "Rice noodles",
  "ขนมปัง": "Bread",
};

// The big word in cook mode. Keys are the verbs parseStep (app/recipe/steps.ts) can return.
export const VERB_EN: Record<string, string> = {
  "ปรุงรส": "Season", "ปรุง": "Season", "หมัก": "Marinate",
  "ปิดไฟ": "Heat off", "ต้ม": "Boil", "เคี่ยว": "Simmer", "ลวก": "Blanch",
  "ตี": "Beat", "ผสม": "Mix", "คลุก": "Toss", "คน": "Stir", "ตอก": "Crack", "ยี": "Break up",
  "ผัด": "Stir-fry", "ทอด": "Fry", "เจียว": "Fry", "ตั้ง": "Heat",
  "นึ่ง": "Steam",
  "หั่น": "Cut", "ซอย": "Slice", "สับ": "Chop",
  "โขลก": "Pound",
  "ใส่": "Add", "เท": "Pour", "เติม": "Add", "ราด": "Pour over", "โรย": "Sprinkle",
  "ตัก": "Lift out", "เสิร์ฟ": "Serve",
  "นำ": "Add", "ตำ": "Pound", "บุบ": "Crush", "หุง": "Cook", "อบ": "Bake", "แช่": "Soak",
  "ย่าง": "Grill", "ปิ้ง": "Toast", "คั่ว": "Toast", "ดัน": "Push", "ลดไฟ": "Lower heat", "ปั้น": "Shape",
};

// One cook-mode step. Timer, heat and icon always come from the Thai original (English text is never parsed);
// in English the verb is mapped and the whole translated sentence is the detail.
export function cookStep(thai: string, shown: string, index: number, lang: Lang) {
  const p = parseStep(thai, index);
  return lang === "th" ? p : { ...p, verb: VERB_EN[p.verb] ?? `Step ${index + 1}`, detail: shown };
}

// Dish name. History and favorites only store the Thai title, so the overlay supplies the English.
export const dishTitle = (dish: { th: string; en?: string }, lang: Lang) =>
  (lang === "en" && (recipeEn[dish.th]?.en || dish.en)) || dish.th;

// The steps shown for this language. A changed recipe (different step count) falls back to Thai rather than misaligning.
export function stepsFor(recipe: { th: string; steps: string[] }, lang: Lang): string[] {
  const entry = lang === "en" ? recipeEn[recipe.th] : undefined;
  return entry?.steps.length === recipe.steps.length ? entry.steps : recipe.steps;
}

export const qtyFor = (recipeTh: string, item: { id: string; qty: string }, lang: Lang) =>
  (lang === "en" && recipeEn[recipeTh]?.qty[item.id]) || item.qty;

export const swapLabel = (label: string, lang: Lang) => (lang === "en" && SWAP_EN[label]) || label;

// English ingredient name by id; `names` is built from getIngredients().
export const ingredientName = (item: { id: string; th: string }, names: Record<string, string>, lang: Lang) =>
  (lang === "en" && names[item.id]) || item.th;
