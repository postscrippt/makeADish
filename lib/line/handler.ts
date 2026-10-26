// What the bot does for each LINE event (docs/line-chat-flow.md, "What Person B builds").
// Everything it needs from outside comes in through `deps`, so the scan, search and profile can be swapped
// from stand-ins to the real ones without touching this file, and tests can run without any network.
import { confirmCard, resultsCarousel, scanPrompt } from "../../app/line/cards.ts";
import type { LineClient, LineMessage } from "./client.ts";
import type { Option, ScanResult, SearchRequest, SearchResult, SpiceLevel } from "../../types/api.ts";

export type LineEvent = {
  type: string;
  replyToken?: string;
  source?: { type?: string; userId?: string };
  message?: { type: string; id: string; text?: string };
  postback?: { data: string };
};

export type Deps = {
  client: LineClient;
  scan(photo: { bytes: Uint8Array; mime: string }): Promise<ScanResult>;
  search(req: SearchRequest): Promise<SearchResult>;
  getProfile(lineUserId: string | undefined): Promise<{ allergies: string[]; spice: SpiceLevel }>;
  allergens: Option[]; // id -> Thai name, for the confirm card
  knownIngredientIds: Set<string>; // postback ids are checked against this
  url(path: string): string; // absolute link to a page (LIFF link when configured)
};

export const SCAN_TRIGGER = "สแกนวัตถุดิบ";
const SPICE_LABELS = ["ไม่เผ็ด", "เผ็ดน้อย", "เผ็ดกลาง", "เผ็ดมาก"];
const LOADING_SECONDS = 30; // LINE accepts multiples of 5, up to 60
const MAX_POSTBACK_CHARS = 290; // LINE's limit is 300 for postback data
const REASON_TEXT = {
  no_food: "ไม่เจออาหารในรูปนี้ ลองถ่ายใหม่ให้เห็นวัตถุดิบชัด ๆ นะ",
  blurry: "รูปไม่ชัด ลองถ่ายใหม่อีกครั้งนะ",
  error: "สแกนไม่สำเร็จ ลองใหม่อีกครั้งนะ",
} as const;
const NO_INGREDIENTS_TEXT = "ยังอ่านวัตถุดิบจากรูปนี้ไม่ได้ ลองถ่ายใหม่ หรือพิมพ์วัตถุดิบเองก็ได้นะ";

// Ingredient ids only, never allergies, so nothing sensitive sits in a button or a link.
function searchData(ids: string[]): string {
  let kept = "";
  for (const id of ids) {
    const next = kept ? `${kept},${id}` : id;
    if (`action=search&ids=${next}`.length > MAX_POSTBACK_CHARS) break;
    kept = next;
  }
  return `action=search&ids=${kept}`;
}

export function parseSearchPostback(data: string, known: Set<string>): string[] | null {
  const params = new URLSearchParams(data);
  if (params.get("action") !== "search") return null;
  const ids = (params.get("ids") ?? "").split(",").filter((id) => known.has(id));
  return ids.length > 0 ? [...new Set(ids)] : null;
}

// Quick replies stay on the failure message so the user can retry with one tap.
const retryPrompt = (text: string, deps: Deps): LineMessage => ({ ...scanPrompt(deps.url("/form")), text });

async function onImage(event: LineEvent, deps: Deps): Promise<LineMessage> {
  const userId = event.source?.userId;
  // The loading animation only works in 1:1 chats.
  if (event.source?.type === "user" && userId) await deps.client.startLoading(userId, LOADING_SECONDS);

  let scan: ScanResult;
  try {
    const photo = await deps.client.getContent(event.message!.id);
    scan = await deps.scan(photo); // the bytes go out of scope here; nothing keeps them
  } catch {
    return retryPrompt(REASON_TEXT.error, deps);
  }
  if (!scan.ok) return retryPrompt(REASON_TEXT[scan.reason], deps);
  if (scan.ingredients.length === 0) return retryPrompt(NO_INGREDIENTS_TEXT, deps);

  const profile = await deps.getProfile(userId);
  const ids = scan.ingredients.map((x) => x.id);
  const names = profile.allergies.map((a) => deps.allergens.find((x) => x.id === a)?.th ?? a);
  return confirmCard(
    scan.ingredients,
    { allergyNames: names, spiceLabel: SPICE_LABELS[profile.spice] },
    deps.url(`/form?ids=${ids.join(",")}`),
    searchData(ids),
  );
}

async function onPostback(event: LineEvent, deps: Deps): Promise<LineMessage | null> {
  const ids = parseSearchPostback(event.postback?.data ?? "", deps.knownIngredientIds);
  if (!ids) return null;
  const profile = await deps.getProfile(event.source?.userId);
  // The allergy filter comes from the saved profile, never from anything in the message.
  const result = await deps.search({ ingredientIds: ids, spice: profile.spice, category: null, allergies: profile.allergies });
  const list = ids.join(",");
  return resultsCarousel(
    result,
    (id) => deps.url(`/recipe/${id}?from=results`),
    deps.url(`/results?ids=${list}`),
    deps.url(`/form?ids=${list}`),
  );
}

// Exactly one reply per event: the reply token works once.
export async function handleEvent(event: LineEvent, deps: Deps): Promise<void> {
  if (!event.replyToken) return;
  let message: LineMessage | null = null;

  if (event.type === "message" && event.message?.type === "text") {
    if (event.message.text?.trim() === SCAN_TRIGGER) message = scanPrompt(deps.url("/form"));
  } else if (event.type === "message" && event.message?.type === "image") {
    message = await onImage(event, deps);
  } else if (event.type === "postback") {
    message = await onPostback(event, deps);
  }

  if (message) await deps.client.reply(event.replyToken, [message]);
}
