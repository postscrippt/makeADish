// GET /api/options (docs/api-contract.md): the allergen and category choices, and the pantry staples.
import { allergenOptions, categoryOptions } from "@/data/options";
import { STAPLES } from "@/data/staples";

export async function GET() {
  return Response.json({ allergens: allergenOptions, categories: categoryOptions, staples: STAPLES });
}
