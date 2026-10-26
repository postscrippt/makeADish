// LINE (LIFF) features for pages opened inside LINE: send a card into the chat, share, close back to the chat.
// Everything is a no-op outside LINE or when NEXT_PUBLIC_LIFF_ID is unset, so the web app works as before.
import type { Liff } from "@line/liff";

export type ChatMessage = Parameters<Liff["sendMessages"]>[0][number];

export const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID ?? "";

// Opens a page through LINE so it runs as the LIFF app (needed for "send to chat" on the reopened page).
export const liffUrl = (path: string) => (LIFF_ID ? `https://liff.line.me/${LIFF_ID}${path}` : path);

let ready: Promise<Liff | null> | null = null;

// The SDK is loaded only on demand, so pages outside LINE don't download it.
export function getLiff(): Promise<Liff | null> {
  if (!LIFF_ID || typeof window === "undefined") return Promise.resolve(null);
  ready ??= import("@line/liff")
    .then(async ({ default: liff }) => {
      await liff.init({ liffId: LIFF_ID });
      return liff;
    })
    .catch(() => null);
  return ready;
}

export async function canSendToChat(): Promise<boolean> {
  const liff = await getLiff();
  if (!liff?.isInClient()) return false;
  const type = liff.getContext()?.type;
  return type === "utou" || type === "group" || type === "room";
}

export async function canShare(): Promise<boolean> {
  const liff = await getLiff();
  return !!liff?.isLoggedIn() && liff.isApiAvailable("shareTargetPicker");
}

// Posts as the user into the chat the page was opened from.
export async function sendToChat(messages: ChatMessage[]): Promise<void> {
  const liff = await getLiff();
  if (!liff) throw new Error("not in LINE");
  await liff.sendMessages(messages);
}

// Returns false if the user closed the picker without sending.
export async function shareToFriends(messages: ChatMessage[]): Promise<boolean> {
  const liff = await getLiff();
  if (!liff) throw new Error("not in LINE");
  return !!(await liff.shareTargetPicker(messages));
}

export async function closeToChat(): Promise<void> {
  const liff = await getLiff();
  if (liff?.isInClient()) liff.closeWindow();
}

export async function inLineApp(): Promise<boolean> {
  return !!(await getLiff())?.isInClient();
}
