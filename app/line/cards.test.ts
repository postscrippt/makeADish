// Run: node --test app/line/cards.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { scanPrompt, confirmCard, resultsCarousel } from "./cards.ts";
import type { RecipeMatch, SearchResult } from "../../types/api.ts";

function walk(node: unknown, out: Record<string, unknown>[] = []) {
  if (node && typeof node === "object") {
    if (!Array.isArray(node)) out.push(node as Record<string, unknown>);
    Object.values(node).forEach((v) => walk(v, out));
  }
  return out;
}
const actions = (m: unknown) => walk(m).filter((n) => n.action).map((n) => n.action as Record<string, unknown>);
const texts = (m: unknown) => walk(m).filter((n) => n.type === "text").map((n) => n.text as string);

const match = (id: string, th: string, pct: number, missing: string[] = []): RecipeMatch => ({
  recipe: { id, th, en: th, category: "stir-fry", spice: 1, minutes: 15 },
  matchPercent: pct,
  missing: missing.map((m) => ({ id: m, th: m })),
});
const url = (p: string) => `https://liff.line.me/X${p}`;

test("scanPrompt opens the camera and the photo roll from quick replies", () => {
  const m = scanPrompt(url("/form")) as { type: string; quickReply: { items: { action: Record<string, string> }[] } };
  assert.equal(m.type, "text");
  const types = m.quickReply.items.map((i) => i.action.type);
  assert.deepEqual(types, ["camera", "cameraRoll", "uri"]);
  assert.ok(m.quickReply.items.every((i) => i.action.label.length <= 20));
});

test("confirmCard lists the ingredients, shows allergies, and has search + edit", () => {
  const m = confirmCard([{ id: "egg", th: "ไข่" }, { id: "pork", th: "หมูสับ" }], { allergyNames: ["กุ้ง"], spiceLabel: "เผ็ดน้อย" }, url("/form"), "action=search");
  const t = texts(m);
  assert.ok(t.includes("เจอวัตถุดิบ 2 อย่าง"));
  assert.ok(t.includes("• ไข่") && t.includes("• หมูสับ"));
  assert.ok(t.some((x) => x.includes("แพ้: กุ้ง")));
  const a = actions(m);
  assert.ok(a.some((x) => x.type === "postback" && x.data === "action=search" && x.label === "ถูกต้อง หาเมนู"));
  assert.ok(a.some((x) => x.type === "uri" && x.uri === url("/form") && x.label === "แก้ไข"));
});

test("confirmCard nudges allergy setup when none is saved", () => {
  const m = confirmCard([{ id: "egg", th: "ไข่" }], { allergyNames: [], spiceLabel: "ไม่เผ็ด" }, url("/form"), "s");
  assert.ok(texts(m).some((x) => x.includes("ยังไม่ได้ระบุอาหารที่แพ้")));
});

test("resultsCarousel: can-make first, almost-there with what's missing, ends with see-all", () => {
  const r: SearchResult = { matches: [match("a", "ไข่เจียว", 100)], almostThere: [match("b", "กะเพรา", 80, ["ใบกะเพรา"])], tries: 1 };
  const m = resultsCarousel(r, (id) => url(`/recipe/${id}?from=results`), url("/results"), url("/form")) as { contents: { type: string; contents: unknown[] } };
  assert.equal(m.contents.type, "carousel");
  const bubbles = m.contents.contents;
  assert.equal(bubbles.length, 3);
  assert.ok(texts(bubbles[0]).includes("ทำได้เลย"));
  assert.ok(texts(bubbles[1]).some((x) => x.includes("ขาด: ใบกะเพรา")));
  assert.ok(actions(bubbles[0]).some((x) => x.uri === url("/recipe/a?from=results")));
  assert.ok(actions(bubbles[2]).some((x) => x.uri === url("/results")));
});

test("resultsCarousel stays within LINE's 12-bubble limit", () => {
  const many = Array.from({ length: 20 }, (_, i) => match(`r${i}`, `เมนู${i}`, 100));
  const m = resultsCarousel({ matches: many, almostThere: many, tries: 1 }, (id) => url(`/recipe/${id}`), url("/results"), url("/form")) as { contents: { contents: unknown[] } };
  assert.ok(m.contents.contents.length <= 12);
  assert.ok(JSON.stringify(m).length < 50_000);
});

test("resultsCarousel with nothing found offers to fix ingredients", () => {
  const m = resultsCarousel({ matches: [], almostThere: [], tries: 3 }, (id) => id, url("/results"), url("/form"));
  assert.ok(texts(m).some((x) => x.includes("ไม่พบเมนู")));
  assert.ok(actions(m).some((x) => x.type === "uri" && x.label === "แก้วัตถุดิบ" && x.uri === url("/form")));
});

test("every message has a short alt text for notifications", () => {
  const msgs = [
    confirmCard([{ id: "egg", th: "ไข่" }], { allergyNames: [], spiceLabel: "ไม่เผ็ด" }, url("/form"), "s"),
    resultsCarousel({ matches: [match("a", "ไข่เจียว", 100)], almostThere: [], tries: 1 }, (id) => id, url("/results"), url("/form")),
  ] as { altText: string }[];
  for (const m of msgs) assert.ok(m.altText.length > 0 && m.altText.length <= 400);
});

test("no empty boxes (LINE rejects them), even for a one-ingredient scan", () => {
  const m = confirmCard([{ id: "egg", th: "ไข่" }], { allergyNames: [], spiceLabel: "ไม่เผ็ด" }, url("/form"), "s");
  assert.ok(walk(m).filter((n) => n.type === "box").every((b) => (b.contents as unknown[]).length > 0));
});
