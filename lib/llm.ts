// The single place the app talks to an LLM (CLAUDE.md: all LLM calls go through lib/, provider set by LLM_PROVIDER).
// Free tiers are busy and rate limited (see README, "LLM provider and limits"), so calls retry with a short backoff
// and then fall back to a second model. Errors carry a status and a short provider message, never the key or the prompt.

export type LlmInput = { text: string; image?: { bytes: Uint8Array; mime: string } };
export type Llm = { generate(input: LlmInput): Promise<string> };

export class LlmError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "LlmError";
    this.status = status;
  }
}

export type GeminiConfig = {
  apiKey: string;
  model: string;
  fallbackModel?: string;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  timeoutMs?: number;
};

const BASE = "https://generativelanguage.googleapis.com/v1beta";
const PRIMARY_DELAYS_MS = [2000, 5000]; // 3 tries on the main model
const FALLBACK_DELAYS_MS = [2000]; // 2 tries on the fallback

// 429, 5xx and network errors are worth another try; a 404 means this model is gone, so move on to the fallback.
const retryable = (status?: number) => status === undefined || status === 429 || status >= 500;

export function createGemini(config: GeminiConfig): Llm {
  const fetchImpl = config.fetchImpl ?? fetch;
  const sleep = config.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));

  async function callOnce(model: string, input: LlmInput): Promise<string> {
    const parts: Record<string, unknown>[] = [{ text: input.text }];
    if (input.image) parts.push({ inline_data: { mime_type: input.image.mime, data: Buffer.from(input.image.bytes).toString("base64") } });
    let res: Response;
    try {
      res = await fetchImpl(`${BASE}/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": config.apiKey },
        body: JSON.stringify({ contents: [{ parts }] }),
        signal: AbortSignal.timeout(config.timeoutMs ?? 30_000),
      });
    } catch (e) {
      const cause = (e as { cause?: { code?: string } }).cause?.code ?? (e as Error).name;
      throw new LlmError(`network error (${cause})`);
    }
    const json = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    if (!res.ok) throw new LlmError(`HTTP ${res.status}: ${(json.error?.message ?? res.statusText).slice(0, 200)}`, res.status);
    const text = (json.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("").trim();
    if (!text) throw new LlmError("empty response", 200); // blocked or no answer: a retry will not help
    return text;
  }

  return {
    async generate(input) {
      const plan: [string, number[]][] = [[config.model, PRIMARY_DELAYS_MS]];
      if (config.fallbackModel && config.fallbackModel !== config.model) plan.push([config.fallbackModel, FALLBACK_DELAYS_MS]);

      let last: LlmError | undefined;
      for (const [model, delays] of plan) {
        for (let attempt = 0; ; attempt++) {
          try {
            return await callOnce(model, input);
          } catch (e) {
            last = e as LlmError;
            // 400/401/403 and empty answers are about the request or the key, so the fallback would fail the same way.
            if (last.status !== undefined && last.status !== 404 && !retryable(last.status)) throw last;
            if (last.status === 404 || attempt >= delays.length) break; // next model
            await sleep(delays[attempt]);
          }
        }
      }
      throw last ?? new LlmError("no model configured");
    },
  };
}

// Reads the environment. Returns null when no key is set, so callers can answer "not configured" instead of crashing.
export function getLlm(env: Record<string, string | undefined>, fetchImpl?: typeof fetch): Llm | null {
  const apiKey = env.LLM_API_KEY?.trim();
  if (!apiKey) return null;
  const provider = (env.LLM_PROVIDER ?? "gemini").trim().toLowerCase();
  if (provider !== "gemini") throw new Error(`Unsupported LLM_PROVIDER "${provider}" (only "gemini" is implemented)`);
  return createGemini({
    apiKey,
    model: env.LLM_MODEL?.trim() || "gemini-3.5-flash-lite",
    fallbackModel: env.LLM_FALLBACK_MODEL?.trim() || "gemini-3.8-flash",
    fetchImpl,
  });
}
