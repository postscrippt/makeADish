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

  "search.ingredients": { th: "วัตถุดิบ", en: "Ingredients" },
  "search.allergies": { th: "แพ้อาหาร", en: "Food allergies" },
  "search.allergiesHint": { th: "เมนูที่มีวัตถุดิบเหล่านี้จะไม่แสดงเลย", en: "Dishes with these ingredients will never be shown." },
  "search.spice": { th: "ระดับความเผ็ด", en: "Spice level" },
  "search.spiceHint": {
    th: "เลือกระดับสูงสุดที่รับได้ จะไม่เห็นเมนูที่เผ็ดกว่านี้ กดซ้ำเพื่อดูทุกระดับ",
    en: "Pick the hottest you can handle. Hotter dishes won't appear. Tap again to see every level.",
  },
  "search.editTitle": { th: "แก้การค้นหา", en: "Edit search" },
  "search.applyEdit": { th: "ดูเมนูใหม่", en: "See new dishes" },
  "search.addFirst": { th: "เพิ่มวัตถุดิบก่อน", en: "Add ingredients first" },

  "picker.selected": { th: "วัตถุดิบที่เลือก", en: "Selected ingredients" },
  "picker.remove": { th: "ลบ {name}", en: "Remove {name}" },
  "picker.placeholder": { th: "พิมพ์ชื่อวัตถุดิบ เช่น ไก่, กระเทียม", en: "Type an ingredient, e.g. chicken, garlic" },
  "picker.searchLabel": { th: "ค้นหาวัตถุดิบเพื่อเพิ่ม", en: "Search for an ingredient to add" },
  "picker.notFound": { th: "ไม่พบ “{q}” ลองสะกดใหม่ หรือเลือกจากรายการ", en: "“{q}” not found. Check the spelling or pick from the list." },
  "picker.seeAll": { th: "ดูวัตถุดิบทั้งหมด", en: "See all ingredients" },
  "picker.seeAllCount": { th: "ดูวัตถุดิบทั้งหมด ({n})", en: "See all ingredients ({n})" },
  "picker.quickAdd": { th: "เพิ่มเร็ว", en: "Quick add" },
  "picker.hideList": { th: "ซ่อนรายการ", en: "Hide list" },

  "form.title": { th: "เพิ่มวัตถุดิบ", en: "Add ingredients" },
  "form.syncFailed": {
    th: "บันทึกไปที่แชทไม่สำเร็จ แชทอาจยังไม่รู้ว่าคุณแพ้อะไร ลองกดค้นหาอีกครั้ง",
    en: "Couldn't save to the chat, so it may not know your allergies yet. Try searching again.",
  },
  "form.apply": { th: "หาเมนู จาก {n} อย่าง", en: "Find dishes from {n} item{s}" },

  "results.title": { th: "เลือกเมนู", en: "Choose a dish" },
  "results.searching": { th: "กำลังหาเมนู…", en: "Finding dishes…" },
  "results.searchingLong": { th: "กำลังหาเมนูที่ทำได้จากวัตถุดิบของคุณ…", en: "Finding dishes you can make with your ingredients…" },
  "results.noSearch": { th: "ยังไม่ได้เลือกวัตถุดิบ", en: "No ingredients chosen yet" },
  "results.backToScan": { th: "กลับไปแชทเพื่อสแกน", en: "Back to chat to scan" },
  "results.typeOwn": { th: "พิมพ์วัตถุดิบเอง", en: "Type ingredients myself" },
  "results.failed": { th: "หาเมนูไม่สำเร็จ ลองใหม่อีกครั้งนะ", en: "Couldn't find dishes. Please try again." },
  "results.basis": { th: "ที่ใช้ค้นหา", en: "Search details" },
  "results.canCook": { th: "ทำได้เลย {n} เมนู", en: "You can cook {n} dish{es}" },
  "results.almost": { th: "ขาดของอีกนิดเดียว", en: "Just a few items short" },
  "results.fromCount": { th: "จากวัตถุดิบ {n} อย่าง", en: "From {n} ingredient{s}" },
  "results.edit": { th: "แก้ไข", en: "Edit" },
  "results.ingredients": { th: "วัตถุดิบ", en: "Ingredients" },
  "results.allergies": { th: "แพ้อาหาร", en: "Allergies" },
  "results.noAllergies": { th: "ยังไม่ได้ระบุ", en: "None set" },
  "results.spice": { th: "ความเผ็ด", en: "Spice" },
  "results.syncFailed": {
    th: "บันทึกไปที่แชทไม่สำเร็จ แชทอาจยังไม่รู้ว่าคุณแพ้อะไร ลองกดแก้ไขแล้วบันทึกอีกครั้ง",
    en: "Couldn't save to the chat, so it may not know your allergies yet. Tap Edit and save again.",
  },
  "results.none": { th: "ไม่พบเมนูที่ตรงเงื่อนไข", en: "No dishes match" },
  "results.noneHint": { th: "ค้นหาแล้ว {n} รอบ ลองเพิ่มวัตถุดิบหรือเปลี่ยนเงื่อนไขดูนะ", en: "Searched {n} time{s}. Try adding ingredients or changing your filters." },
  "results.editIngredients": { th: "แก้วัตถุดิบ", en: "Edit ingredients" },
  "results.rescan": { th: "สแกนใหม่ในแชท", en: "Scan again in chat" },
  "results.tabNow": { th: "ทำได้เลย", en: "Cook now" },
  "results.tabBuy": { th: "ต้องซื้อเพิ่ม", en: "Need to buy" },
  "results.missingFew": { th: "ขาดอีก 1-2 อย่าง", en: "Missing 1–2 items" },
  "results.missingMany": { th: "ขาดหลายอย่าง", en: "Missing 3 or more" },
  "results.tabs": { th: "หมวดเมนู", en: "Dish groups" },
  "results.emptyCategory": { th: "ไม่มีเมนู{category}ในแท็บนี้", en: "No {category} dishes in this tab" },
  "results.emptyNow": { th: "ยังไม่มีเมนูที่ใช้วัตถุดิบครบ ลองดูแท็บ “ต้องซื้อเพิ่ม”", en: "No dish uses only what you have. Try the “Need to buy” tab." },
  "results.emptyBuy": { th: "ไม่มีเมนูที่ต้องซื้อเพิ่ม", en: "No dishes need extra shopping" },
  "results.tries": { th: "ค้นหาแล้ว {n} รอบ", en: "Searched {n} time{s}" },

  "card.ready": { th: "ทำได้เลย", en: "Ready to cook" },
  "card.missing": { th: "ขาด {n} อย่าง", en: "Missing {n}" },
  "card.minutes": { th: "{n} นาที", en: "{n} min" },
  "card.spice": { th: "ความเผ็ดระดับ {n}", en: "Spice level {n}" },

  "recipe.title": { th: "สูตรอาหาร", en: "Recipe" },
  "recipe.loadFailed": { th: "โหลดสูตรไม่สำเร็จ ลองใหม่อีกครั้งนะ", en: "Couldn't load the recipe. Please try again." },
  "recipe.notFound": { th: "ไม่พบสูตรอาหารนี้", en: "Recipe not found" },
  "recipe.favorite": { th: "เมนูโปรด", en: "Favorite" },
  "recipe.info": { th: "ข้อมูลเมนู", en: "Dish details" },
  "recipe.servings": { th: "{n} ที่", en: "Serves {n}" },
  "recipe.notSpicy": { th: "ไม่เผ็ด", en: "Not spicy" },
  "recipe.allergyWarning": { th: "⚠ เมนูนี้มี {names} ที่คุณแพ้", en: "⚠ This dish contains {names}, which you are allergic to" },
  "recipe.ingredients": { th: "วัตถุดิบ", en: "Ingredients" },
  "recipe.steps": { th: "วิธีทำ", en: "Steps" },
  "recipe.stepCount": { th: "{n} ขั้น", en: "{n} step{s}" },
  "recipe.continue": { th: "ทำต่อ ขั้นที่ {n}", en: "Continue from step {n}" },
  "recipe.start": { th: "เริ่มทำ", en: "Start cooking" },
  "recipe.missingPrefix": { th: "ขาด ", en: "Missing " },
  "recipe.swapAsk": { th: "ใช้อะไรแทนได้?", en: "What can I use instead?" },
  "recipe.swapLoading": { th: "กำลังหา…", en: "Looking…" },
  "recipe.swapFailed": { th: "โหลดไม่สำเร็จ", en: "Couldn't load." },
  "recipe.swapWith": { th: "แทนด้วย {label}", en: "Use {label}" },
  "recipe.swapUnsafe": { th: "ไม่มีตัวแทนที่ปลอดภัยสำหรับคุณ", en: "No safe substitute for your allergies" },
  "recipe.swapNone": { th: "ยังไม่มีคำแนะนำสำหรับวัตถุดิบนี้", en: "No suggestions for this ingredient yet" },
  "recipe.sendFailed": { th: "ส่งไม่สำเร็จ ลองอีกครั้งนะ", en: "Couldn't send. Please try again." },
  "recipe.sent": { th: "ส่งสูตรเข้าแชทแล้ว", en: "Recipe sent to the chat" },
  "recipe.shared": { th: "แชร์แล้ว", en: "Shared" },
  "recipe.sendToChat": { th: "ส่งเข้าแชท", en: "Send to chat" },
  "recipe.share": { th: "แชร์ให้เพื่อน", en: "Share with friends" },

  "cook.heatLow": { th: "ไฟอ่อน", en: "Low heat" },
  "cook.heatMedium": { th: "ไฟกลาง", en: "Medium heat" },
  "cook.heatHigh": { th: "ไฟแรง", en: "High heat" },
  "cook.dialog": { th: "ทำ {name}", en: "Cooking {name}" },
  "cook.exit": { th: "ออกจากโหมดทำอาหาร", en: "Leave cook mode" },
  "cook.stepOf": { th: "ขั้นที่ {n} จาก {total}", en: "Step {n} of {total}" },
  "cook.usedHere": { th: "ใช้ในขั้นนี้", en: "Used in this step" },
  "cook.remaining": { th: "ขั้นตอนที่เหลือ", en: "Remaining steps" },
  "cook.goTo": { th: "ไปขั้นที่ {n}: {verb}", en: "Go to step {n}: {verb}" },
  "cook.rateAtEnd": { th: "เสร็จแล้ว ให้คะแนนเมนู", en: "Done, rate the dish" },
  "cook.previous": { th: "ขั้นก่อนหน้า", en: "Previous step" },
  "cook.finish": { th: "เสร็จแล้ว", en: "Finished" },
  "cook.next": { th: "ขั้นต่อไป", en: "Next step" },
  "cook.saved": { th: "บันทึกลงประวัติแล้ว", en: "Saved to History" },
  "cook.seeHistory": { th: "ดูประวัติ", en: "See History" },
  "cook.howGood": { th: "อร่อยแค่ไหน?", en: "How was it?" },
  "cook.rate": { th: "ให้คะแนน", en: "Rate this dish" },
  "cook.save": { th: "บันทึก", en: "Save" },
  "cook.skipRating": { th: "ไม่ให้คะแนน กลับไปที่สูตร", en: "Skip rating, back to the recipe" },
  "cook.saveFailed": { th: "บันทึกไม่สำเร็จ ลองกดบันทึกอีกครั้ง", en: "Couldn't save. Please tap Save again." },
  "cook.timeUp": { th: "ครบเวลาแล้ว", en: "Time's up" },
  "cook.tapPause": { th: "แตะเพื่อพัก", en: "Tap to pause" },
  "cook.tapResume": { th: "แตะเพื่อไปต่อ", en: "Tap to resume" },
  "cook.tapStart": { th: "แตะเพื่อจับเวลา", en: "Tap to start timer" },
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

// A dish or ingredient name. An empty English name falls back to Thai.
export const localName = (item: { th: string; en: string }, lang: Lang) => (lang === "en" && item.en) || item.th;
