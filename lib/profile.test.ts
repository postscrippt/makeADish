import test from "node:test";
import assert from "node:assert/strict";
import { handleProfileGet, handleProfilePut, readAnonId, validateProfile, type ProfileStore, type SavedProfile } from "./profile.ts";

const ID = "3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b";

function fakeStore(initial: Record<string, SavedProfile> = {}, failWith?: string) {
  const rows = new Map(Object.entries(initial));
  const store: ProfileStore = {
    async getOrCreate(id, defaults) {
      if (failWith) throw new Error(failWith);
      if (!rows.has(id)) rows.set(id, defaults);
      return rows.get(id)!;
    },
    async save(id, p) {
      if (failWith) throw new Error(failWith);
      rows.set(id, p);
    },
  };
  return { store, rows };
}

const req = (method: string, headers: Record<string, string> = {}, body?: unknown) =>
  new Request("http://localhost/api/profile", { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
const as = (id = ID) => ({ "x-anon-id": id });

test("readAnonId accepts a uuid in any case and rejects anything else", () => {
  assert.equal(readAnonId(req("GET", as(ID.toUpperCase()))), ID);
  for (const bad of ["", "abc", "1; drop table users", ID + "x"]) assert.equal(readAnonId(req("GET", { "x-anon-id": bad })), null, bad);
  assert.equal(readAnonId(req("GET")), null);
});

test("GET creates a new user with the defaults and returns them with the anon id", async () => {
  const { store, rows } = fakeStore();
  const res = await handleProfileGet(req("GET", as()), store);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { anonId: ID, allergies: [], spice: 1 });
  assert.ok(rows.has(ID), "the row is created");
});

test("GET returns the saved profile and does not overwrite it", async () => {
  const { store } = fakeStore({ [ID]: { allergies: ["peanut"], spice: 3 } });
  const body = await (await handleProfileGet(req("GET", as()), store)).json();
  assert.deepEqual(body, { anonId: ID, allergies: ["peanut"], spice: 3 });
});

test("without a valid x-anon-id both methods answer 400 and touch nothing", async () => {
  const { store, rows } = fakeStore();
  assert.equal((await handleProfileGet(req("GET"), store)).status, 400);
  assert.equal((await handleProfilePut(req("PUT", { "x-anon-id": "nope" }, { allergies: [], spice: 1 }), store)).status, 400);
  assert.equal(rows.size, 0);
});

test("PUT saves the profile, sorted and without duplicates, and answers 204", async () => {
  const { store, rows } = fakeStore();
  const res = await handleProfilePut(req("PUT", as(), { allergies: ["soy", "egg", "soy"], spice: 2 }), store);
  assert.equal(res.status, 204);
  assert.deepEqual(rows.get(ID), { allergies: ["egg", "soy"], spice: 2 });
});

test("PUT can clear the allergies", async () => {
  const { store, rows } = fakeStore({ [ID]: { allergies: ["egg"], spice: 1 } });
  assert.equal((await handleProfilePut(req("PUT", as(), { allergies: [], spice: 1 }), store)).status, 204);
  assert.deepEqual(rows.get(ID)!.allergies, []);
});

test("validation: unknown allergen, bad spice and wrong shapes are refused and nothing is saved", async () => {
  const { store, rows } = fakeStore();
  const bad: unknown[] = [
    { allergies: ["gluten"], spice: 1 },
    { allergies: ["egg"], spice: 4 },
    { allergies: ["egg"], spice: "1" },
    { allergies: ["egg"], spice: 1.5 },
    { allergies: "egg", spice: 1 },
    { allergies: [1], spice: 1 },
    { spice: 1 },
    [],
    null,
  ];
  for (const b of bad) assert.equal((await handleProfilePut(req("PUT", as(), b), store)).status, 400, JSON.stringify(b));
  assert.equal(rows.size, 0);
});

test("a body that names a different anonId is refused", async () => {
  const { store, rows } = fakeStore();
  const res = await handleProfilePut(req("PUT", as(), { anonId: "11111111-1111-4111-8111-111111111111", allergies: [], spice: 1 }), store);
  assert.equal(res.status, 400);
  assert.equal(rows.size, 0);
});

test("a body with the same anonId is fine, as the client sends the whole Profile", async () => {
  const { store } = fakeStore();
  assert.equal((await handleProfilePut(req("PUT", as(), { anonId: ID, allergies: ["milk"], spice: 0 }), store)).status, 204);
});

test("a body that is not JSON is 400", async () => {
  const { store } = fakeStore();
  const res = await handleProfilePut(new Request("http://x", { method: "PUT", headers: as(), body: "{nope" }), store);
  assert.equal(res.status, 400);
});

test("no database settings is 503; a database failure is 500 and never leaks its message", async () => {
  assert.equal((await handleProfileGet(req("GET", as()), null)).status, 503);
  assert.equal((await handleProfilePut(req("PUT", as(), { allergies: [], spice: 1 }), null)).status, 503);
  const { store } = fakeStore({}, "connection string postgres://secret");
  for (const res of [await handleProfileGet(req("GET", as()), store), await handleProfilePut(req("PUT", as(), { allergies: [], spice: 1 }), store)]) {
    assert.equal(res.status, 500);
    assert.doesNotMatch(JSON.stringify(await res.json()), /secret/);
  }
});

test("validateProfile accepts every allergen the app offers", () => {
  const all = ["shellfish", "fish", "peanut", "tree_nut", "egg", "milk", "soy", "wheat", "sesame"];
  assert.deepEqual(validateProfile({ allergies: all, spice: 0 }), { ok: true, profile: { allergies: [...all].sort(), spice: 0 } });
});
