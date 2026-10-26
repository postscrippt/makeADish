// POST /api/line/webhook: receives events from the LINE Messaging API (docs/api-contract.md, docs/line-chat-flow.md).
// Server-only. It reads the channel secret and access token, so nothing here may be imported by client code.
import { after } from "next/server";
import { createLineClient } from "@/lib/line/client";
import { handleEvent, type Deps, type LineEvent } from "@/lib/line/handler";
import { verifySignature } from "@/lib/line/signature";
import { standInGetProfile, standInScan, standInSearch } from "@/lib/line/standins";
import { buildIndex } from "@/lib/ingredients";
import { getDb } from "@/lib/db";
import { getLlm } from "@/lib/llm";
import { lineProfileLookup } from "@/lib/profile";
import { createProfileStore } from "@/lib/profileStore";
import { scanPhoto } from "@/lib/scan";
import { ingredients } from "@/data/ingredients";
import { allergenOptions } from "@/data/options";
import { LIFF_ID } from "@/app/liff";

const APP_URL = process.env.APP_URL ?? "https://ai-menu-five.vercel.app";
const index = buildIndex(ingredients);

// Buttons in a chat need absolute links. Open pages through LIFF when it is set up, so "send to chat" works there.
const pageUrl = (path: string) => (LIFF_ID ? `https://liff.line.me/${LIFF_ID}${path}` : `${APP_URL}${path}`);

const error = (status: number, code: string, message: string) => Response.json({ error: { code, message } }, { status });

export async function POST(request: Request) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!secret || !token) return error(500, "server_error", "LINE is not configured");

  // The signature covers the raw text, so read it before any JSON parsing.
  const raw = await request.text();
  if (!verifySignature(raw, request.headers.get("x-line-signature"), secret)) {
    return error(401, "unauthorized", "Invalid signature");
  }

  let events: LineEvent[];
  try {
    events = (JSON.parse(raw) as { events?: LineEvent[] }).events ?? [];
  } catch {
    return error(400, "bad_request", "Body is not JSON");
  }

  // The real scan runs when an LLM key is set; without one the chat keeps working on the fixed stand-in.
  // Search and profile are still stand-ins until the database layer lands.
  const llm = getLlm(process.env);
  const db = getDb();
  const deps: Deps = {
    client: createLineClient(token),
    scan: llm ? (photo) => scanPhoto(photo, { llm, index, entries: ingredients }) : standInScan,
    search: standInSearch,
    // The saved profile of the person who linked their LINE account; defaults for anyone who has not.
    getProfile: db ? lineProfileLookup(createProfileStore(db)) : standInGetProfile,
    allergens: allergenOptions,
    knownIngredientIds: new Set(ingredients.map((x) => x.slug)),
    url: pageUrl,
  };

  // Answer LINE at once and do the work afterwards: a real scan can take many seconds.
  after(async () => {
    const results = await Promise.allSettled(events.map((e) => handleEvent(e, deps)));
    for (const r of results) {
      if (r.status === "rejected") console.error("LINE event failed:", r.reason instanceof Error ? r.reason.message : "unknown error");
    }
  });
  return new Response(null, { status: 200 });
}
