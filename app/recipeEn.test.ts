// Run: node --test app/recipeEn.test.ts
// Nobody reviews these translations by hand, so this compares the overlay against every recipe source.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { SWAP_EN, VERB_EN, cookStep, dishTitle, ingredientName, qtyFor, recipeEn, stepsFor, swapLabel } from "./recipeEn.ts";
import { VERBS, parseStep } from "./recipe/steps.ts";
import { recipes as mockRecipes } from "../mocks/recipes.ts";
import { substitutes } from "../mocks/substitutes.ts";
import { ingredients as mockCatalog } from "../mocks/data.ts";
import { ingredients as catalog } from "../data/ingredients.ts";

type Source = { steps?: string[]; ingredients?: { id: string; qty: string }[] };
const THAI = /[฀-๿]/;
const root = new URL("..", import.meta.url).pathname;
const numbers = (s: string) => s.match(/\d+\/\d+|\d+/g) ?? [];

// Every recipe in the batch files (ingredients, steps), the seed SQL (what the database holds) and the mocks.
function sources(): Map<string, Source[]> {
  const found = new Map<string, Source[]>();
  const add = (title: string, s: Source) => found.set(title, [...(found.get(title) ?? []), s]);

  for (const file of readdirSync(`${root}data/recipes`).filter((f) => /^batch-.*\.md$/.test(f))) {
    for (const block of readFileSync(`${root}data/recipes/${file}`, "utf8").split(/^## /m).slice(1)) {
      const head = /^\d+\.\s*(.+?)\s*\(`[^`]+`\)/.exec(block);
      if (!head) continue;
      const body = block.slice(block.indexOf("\n"));
      add(head[1], {
        ingredients: [...body.matchAll(/^\|\s*.+?\s*\|\s*`([^`]+)`\s*\|\s*(.+?)\s*\|$/gm)].map((m) => ({ id: m[1], qty: m[2] })),
        steps: [...body.matchAll(/^\d+\.\s+(.+)$/gm)].map((m) => m[1]),
      });
    }
  }
  for (const file of readdirSync(`${root}supabase/seed`).filter((f) => /^recipes-.*\.sql$/.test(f))) {
    const sql = readFileSync(`${root}supabase/seed/${file}`, "utf8");
    for (const m of sql.matchAll(/values \('([^']+)', '.*?', '[^']*', \d, \d+, \d+, '(\[.*?\])'::jsonb/g)) add(m[1], { steps: JSON.parse(m[2]) });
  }
  for (const r of mockRecipes) add(r.th, { steps: r.steps, ingredients: r.ingredients });
  return found;
}

const all = sources();

test("the source parser found the recipes", () => {
  assert.ok(all.size >= 32, `found ${all.size}`);
});

test("every recipe in the sources has an overlay entry", () => {
  assert.deepEqual([...all.keys()].filter((title) => !recipeEn[title]), []);
});

test("steps line up one to one and keep every number from the Thai", () => {
  for (const [title, list] of all) {
    for (const { steps } of list) {
      if (!steps) continue;
      const en = recipeEn[title].steps;
      assert.equal(en.length, steps.length, title);
      steps.forEach((th, i) => assert.deepEqual(numbers(en[i]), numbers(th), `${title} step ${i + 1}`));
    }
  }
});

test("amounts cover exactly the recipe's ingredients and keep every number", () => {
  for (const [title, list] of all) {
    for (const { ingredients } of list) {
      if (!ingredients) continue;
      const { qty } = recipeEn[title];
      for (const x of ingredients) {
        assert.ok(qty[x.id], `${title} ${x.id} has no amount`);
        assert.deepEqual(numbers(qty[x.id]), numbers(x.qty), `${title} ${x.id}`);
      }
    }
    // The mock version of a dish can list fewer rows than the batch file, so ids are checked against all of its versions.
    const ids = new Set(list.flatMap((s) => s.ingredients ?? []).map((x) => x.id));
    assert.deepEqual(Object.keys(recipeEn[title].qty).filter((id) => !ids.has(id)), [], title);
  }
});

test("the overlay holds no Thai", () => {
  for (const [title, r] of Object.entries(recipeEn)) {
    for (const text of [r.en, ...r.steps, ...Object.values(r.qty)]) {
      assert.ok(text.trim(), title);
      assert.doesNotMatch(text, THAI, title);
    }
  }
});

test("every recipe ingredient has an English name in the real catalog, and in mock mode", () => {
  const real = new Set(catalog.filter((x) => x.en).map((x) => x.slug));
  for (const [title, list] of all) {
    for (const { ingredients } of list) for (const x of ingredients ?? []) assert.ok(real.has(x.id), `${title} ${x.id}`);
  }
  const mock = new Set(mockCatalog.filter((x) => x.en).map((x) => x.id));
  for (const r of mockRecipes) for (const x of r.ingredients) assert.ok(mock.has(x.id), `${r.th} ${x.id}`);
});

test("every swap suggestion has English", () => {
  for (const o of Object.values(substitutes).flat()) {
    assert.ok(SWAP_EN[o.label], o.label);
    assert.doesNotMatch(SWAP_EN[o.label], THAI);
  }
});

test("Thai stays as it was and an unknown dish falls back to Thai", () => {
  const known = "หมูทอดกระเทียม";
  const steps = ["หมัก", "ทอด"];
  assert.deepEqual(stepsFor({ th: known, steps }, "th"), steps);
  assert.deepEqual(stepsFor({ th: known, steps }, "en"), recipeEn[known].steps);
  assert.deepEqual(stepsFor({ th: "เมนูใหม่", steps }, "en"), steps);
  assert.deepEqual(stepsFor({ th: known, steps: ["ขั้นเดียว"] }, "en"), ["ขั้นเดียว"]); // edited recipe: never misalign
  assert.equal(dishTitle({ th: "เมนูใหม่" }, "en"), "เมนูใหม่");
  assert.equal(dishTitle({ th: known }, "en"), "Garlic fried pork");
  assert.equal(dishTitle({ th: known, en: "x" }, "th"), known);
  assert.equal(qtyFor(known, { id: "pork", qty: "200 กรัม" }, "th"), "200 กรัม");
  assert.equal(qtyFor(known, { id: "pork", qty: "200 กรัม" }, "en"), "200 g");
  assert.equal(swapLabel("อื่น", "en"), "อื่น");
  assert.equal(ingredientName({ id: "x", th: "ไทย" }, {}, "en"), "ไทย");
  assert.equal(ingredientName({ id: "x", th: "ไทย" }, { x: "thai" }, "th"), "ไทย");
});

test("cook mode: every known verb has English, an unknown verb shows Step N", () => {
  for (const [word] of VERBS) assert.ok(VERB_EN[word], word);
  for (const v of Object.values(VERB_EN)) assert.doesNotMatch(v, THAI);
  assert.equal(cookStep("พักไว้ให้เย็น", "Let it cool.", 2, "en").verb, "Step 3");
});

test("cook mode: timer, heat and icon come from the Thai while the English is displayed", () => {
  const heatWords: Record<number, RegExp> = { 1: /low heat|lower the heat/i, 2: /medium heat/i, 3: /high heat|very hot/i };
  let timers = 0;
  let heats = 0;
  for (const [title, list] of all) {
    for (const { steps } of list) {
      steps?.forEach((th, i) => {
        const shown = recipeEn[title].steps[i];
        const parsed = parseStep(th, i);
        const cook = cookStep(th, shown, i, "en");
        assert.equal(cook.detail, shown);
        assert.equal(cook.minutes, parsed.minutes, title);
        assert.equal(cook.heat, parsed.heat, title);
        assert.equal(cook.icon, parsed.icon, title);
        assert.doesNotMatch(cook.verb, THAI, `${title} step ${i + 1}`);
        assert.deepEqual(cookStep(th, shown, i, "th"), parsed); // Thai mode unchanged
        if (parsed.minutes !== null) {
          timers++;
          assert.match(shown, new RegExp(`\\b${parsed.minutes}(-\\d+)? (more )?minutes?\\b`), `${title} step ${i + 1}`);
          assert.equal(parseStep(shown, i).minutes, null); // English would lose the timer if it were parsed
        }
        if (parsed.heat !== null) {
          heats++;
          assert.match(shown, heatWords[parsed.heat], `${title} step ${i + 1}`);
        }
      });
    }
  }
  assert.ok(timers > 5 && heats > 5, `checked ${timers} timers and ${heats} heats`);
});
