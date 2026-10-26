import test from "node:test";
import assert from "node:assert/strict";
import { buildIndex, mapName, mapNames, normalize } from "./ingredients.ts";
import { ingredients } from "../data/ingredients.ts";
import { recipes } from "../mocks/recipes.ts";
import { substitutes } from "../mocks/substitutes.ts";

const index = buildIndex(ingredients);

test("slugs are unique and no name or alias points at two ingredients", () => {
  const slugs = ingredients.map((e) => e.slug);
  assert.equal(new Set(slugs).size, slugs.length, "duplicate slug");
  assert.doesNotThrow(() => buildIndex(ingredients));
});

test("every entry has Thai and English names and a lowercase-hyphen slug", () => {
  for (const e of ingredients) {
    assert.match(e.slug, /^[a-z]+(-[a-z]+)*$/, e.slug);
    assert.ok(e.th.trim() && e.en.trim(), `${e.slug} needs both names`);
  }
});

test("หมู and หมูสับ are the same ingredient", () => {
  assert.equal(mapName("หมู", index), "pork");
  assert.equal(mapName("หมูสับ", index), "pork");
  assert.equal(mapName("หมูสามชั้น", index), "pork");
  assert.equal(mapName("minced pork", index), "pork");
});

test("spaces, case and punctuation do not matter", () => {
  assert.equal(mapName(" หมู สับ ", index), "pork");
  assert.equal(mapName("Holy Basil", index), "holy-basil");
  assert.equal(mapName("fish-sauce", index), "fish-sauce");
  assert.equal(mapName("Bird's eye chili", index), "chili");
});

test("a longer known name beats a shorter one inside it", () => {
  assert.equal(mapName("น้ำมันหอย", index), "oyster-sauce"); // not cooking oil
  assert.equal(mapName("น้ำปลา", index), "fish-sauce"); // not fish
  assert.equal(mapName("ปลาหมึก", index), "squid"); // not fish
  assert.equal(mapName("เส้นใหญ่", index), "rice-noodle");
  assert.equal(mapName("ซีอิ๊วดำ", index), "dark-soy-sauce");
  assert.equal(mapName("ซีอิ๊วขาว", index), "soy-sauce");
});

test("extra words around a known name still find it", () => {
  assert.equal(mapName("เนื้อหมูสับ", index), "pork");
  assert.equal(mapName("ไข่ไก่สด", index), "egg");
  assert.equal(mapName("ต้นหอมญี่ปุ่น", index), "spring-onion"); // what the vision model returned in testing
  assert.equal(mapName("หัวไชเท้าหั่น", index), "daikon");
});

test("things that are not ingredients map to nothing", () => {
  assert.equal(mapName("ยาสีฟัน", index), null);
  assert.equal(mapName("keyboard", index), null);
  assert.equal(mapName("", index), null);
  assert.equal(mapName("   ", index), null);
  assert.equal(mapName("!!!", index), null);
});

test("short English words are not matched inside longer ones", () => {
  assert.equal(mapName("eggplant", index), "eggplant");
  assert.equal(mapName("legging", index), null);
});

test("mapNames returns unique slugs in order and lists what it could not place", () => {
  const r = mapNames(["หมูสับ", "ไข่", "หมู", "ยาสีฟัน", "กระเทียม", " "], index);
  assert.deepEqual(r.ids, ["pork", "egg", "garlic"]);
  assert.deepEqual(r.unmapped, ["ยาสีฟัน"]);
});

test("the scan result from the LINE test photo maps cleanly", () => {
  const seen = ["เนื้อวัว", "ไข่", "หัวหอมใหญ่", "หัวไชเท้า", "กระเทียม", "ต้นหอมญี่ปุ่น"];
  const r = mapNames(seen, index);
  assert.deepEqual(r.ids, ["beef", "egg", "onion", "daikon", "garlic", "spring-onion"]);
  assert.deepEqual(r.unmapped, []);
});

test("normalize keeps Thai tone marks and vowels", () => {
  assert.equal(normalize("ซีอิ๊ว ขาว"), "ซีอิ๊วขาว");
  assert.equal(normalize("Fish  Sauce!"), "fishsauce");
});

// The mock data uses these ids today; the table must cover them. Three swap ids are being renamed.
const RENAMED = { kale: "chinese-kale", "light-soy-sauce": "soy-sauce", tamarind: "tamarind-paste" } as Record<string, string>;
const known = new Set(ingredients.map((e) => e.slug));

test("every ingredient id used by the mock recipes exists", () => {
  for (const r of recipes) for (const x of r.ingredients) assert.ok(known.has(x.id), `${r.id}: ${x.id}`);
});

test("every ingredient id used by the mock swaps exists, or is a known rename", () => {
  for (const [missing, options] of Object.entries(substitutes)) {
    assert.ok(known.has(missing) || RENAMED[missing], `swap key ${missing}`);
    for (const o of options) for (const id of o.ingredientIds) assert.ok(known.has(id) || known.has(RENAMED[id]), `swap ${missing}: ${id}`);
  }
});
