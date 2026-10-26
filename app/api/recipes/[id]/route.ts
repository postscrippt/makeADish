// GET /api/recipes/:id (docs/api-contract.md).
import { handleRecipeGet } from "@/lib/recipeApi";
import { recipeDeps } from "@/lib/serverDeps";

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return handleRecipeGet(request, id, recipeDeps());
}
