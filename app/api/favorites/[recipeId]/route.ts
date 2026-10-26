// PUT /api/favorites/:recipeId (docs/api-contract.md). Body: { "favorite": true | false }.
import { handleFavoritePut } from "@/lib/userDataApi";
import { userDataDeps } from "@/lib/serverDeps";

export async function PUT(request: Request, ctx: { params: Promise<{ recipeId: string }> }) {
  const { recipeId } = await ctx.params;
  return handleFavoritePut(request, recipeId, userDataDeps());
}
