// Run: node --test app/recipe/recipeCard.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { recipeCard } from "./recipeCard.ts";
import { parseStep } from "./steps.ts";
import { recipes } from "../../mocks/recipes.ts";

const kraPao = recipes.find((r) => r.id === "pad-kra-pao-moo")!;
const url = "https://liff.line.me/123-abc/recipe/pad-kra-pao-moo";

// Every object in the card, depth-first.
function walk(node: unknown, out: Record<string, unknown>[] = []) {
  if (node && typeof node === "object") {
    if (!Array.isArray(node)) out.push(node as Record<string, unknown>);
    Object.values(node).forEach((v) => walk(v, out));
  }
  return out;
}
const texts = (card: unknown) => walk(card).filter((n) => n.type === "text").map((n) => n.text as string);

test("recipeCard is a flex message with a short alt text", () => {
  const card = recipeCard(kraPao, ["oyster-sauce"], url);
  assert.equal(card.type, "flex");
  assert.equal((card as { altText: string }).altText, "สูตรผัดกะเพราหมู");
});

test("only link (URI) buttons, one of them starts cooking on the page", () => {
  const actions = walk(recipeCard(kraPao, [], url)).filter((n) => n.action).map((n) => n.action as Record<string, unknown>);
  assert.ok(actions.length > 0);
  assert.ok(actions.every((a) => a.type === "uri"));
  assert.ok(actions.some((a) => a.label === "เริ่มทำ" && a.uri === url));
});

test("missing ingredients are marked ต้องซื้อ, and only then", () => {
  assert.ok(texts(recipeCard(kraPao, ["oyster-sauce"], url)).some((t) => t.includes("ต้องซื้อ")));
  assert.ok(!texts(recipeCard(kraPao, [], url)).some((t) => t.includes("ต้องซื้อ")));
});

test("every step is listed as a numbered verb", () => {
  const all = texts(recipeCard(kraPao, [], url));
  kraPao.steps.forEach((s, i) => assert.ok(all.includes(`${i + 1}. ${parseStep(s, i).verb}`), s));
});

test("every mock recipe fits LINE's limits", () => {
  for (const r of recipes) {
    const json = JSON.stringify(recipeCard(r, r.ingredients.map((x) => x.id), url));
    assert.ok(json.length < 30_000, r.id); // LINE bubble limit is 30 KB
  }
});
