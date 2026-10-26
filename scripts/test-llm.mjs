// Checks that the free Gemini tier can do the three jobs the app needs.
// Run from the repo root:
//   node --env-file=.env.local scripts/test-llm.mjs [path/to/photo.jpg]
// Needs Node 20.6+ (for --env-file). Reads LLM_API_KEY; never prints it.

import { readFileSync } from "node:fs";
import { extname } from "node:path";

const KEY = process.env.LLM_API_KEY;
const TEXT_MODEL = process.env.LLM_MODEL ?? "gemini-2.5-flash";
const EMBED_MODEL = process.env.LLM_EMBED_MODEL ?? "gemini-embedding-001";
const EMBED_DIMS = 768; // must match vector(768) in supabase/migrations/0001_init.sql
const BASE = "https://generativelanguage.googleapis.com/v1beta";

if (!KEY) {
  console.error("LLM_API_KEY is empty. Add it to .env.local and run with --env-file=.env.local");
  process.exit(1);
}

const TIMEOUT_MS = 60_000;
const RETRY_DELAYS_MS = [2000, 5000]; // retried on 429, 5xx and network errors

async function callOnce(path, body) {
  const res = await fetch(`${BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": KEY },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message ?? res.statusText;
    const err = new Error(`HTTP ${res.status}: ${msg}`);
    err.retryable = res.status === 429 || res.status >= 500;
    throw err;
  }
  // Rate-limit headers, if the API sends any.
  const limits = [...res.headers].filter(([k]) => /ratelimit|retry/i.test(k));
  return { json, limits };
}

async function call(path, body) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await callOnce(path, body);
    } catch (e) {
      // fetch failures and timeouts have no HTTP status; the real reason is in e.cause.
      const network = e.retryable === undefined;
      if (network) e.message = `${e.message} (${e.cause?.code ?? e.cause?.message ?? e.name})`;
      if (!(network || e.retryable) || attempt >= RETRY_DELAYS_MS.length) throw e;
      console.log(`      retry ${attempt + 1} after: ${e.message}`);
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
    }
  }
}

const textOf = (json) => json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";

const results = [];
async function test(name, fn) {
  const t0 = Date.now();
  try {
    const detail = await fn();
    results.push([name, "PASS", `${Date.now() - t0} ms`]);
    console.log(`PASS  ${name}\n      ${detail}\n`);
  } catch (e) {
    results.push([name, "FAIL", e.message]);
    console.log(`FAIL  ${name}\n      ${e.message}\n`);
  }
}

console.log(`Text/vision model: ${TEXT_MODEL}\nEmbedding model:   ${EMBED_MODEL}\n`);

await test("Thai text", async () => {
  const { json } = await call(`models/${TEXT_MODEL}:generateContent`, {
    contents: [{ parts: [{ text: "แนะนำเมนูไข่ง่ายๆ สำหรับมื้อเย็น 1 เมนู ตอบสั้นๆ เป็นภาษาไทย" }] }],
  });
  const out = textOf(json).trim();
  if (!out) throw new Error("Empty response");
  return out.slice(0, 200).replace(/\s+/g, " ");
});

const photo = process.argv[2];
if (photo) {
  await test("Vision (photo to ingredients)", async () => {
    const mime = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" }[
      extname(photo).toLowerCase()
    ];
    if (!mime) throw new Error("Use a .jpg, .png or .webp photo");
    const data = readFileSync(photo).toString("base64");
    const { json } = await call(`models/${TEXT_MODEL}:generateContent`, {
      contents: [
        {
          parts: [
            { text: "List the food ingredients you can see in this photo as a comma-separated list of Thai names. If there is no food, reply NO_FOOD." },
            { inline_data: { mime_type: mime, data } },
          ],
        },
      ],
    });
    const out = textOf(json).trim();
    if (!out) throw new Error("Empty response");
    return out.slice(0, 300).replace(/\s+/g, " ");
  });
} else {
  console.log("SKIP  Vision test: pass a photo path as the first argument\n");
}

await test(`Embeddings (${EMBED_DIMS} dimensions)`, async () => {
  const { json, limits } = await call(`models/${EMBED_MODEL}:embedContent`, {
    content: { parts: [{ text: "ข้าวผัดกะเพราหมูสับ ไข่ดาว" }] },
    outputDimensionality: EMBED_DIMS,
  });
  const n = json?.embedding?.values?.length ?? 0;
  if (n !== EMBED_DIMS) throw new Error(`Got ${n} dimensions, expected ${EMBED_DIMS}`);
  return `vector length ${n}` + (limits.length ? `; headers: ${limits.map(([k, v]) => `${k}=${v}`).join(", ")}` : "");
});

console.log("Summary");
for (const [name, status, note] of results) console.log(`  ${status}  ${name}  (${note})`);
console.log("\nNow record rate limits and data-use terms from aistudio.google.com (Usage and billing) in the README.");
process.exit(results.some((r) => r[1] === "FAIL") ? 1 : 0);
