// GET /api/ingredients (docs/api-contract.md): the canonical list used by the tag editor's search.
import { ingredients } from "@/data/ingredients";
import type { Ingredient } from "@/types/api";

export async function GET() {
  const list: Ingredient[] = ingredients.map((e) => ({ id: e.slug, th: e.th, en: e.en, aliases: e.aliases }));
  return Response.json(list);
}
