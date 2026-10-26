import test from "node:test";
import assert from "node:assert/strict";
import { handleEvent, parseSearchPostback, type Deps, type LineEvent } from "./handler.ts";
import { standInScan, standInSearch } from "./standins.ts";
import { allergens, ingredients } from "../../mocks/data.ts";
import { recipes } from "../../mocks/recipes.ts";
import type { LineMessage } from "./client.ts";
import type { ScanResult, SearchRequest, SpiceLevel } from "../../types/api.ts";

type Calls = { replies: { token: string; messages: LineMessage[] }[]; loading: string[]; content: string[]; searches: SearchRequest[] };

function setup(over: Partial<Deps> = {}, profile: { allergies: string[]; spice: SpiceLevel } = { allergies: [], spice: 1 }) {
  const calls: Calls = { replies: [], loading: [], content: [], searches: [] };
  const deps: Deps = {
    client: {
      async reply(token, messages) { calls.replies.push({ token, messages }); },
      async startLoading(chatId) { calls.loading.push(chatId); },
      async getContent(id) { calls.content.push(id); return { bytes: new Uint8Array([1, 2, 3]), mime: "image/jpeg" }; },
    },
    scan: standInScan,
    async search(req) { calls.searches.push(req); return standInSearch(req); },
    async getProfile() { return profile; },
    allergens,
    knownIngredientIds: new Set(ingredients.map((x) => x.id)),
    url: (path) => `https://app.test${path}`,
    ...over,
  };
  return { deps, calls };
}

const text = (t: string): LineEvent => ({ type: "message", replyToken: "r1", source: { type: "user", userId: "U1" }, message: { type: "text", id: "m1", text: t } });
const image = (sourceType = "user"): LineEvent => ({ type: "message", replyToken: "r1", source: { type: sourceType, userId: "U1" }, message: { type: "image", id: "img9" } });
const postback = (data: string): LineEvent => ({ type: "postback", replyToken: "r1", source: { type: "user", userId: "U1" }, postback: { data } });
const json = (m: LineMessage) => JSON.stringify(m);

test("the scan trigger gets the camera prompt with quick replies", async () => {
  const { deps, calls } = setup();
  await handleEvent(text("สแกนวัตถุดิบ"), deps);
  assert.equal(calls.replies.length, 1);
  assert.equal(calls.replies[0].token, "r1");
  const m = calls.replies[0].messages[0] as { quickReply: { items: { action: { type: string } }[] } };
  assert.deepEqual(m.quickReply.items.map((i) => i.action.type), ["camera", "cameraRoll", "uri"]);
});

test("other text and events without a reply token get no reply", async () => {
  const { deps, calls } = setup();
  await handleEvent(text("hello"), deps);
  await handleEvent({ ...text("สแกนวัตถุดิบ"), replyToken: undefined }, deps);
  await handleEvent({ type: "follow", replyToken: "r1" }, deps);
  assert.equal(calls.replies.length, 0);
});

test("an image starts the loading animation, scans, and replies once with the confirm card", async () => {
  const { deps, calls } = setup();
  await handleEvent(image(), deps);
  assert.deepEqual(calls.loading, ["U1"]);
  assert.deepEqual(calls.content, ["img9"]);
  assert.equal(calls.replies.length, 1);
  const s = json(calls.replies[0].messages[0]);
  assert.match(s, /เจอวัตถุดิบ 5 อย่าง/);
  assert.match(s, /action=search&ids=pork,egg,garlic,chili,holy-basil/);
  assert.match(s, /ยังไม่ได้ระบุอาหารที่แพ้/);
  assert.match(s, /https:\/\/app\.test\/form\?ids=/);
});

test("no loading animation outside a 1:1 chat", async () => {
  const { deps, calls } = setup();
  await handleEvent(image("group"), deps);
  assert.equal(calls.loading.length, 0);
  assert.equal(calls.replies.length, 1);
});

test("saved allergies are shown on the confirm card by name", async () => {
  const { deps, calls } = setup({}, { allergies: ["shellfish"], spice: 2 });
  await handleEvent(image(), deps);
  assert.match(json(calls.replies[0].messages[0]), /แพ้: อาหารทะเลมีเปลือก/);
});

for (const reason of ["no_food", "blurry", "error"] as const) {
  test(`scan failure (${reason}) replies with the reason and the same quick replies`, async () => {
    const { deps, calls } = setup({ async scan() { return { ok: false, reason } as ScanResult; } });
    await handleEvent(image(), deps);
    const m = calls.replies[0].messages[0] as { type: string; text: string; quickReply: unknown };
    assert.equal(m.type, "text");
    assert.ok(m.text.length > 0 && m.quickReply);
  });
}

test("a thrown error while downloading or scanning still gets one friendly reply", async () => {
  const { deps, calls } = setup({ async scan() { throw new Error("boom"); } });
  await handleEvent(image(), deps);
  assert.equal(calls.replies.length, 1);
  assert.doesNotMatch(json(calls.replies[0].messages[0]), /boom/);
});

test("an empty scan asks the user to retry", async () => {
  const { deps, calls } = setup({ async scan() { return { ok: true, ingredients: [] } as ScanResult; } });
  await handleEvent(image(), deps);
  assert.equal((calls.replies[0].messages[0] as { type: string }).type, "text");
});

test("the search postback runs the search and replies with the carousel", async () => {
  const { deps, calls } = setup();
  await handleEvent(postback("action=search&ids=egg,pork,garlic"), deps);
  assert.deepEqual(calls.searches[0].ingredientIds, ["egg", "pork", "garlic"]);
  assert.equal(calls.replies.length, 1);
  assert.equal((calls.replies[0].messages[0] as { contents: { type: string } }).contents.type, "carousel");
  assert.match(json(calls.replies[0].messages[0]), /https:\/\/app\.test\/recipe\/[a-z-]+\?from=results/);
});

test("allergy filter comes from the saved profile, never from the message", async () => {
  const { deps, calls } = setup({}, { allergies: ["egg"], spice: 3 });
  // A forged allergies=none in the postback must change nothing.
  await handleEvent(postback("action=search&ids=egg,pork,garlic&allergies="), deps);
  assert.deepEqual(calls.searches[0].allergies, ["egg"]);
  const result = await standInSearch(calls.searches[0]);
  const shown = [...result.matches, ...result.almostThere].map((m) => m.recipe.id);
  assert.ok(shown.length > 0, "the test needs some results to be meaningful");
  for (const id of shown) {
    assert.ok(!recipes.find((r) => r.id === id)!.allergens!.includes("egg"), `${id} contains egg`);
  }
});

test("unknown ingredient ids in a postback are ignored; none left means no reply", async () => {
  assert.deepEqual(parseSearchPostback("action=search&ids=egg,../etc,pork", new Set(["egg", "pork"])), ["egg", "pork"]);
  assert.equal(parseSearchPostback("action=search&ids=nope", new Set(["egg"])), null);
  assert.equal(parseSearchPostback("action=other&ids=egg", new Set(["egg"])), null);
  const { deps, calls } = setup();
  await handleEvent(postback("action=search&ids=nope"), deps);
  assert.equal(calls.replies.length, 0);
});

test("postback data stays under LINE's 300 character limit", async () => {
  const many = Array.from({ length: 40 }, (_, i) => `ingredient-number-${i}`);
  const { deps, calls } = setup({
    async scan() { return { ok: true, ingredients: many.map((id) => ({ id, th: id, en: id, aliases: [] })) } as ScanResult; },
  });
  await handleEvent(image(), deps);
  const data = JSON.stringify(calls.replies[0].messages[0]).match(/"data":"([^"]+)"/)![1];
  assert.ok(data.length <= 300, `data is ${data.length} chars`);
});
