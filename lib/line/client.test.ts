import test from "node:test";
import assert from "node:assert/strict";
import { createLineClient } from "./client.ts";

type Call = { url: string; init?: RequestInit };

function fakeFetch(respond: () => Response) {
  const calls: Call[] = [];
  const impl = (async (url: string, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    return respond();
  }) as unknown as typeof fetch;
  return { impl, calls };
}

test("reply posts the token and messages with the bearer token", async () => {
  const { impl, calls } = fakeFetch(() => new Response("{}", { status: 200 }));
  await createLineClient("SECRET-TOKEN", impl).reply("rt", [{ type: "text", text: "hi" }]);
  assert.equal(calls[0].url, "https://api.line.me/v2/bot/message/reply");
  assert.equal((calls[0].init!.headers as Record<string, string>).Authorization, "Bearer SECRET-TOKEN");
  assert.deepEqual(JSON.parse(calls[0].init!.body as string), { replyToken: "rt", messages: [{ type: "text", text: "hi" }] });
});

test("a failed reply throws the status only, never the token", async () => {
  const { impl } = fakeFetch(() => new Response("bad", { status: 400 }));
  await assert.rejects(createLineClient("SECRET-TOKEN", impl).reply("rt", []), (e: Error) => {
    assert.match(e.message, /400/);
    assert.doesNotMatch(e.message, /SECRET-TOKEN/);
    return true;
  });
});

test("the loading animation is best effort: a failure does not throw", async () => {
  const impl = (async () => { throw new Error("network"); }) as unknown as typeof fetch;
  await createLineClient("t", impl).startLoading("U1", 30);
});

test("content download returns the bytes and the mime type", async () => {
  const { impl, calls } = fakeFetch(() => new Response(new Uint8Array([7, 8, 9]), { status: 200, headers: { "content-type": "image/png" } }));
  const got = await createLineClient("t", impl).getContent("123");
  assert.equal(calls[0].url, "https://api-data.line.me/v2/bot/message/123/content");
  assert.deepEqual([...got.bytes], [7, 8, 9]);
  assert.equal(got.mime, "image/png");
});

test("a failed download throws", async () => {
  const { impl } = fakeFetch(() => new Response("", { status: 404 }));
  await assert.rejects(createLineClient("t", impl).getContent("1"), /404/);
});
