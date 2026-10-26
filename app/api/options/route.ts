// GET /api/options (docs/api-contract.md): the allergen and category choices.
import { allergenOptions, categoryOptions } from "@/data/options";

export async function GET() {
  return Response.json({ allergens: allergenOptions, categories: categoryOptions });
}
