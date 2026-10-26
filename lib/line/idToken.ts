// Verifies a LIFF ID token with LINE and returns the verified LINE user id (`sub`).
// This is the only way the server learns a LINE user id from a browser: a bare id sent by the client is never trusted,
// because anyone could then read or change another person's saved allergies.
// https://developers.line.biz/en/reference/line-login/#verify-id-token
const VERIFY_URL = "https://api.line.me/oauth2/v2.1/verify";

export type LineLogin = (idToken: string) => Promise<string | null>;

export class LineVerifyError extends Error {}

// Returns null when LINE says the token is invalid or expired. Throws LineVerifyError when LINE could not be asked,
// so a LINE outage is not mistaken for a bad token.
export function createLineLogin(channelId: string, fetchImpl: typeof fetch = fetch): LineLogin {
  return async (idToken) => {
    let res: Response;
    try {
      res = await fetchImpl(VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ id_token: idToken, client_id: channelId }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (e) {
      throw new LineVerifyError(`LINE verify unreachable (${(e as { cause?: { code?: string } }).cause?.code ?? (e as Error).name})`);
    }
    if (res.status === 400) return null; // invalid, expired or issued for another channel
    if (!res.ok) throw new LineVerifyError(`LINE verify answered HTTP ${res.status}`);
    const json = (await res.json().catch(() => null)) as { sub?: unknown; iss?: unknown; aud?: unknown } | null;
    if (!json || typeof json.sub !== "string" || json.sub === "") return null;
    if (json.iss !== "https://access.line.me" || json.aud !== channelId) return null;
    return json.sub;
  };
}
