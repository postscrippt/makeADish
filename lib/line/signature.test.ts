import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { verifySignature } from "./signature.ts";

const secret = "test-channel-secret";
const body = JSON.stringify({ destination: "U1", events: [] });
const sign = (b: string, s = secret) => createHmac("sha256", s).update(b).digest("base64");

test("a valid signature passes", () => {
  assert.equal(verifySignature(body, sign(body), secret), true);
});

test("a signature made with another secret fails", () => {
  assert.equal(verifySignature(body, sign(body, "other-secret"), secret), false);
});

test("a changed body fails", () => {
  assert.equal(verifySignature(body + " ", sign(body), secret), false);
});

test("a missing, empty or garbage signature fails", () => {
  assert.equal(verifySignature(body, null, secret), false);
  assert.equal(verifySignature(body, "", secret), false);
  assert.equal(verifySignature(body, "not-base64!!", secret), false);
});

test("an empty channel secret never passes", () => {
  assert.equal(verifySignature(body, sign(body, ""), ""), false);
});
