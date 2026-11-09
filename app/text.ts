// Every word the web pages show, in both languages. Chat text lives in lib/line and app/line and stays Thai.
// {n} and the like are filled in by t(). {s} / {es} is the English plural ending, added when n is not 1.
import type { Option } from "../types/api.ts";

export type Lang = "th" | "en";
export type Vars = Record<string, string | number>;

export const dictionary = {
  "common.loading": { th: "กำลังโหลด…", en: "Loading…" },
  "common.backToChat": { th: "กลับไปที่แชท", en: "Back to chat" },
  "common.back": { th: "ย้อนกลับ", en: "Back" },
  "common.close": { th: "ปิด", en: "Close" },
  "common.closeToChat": { th: "ปิด กลับไปที่แชท", en: "Close and go back to chat" },
  "common.retry": { th: "ลองอีกครั้ง", en: "Try again" },
  "common.language": { th: "ภาษา", en: "Language" },

  "error.title": { th: "มีบางอย่างผิดพลาด", en: "Something went wrong" },
  "error.hint": { th: "เช็กอินเทอร์เน็ตแล้วลองใหม่อีกครั้งนะ", en: "Check your internet and try again." },
  "notFound.title": { th: "ไม่พบหน้านี้", en: "Page not found" },
  "notFound.hint": { th: "ลองเปิดใหม่จากเมนูในแชท LINE นะ", en: "Try opening it again from the menu in the LINE chat." },

  "home.intro": {
    th: "เปิดใช้งานจากแชท LINE ของเรา แล้วกด “สแกนวัตถุดิบ” ที่เมนูด้านล่าง",
    en: "Open MakeADish from our LINE chat, then tap “Scan” in the menu at the bottom.",
  },
  "home.devNav": { th: "หน้าสำหรับทดสอบ", en: "Test pages" },
  "home.devMode": { th: "โหมดทดสอบ (mock)", en: "Test mode (mock)" },
  "home.devForm": { th: "พิมพ์วัตถุดิบ", en: "Type ingredients" },

  "menus.title": { th: "เมนูทั้งหมด", en: "All Menus" },
  "menus.loadFailed": { th: "โหลดเมนูไม่สำเร็จ ลองใหม่อีกครั้งนะ", en: "Couldn't load the dishes. Please try again." },
  "menus.headline": { th: "อยากทำอะไรดี?", en: "What do you feel like making?" },
  "menus.searchPlaceholder": { th: "ค้นหาเมนู เช่น กะเพรา, ต้มยำ", en: "Search dishes, e.g. basil, tom yum" },
  "menus.searchLabel": { th: "ค้นหาเมนู", en: "Search dishes" },
  "menus.categories": { th: "ประเภทอาหาร", en: "Dish type" },
  "menus.all": { th: "ทั้งหมด", en: "All" },
  "menus.count": { th: "{n} เมนู", en: "{n} dish{es}" },
  "menus.hiddenFor": { th: " · ซ่อนเมนูที่มี {names} ตามที่คุณแพ้", en: " · Hiding dishes with {names}, your allergies" },
  "menus.noResults": { th: "ไม่พบเมนูที่ค้นหา", en: "No dishes found" },
  "menus.showAll": { th: "ดูทั้งหมด", en: "Show all" },

  "history.title": { th: "ประวัติ", en: "History" },
  "history.loadFailed": { th: "โหลดประวัติไม่สำเร็จ ลองใหม่อีกครั้งนะ", en: "Couldn't load your history. Please try again." },
  "history.cookedCount": { th: "ทำไปแล้ว {n} เมนู", en: "{n} dish{es} cooked" },
  "history.noneCooked": { th: "ยังไม่มีเมนูที่เคยทำ", en: "Nothing cooked yet" },
  "history.favoriteCount": { th: "เมนูโปรด {n} เมนู", en: "{n} favorite{s}" },
  "history.list": { th: "รายการ", en: "List" },
  "history.tabCooked": { th: "ที่เคยทำ ({n})", en: "Cooked ({n})" },
  "history.tabFavorites": { th: "เมนูโปรด ({n})", en: "Favorites ({n})" },
  "history.emptyCooked": {
    th: "ยังไม่มีเมนูที่เคยทำ ทำเสร็จแล้วให้คะแนน เมนูจะมาอยู่ที่นี่",
    en: "Nothing cooked yet. Rate a dish when you finish it and it will appear here.",
  },
  "history.emptyCookedHint": {
    th: "เริ่มจากกด “สแกนวัตถุดิบ” ที่เมนูด้านล่างของแชท",
    en: "Start by tapping “Scan” in the menu at the bottom of the chat.",
  },
  "history.emptyFavorites": { th: "ยังไม่มีเมนูโปรด กด ♡ ในหน้าสูตรเพื่อเพิ่ม", en: "No favorites yet. Tap ♡ on a recipe to add one." },
  "history.browseAll": { th: "ดูเมนูทั้งหมด", en: "See all dishes" },
  "history.stars": { th: "{n} ดาว", en: "{n} star{s}" },
  "history.favoriteName": { th: "เมนูโปรด {name}", en: "Favorite: {name}" },
} satisfies Record<string, Record<Lang, string>>;

export type Key = keyof typeof dictionary;

export function t(key: Key, lang: Lang, vars: Vars = {}): string {
  return dictionary[key][lang]
    .replace(/\{(s|es)\}/g, (_, ending) => (Number(vars.n) === 1 ? "" : ending))
    .replace(/\{(\w+)\}/g, (_, name) => String(vars[name]));
}

// Standard food-labelling names. Safety text: never paraphrase these. Ids come from data/allergen-rules.
export const ALLERGEN_EN: Record<string, string> = {
  shellfish: "Crustacean shellfish",
  fish: "Fish",
  peanut: "Peanuts",
  tree_nut: "Tree nuts",
  egg: "Eggs",
  milk: "Milk",
  soy: "Soy",
  wheat: "Wheat",
  sesame: "Sesame",
};

export const DISH_CATEGORY_EN: Record<string, string> = {
  "stir-fry": "Stir-fry",
  soup: "Soup",
  curry: "Curry",
  salad: "Salad",
  fried: "Fried",
};

// Options arrive from the API with only `th`, so the English comes from the tables above.
export const allergenName = (o: Option, lang: Lang) => (lang === "en" ? ALLERGEN_EN[o.id] ?? o.th : o.th);
export const dishCategoryName = (o: Option, lang: Lang) => (lang === "en" ? DISH_CATEGORY_EN[o.id] ?? o.th : o.th);

// An empty English name falls back to Thai.
export const dishName = (recipe: { th: string; en: string }, lang: Lang) => (lang === "en" && recipe.en) || recipe.th;
