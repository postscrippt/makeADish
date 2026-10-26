// POST /api/recommend (docs/api-contract.md). The rules are in lib/recipeApi.ts and lib/match.ts.
import { handleRecommend } from "@/lib/recipeApi";
import { recipeDeps } from "@/lib/serverDeps";

export async function POST(request: Request) {
  return handleRecommend(request, recipeDeps());
}
