// The three LINE Messaging API calls the webhook needs. Server-only: it holds the channel access token.
// fetch is injectable so tests never touch the network.
export type LineMessage = Record<string, unknown>;

export type LineClient = {
  reply(replyToken: string, messages: LineMessage[]): Promise<void>;
  startLoading(chatId: string, seconds: number): Promise<void>;
  getContent(messageId: string): Promise<{ bytes: Uint8Array; mime: string }>;
};

const MAX_CONTENT_BYTES = 10 * 1024 * 1024; // safety cap on a photo downloaded from LINE

export function createLineClient(accessToken: string, fetchImpl: typeof fetch = fetch): LineClient {
  const headers = { Authorization: `Bearer ${accessToken}` };

  // Errors carry the status only: never the token, never the message body (it can hold user content).
  const fail = (what: string, res: Response) => new Error(`LINE ${what} failed: HTTP ${res.status}`);

  return {
    async reply(replyToken, messages) {
      const res = await fetchImpl("https://api.line.me/v2/bot/message/reply", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ replyToken, messages }),
      });
      if (!res.ok) throw fail("reply", res);
    },

    // Best effort: the "typing" animation is nice to have, so a failure must not stop the scan.
    async startLoading(chatId, seconds) {
      const res = await fetchImpl("https://api.line.me/v2/bot/chat/loading/start", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, loadingSeconds: seconds }),
      }).catch(() => null);
      void res;
    },

    async getContent(messageId) {
      const res = await fetchImpl(`https://api-data.line.me/v2/bot/message/${encodeURIComponent(messageId)}/content`, { headers });
      if (!res.ok) throw fail("content download", res);
      const bytes = new Uint8Array(await res.arrayBuffer());
      if (bytes.length > MAX_CONTENT_BYTES) throw new Error("LINE content too large");
      return { bytes, mime: res.headers.get("content-type") ?? "image/jpeg" };
    },
  };
}
