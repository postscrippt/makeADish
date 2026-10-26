// GET /api/recipes (docs/api-contract.md): the catalog for the Menus page.
import { handleRecipeList } from "@/lib/recipeApi";
import { recipeDeps } from "@/lib/serverDeps";

export async function GET(request: Request) {
  return handleRecipeList(request, recipeDeps());
}
