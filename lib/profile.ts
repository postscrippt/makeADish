// GET and PUT /api/profile (docs/api-contract.md). The saved allergies and spice level of one user.
// Storage sits behind ProfileStore so the rules here can be tested without a database.
import type { Profile, SpiceLevel } from "../types/api.ts";
import { allergenOptions } from "../data/options.ts";
import type { LineLogin } from "./line/idToken.ts";

export type SavedProfile = { allergies: string[]; spice: SpiceLevel };

export type ProfileStore = {
  // Creates the user with defaults if new, and returns the saved profile.
  getOrCreate(anonId: string, defaults: SavedProfile): Promise<SavedProfile>;
  save(anonId: string, profile: SavedProfile): Promise<void>;
  // Makes this user the owner of a verified LINE user id. If the id was linked to another user (a new phone or
  // browser), the link moves here: the most recent save is the one the chat should follow.
  linkLine(anonId: string, lineUserId: string): Promise<void>;
  findByLineUserId(lineUserId: string): Promise<SavedProfile | null>;
};

export const DEFAULT_PROFILE: SavedProfile = { allergies: [], spice: 1 };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLERGEN_IDS = new Set(allergenOptions.map((a) => a.id));

export const error = (status: number, code: string, message: string) => Response.json({ error: { code, message } }, { status });

// The anonymous id is the only identity (contract: "Who is calling"). It must be a uuid because it is the users.id key.
export function readAnonId(request: Request): string | null {
  const id = request.headers.get("x-anon-id")?.trim().toLowerCase() ?? "";
  return UUID.test(id) ? id : null;
}

// Returns the cleaned profile, or the reason it was refused.
export function validateProfile(body: unknown): { ok: true; profile: SavedProfile } | { ok: false; message: string } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return { ok: false, message: "Body must be a Profile object" };
  const { allergies, spice } = body as Record<string, unknown>;
  if (!Array.isArray(allergies) || !allergies.every((a) => typeof a === "string")) return { ok: false, message: "allergies must be a list of allergen ids" };
  const unknown = allergies.filter((a) => !ALLERGEN_IDS.has(a));
  if (unknown.length) return { ok: false, message: `Unknown allergen id: ${unknown.slice(0, 3).join(", ")}` };
  if (spice !== 0 && spice !== 1 && spice !== 2 && spice !== 3) return { ok: false, message: "spice must be 0, 1, 2 or 3" };
  return { ok: true, profile: { allergies: [...new Set(allergies as string[])].sort(), spice } };
}

const fail = (e: unknown) => {
  console.error("profile store failed:", e instanceof Error ? e.message : "unknown error");
  return error(500, "server_error", "Could not reach the database");
};

// For the LINE chat. A person who has not linked a profile gets the defaults (the chat says it has no allergies on
// file). A database failure is thrown, not turned into defaults: the chat then sends no results, which is safer
// than results that ignore someone's allergies.
export function lineProfileLookup(store: ProfileStore) {
  return async (lineUserId: string | undefined): Promise<SavedProfile> => {
    if (!lineUserId) return DEFAULT_PROFILE;
    return (await store.findByLineUserId(lineUserId)) ?? DEFAULT_PROFILE;
  };
}

export async function handleProfileGet(request: Request, store: ProfileStore | null): Promise<Response> {
  const anonId = readAnonId(request);
  if (!anonId) return error(400, "bad_request", "Missing or invalid x-anon-id header");
  if (!store) return error(503, "unavailable", "The database is not configured");
  try {
    const saved = await store.getOrCreate(anonId, DEFAULT_PROFILE);
    const profile: Profile = { anonId, allergies: saved.allergies, spice: saved.spice };
    return Response.json(profile);
  } catch (e) {
    return fail(e);
  }
}

// Inside LINE the page also sends `x-line-id-token` (the LIFF ID token). When present it is verified with LINE and the
// verified LINE user id is linked to this user, so the chat can find the saved allergies. A bad token saves nothing.
export async function handleProfilePut(request: Request, store: ProfileStore | null, lineLogin: LineLogin | null = null): Promise<Response> {
  const anonId = readAnonId(request);
  if (!anonId) return error(400, "bad_request", "Missing or invalid x-anon-id header");
  if (!store) return error(503, "unavailable", "The database is not configured");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error(400, "bad_request", "Body is not JSON");
  }
  // The header says who is calling. A body that names someone else is a mistake or an attack, so refuse it.
  const bodyId = (body as { anonId?: unknown } | null)?.anonId;
  if (typeof bodyId === "string" && bodyId.toLowerCase() !== anonId) return error(400, "bad_request", "anonId does not match x-anon-id");

  const checked = validateProfile(body);
  if (!checked.ok) return error(400, "bad_request", checked.message);

  let lineUserId: string | null = null;
  const token = request.headers.get("x-line-id-token")?.trim();
  if (token) {
    // Refuse loudly: the user would think the chat knows their allergies when it does not.
    if (!lineLogin) return error(503, "unavailable", "LINE login is not configured on the server");
    try {
      lineUserId = await lineLogin(token);
    } catch (e) {
      console.error("LINE token check failed:", e instanceof Error ? e.message : "unknown error");
      return error(503, "unavailable", "Could not check the LINE login, try again");
    }
    if (!lineUserId) return error(401, "unauthorized", "The LINE login is invalid or expired");
  }

  try {
    await store.save(anonId, checked.profile);
    if (lineUserId) await store.linkLine(anonId, lineUserId);
    return new Response(null, { status: 204 });
  } catch (e) {
    return fail(e);
  }
}
