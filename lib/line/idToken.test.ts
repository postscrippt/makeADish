import test from "node:test";
import assert from "node:assert/strict";
import { createLineLogin, LineVerifyError } from "./idToken.ts";

const good = { iss: "https://access.line.me", sub: "U1234", aud: "999" };

function setup(reply: { status: number; body?: unknown } | "network") {
  const calls: { url: string; body: URLSearchParams }[] = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    calls.push({ url: String(url), body: init.body as URLSearchParams });
    if (reply === "network") throw Object.assign(new TypeError("fetch failed"), { cause: { code: "ECONNRESET" } });
    return new Response(JSON.stringify(reply.body ?? {}), { status: reply.status });
  }) as unknown as typeof fetch;
  return { verify: createLineLogin("999", fetchImpl), calls };
}

test("a valid token gives the LINE user id, and the token and channel id are sent to LINE as a form", async () => {
  const { verify, calls } = setup({ status: 200, body: good });
  assert.equal(await verify("TOKEN"), "U1234");
  assert.equal(calls[0].url, "https://api.line.me/oauth2/v2.1/verify");
  assert.equal(calls[0].body.get("id_token"), "TOKEN");
  assert.equal(calls[0].body.get("client_id"), "999");
});

test("an invalid or expired token (400) is null, not an error", async () => {
  assert.equal(await setup({ status: 400, body: { error: "invalid_request" } }).verify("x"), null);
});

test("a token for a different channel or issuer is refused even if LINE answered 200", async () => {
  assert.equal(await setup({ status: 200, body: { ...good, aud: "123" } }).verify("x"), null);
  assert.equal(await setup({ status: 200, body: { ...good, iss: "https://evil.example" } }).verify("x"), null);
});

test("a reply without a user id is refused", async () => {
  assert.equal(await setup({ status: 200, body: { iss: good.iss, aud: good.aud } }).verify("x"), null);
  assert.equal(await setup({ status: 200, body: { ...good, sub: "" } }).verify("x"), null);
});

test("a LINE outage is an error, so it is not mistaken for a bad token", async () => {
  await assert.rejects(setup({ status: 503 }).verify("x"), LineVerifyError);
  await assert.rejects(setup("network").verify("x"), (e: Error) => e instanceof LineVerifyError && /ECONNRESET/.test(e.message));
});

test("errors never contain the token", async () => {
  await assert.rejects(setup({ status: 500 }).verify("SECRET-TOKEN"), (e: Error) => !/SECRET-TOKEN/.test(e.message));
});
