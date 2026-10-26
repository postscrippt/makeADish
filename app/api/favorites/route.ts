// GET /api/favorites (docs/api-contract.md).
import { handleFavoritesGet } from "@/lib/userDataApi";
import { userDataDeps } from "@/lib/serverDeps";

export async function GET(request: Request) {
  return handleFavoritesGet(request, userDataDeps());
}
