// POST /api/scan (docs/api-contract.md). The logic is in lib/scan.ts so it can be tested without a server.
// Server-only: it reads LLM_API_KEY. The photo is processed in memory and never stored.
import { handleScanRequest } from "@/lib/scan";
import { buildIndex } from "@/lib/ingredients";
import { getLlm } from "@/lib/llm";
import { ingredients } from "@/data/ingredients";

const index = buildIndex(ingredients);

export async function POST(request: Request) {
  return handleScanRequest(request, { llm: getLlm(process.env), index, entries: ingredients });
}
