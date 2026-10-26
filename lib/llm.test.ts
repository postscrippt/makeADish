import test from "node:test";
import assert from "node:assert/strict";
import { createGemini, getLlm, LlmError } from "./llm.ts";

type Reply = { status: number; body?: unknown } | "network";
const ok = (text: string): Reply => ({ status: 200, body: { candidates: [{ content: { parts: [{ text }] } }] } });
const err = (status: number, message = "boom"): Reply => ({ status, body: { error: { message } } });

// Replies are consumed in order; every call is recorded with the model it used.
function setup(replies: Reply[], over: { fallbackModel?: string } = { fallbackModel: "fallback-model" }) {
  const calls: { model: string; body: { contents: { parts: Record<string, unknown>[] }[] }; key: string }[] = [];
  const sleeps: number[] = [];
  let i = 0;
  const fetchImpl = (async (url: string, init: RequestInit) => {
    calls.push({
      model: decodeURIComponent(String(url).split("/models/")[1].split(":")[0]),
      body: JSON.parse(init.body as string),
      key: (init.headers as Record<string, string>)["x-goog-api-key"],
    });
    const r = replies[Math.min(i++, replies.length - 1)];
    if (r === "network") throw Object.assign(new TypeError("fetch failed"), { cause: { code: "ECONNRESET" } });
    return new Response(JSON.stringify(r.body ?? {}), { status: r.status });
  }) as unknown as typeof fetch;
  const llm = createGemini({ apiKey: "KEY", model: "main-model", ...over, fetchImpl, sleep: async (ms) => void sleeps.push(ms) });
  return { llm, calls, sleeps };
}

test("a good answer is returned from the main model with the key in a header", async () => {
  const { llm, calls, sleeps } = setup([ok("hello")]);
  assert.equal(await llm.generate({ text: "hi" }), "hello");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].model, "main-model");
  assert.equal(calls[0].key, "KEY");
  assert.equal(sleeps.length, 0);
});

test("a photo is sent as base64 inline data", async () => {
  const { llm, calls } = setup([ok("x")]);
  await llm.generate({ text: "what is this", image: { bytes: new Uint8Array([1, 2, 3]), mime: "image/png" } });
  const parts = calls[0].body.contents[0].parts;
  assert.deepEqual(parts[1], { inline_data: { mime_type: "image/png", data: "AQID" } });
});

test("a busy model (503) is retried after 2 s then 5 s, and a later success wins", async () => {
  const { llm, calls, sleeps } = setup([err(503), err(503), ok("fine")]);
  assert.equal(await llm.generate({ text: "hi" }), "fine");
  assert.deepEqual(calls.map((c) => c.model), ["main-model", "main-model", "main-model"]);
  assert.deepEqual(sleeps, [2000, 5000]);
});

test("rate limits (429) and network errors are retried too", async () => {
  const { llm, calls } = setup([err(429), "network", ok("fine")]);
  assert.equal(await llm.generate({ text: "hi" }), "fine");
  assert.equal(calls.length, 3);
});

test("when the main model keeps failing, the fallback model answers", async () => {
  const { llm, calls } = setup([err(503), err(503), err(503), ok("from fallback")]);
  assert.equal(await llm.generate({ text: "hi" }), "from fallback");
  assert.deepEqual(calls.map((c) => c.model), ["main-model", "main-model", "main-model", "fallback-model"]);
});

test("a model that no longer exists (404) skips straight to the fallback", async () => {
  const { llm, calls, sleeps } = setup([err(404), ok("from fallback")]);
  assert.equal(await llm.generate({ text: "hi" }), "from fallback");
  assert.deepEqual(calls.map((c) => c.model), ["main-model", "fallback-model"]);
  assert.equal(sleeps.length, 0);
});

test("a bad key or request (400/401/403) fails at once, with no retry and no fallback", async () => {
  for (const status of [400, 401, 403]) {
    const { llm, calls } = setup([err(status, "API key not valid")]);
    await assert.rejects(llm.generate({ text: "hi" }), (e: LlmError) => e.status === status);
    assert.equal(calls.length, 1, `status ${status}`);
  }
});

test("when everything fails, the last error is thrown after 3 + 2 tries", async () => {
  const { llm, calls } = setup([err(503, "overloaded")]);
  await assert.rejects(llm.generate({ text: "hi" }), (e: LlmError) => e.status === 503 && /overloaded/.test(e.message));
  assert.equal(calls.length, 5);
});

test("without a fallback model there are only the 3 tries", async () => {
  const { llm, calls } = setup([err(503)], { fallbackModel: undefined });
  await assert.rejects(llm.generate({ text: "hi" }));
  assert.equal(calls.length, 3);
});

test("an empty or blocked answer is an error and is not retried", async () => {
  const { llm, calls } = setup([{ status: 200, body: { candidates: [{ content: { parts: [] } }] } }]);
  await assert.rejects(llm.generate({ text: "hi" }), /empty response/);
  assert.equal(calls.length, 1);
});

test("a network failure message names the cause but never the key", async () => {
  const { llm } = setup(["network"]);
  await assert.rejects(llm.generate({ text: "hi" }), (e: Error) => /ECONNRESET/.test(e.message) && !/KEY/.test(e.message));
});

test("getLlm: no key means not configured; an unknown provider is refused; defaults are the tested models", () => {
  assert.equal(getLlm({}), null);
  assert.equal(getLlm({ LLM_API_KEY: "  " }), null);
  assert.throws(() => getLlm({ LLM_API_KEY: "k", LLM_PROVIDER: "openai" }), /Unsupported LLM_PROVIDER/);
  assert.ok(getLlm({ LLM_API_KEY: "k" }));
});
