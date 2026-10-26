// POST /api/line/webhook: receives events from the LINE Messaging API (docs/api-contract.md, docs/line-chat-flow.md).
// Server-only. It reads the channel secret and access token, so nothing here may be imported by client code.
import { createLineClient } from "@/lib/line/client";
import { handleEvent, type Deps, type LineEvent } from "@/lib/line/handler";
import { verifySignature } from "@/lib/line/signature";
import { standInGetProfile, standInScan, standInSearch } from "@/lib/line/standins";
import { allergens, ingredients } from "@/mocks/data";
import { LIFF_ID } from "@/app/liff";

const APP_URL = process.env.APP_URL ?? "https://ai-menu-five.vercel.app";

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

  // Stand-ins until Task 2: swap these three for the real scan, search and profile lookup.
  const deps: Deps = {
    client: createLineClient(token),
    scan: standInScan,
    search: standInSearch,
    getProfile: standInGetProfile,
    allergens,
    knownIngredientIds: new Set(ingredients.map((x) => x.id)),
    url: pageUrl,
  };

  const results = await Promise.allSettled(events.map((e) => handleEvent(e, deps)));
  for (const r of results) {
    if (r.status === "rejected") console.error("LINE event failed:", r.reason instanceof Error ? r.reason.message : "unknown error");
  }
  return new Response(null, { status: 200 });
}
