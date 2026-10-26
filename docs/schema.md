# Database schema

Postgres on the Supabase free tier, with pgvector. The SQL lives in `supabase/migrations/0001_init.sql`; this page explains it.

## Tables

| Table | Purpose |
|---|---|
| `allergens` | Fixed list of allergens, id is a slug (`peanut`, `shellfish`, ...) |
| `ingredients` | Canonical ingredient list: Thai name, English name, `aliases` array |
| `ingredient_allergens` | Which allergens an ingredient contains. The rule-based tagging source |
| `recipes` | Recipe text, steps (jsonb), spice level 0-3, base servings, embedding, `allergen_status` |
| `recipe_ingredients` | Links a recipe to canonical ingredient ids, with quantity as display text |
| `recipe_allergens` | Allergens per recipe, derived from its ingredients plus manual or LLM additions |
| `users` | Anonymous UUID now, nullable `line_user_id` for later. Saved allergies, spice level, servings |
| `history` | Cooked dishes: rating (1-5), favorite flag, timestamp |

## Rules the schema enforces or supports

- **Ingredient matching uses ids only.** Scan output and recipe ingredients both map to `ingredients.id`. Aliases (for example หมู and หมูสับ) live in `ingredients.aliases`. No unit conversion; `quantity_text` is display text such as "2 tbsp".
- **Unknown allergen data is excluded.** `recipes.allergen_status` is `unknown`, `tagged` or `verified`. Search must only return `tagged` or `verified` recipes, and must exclude any recipe with a row in `recipe_allergens` for one of the user's allergies.
- **Servings** are stored as `base_servings`. The UI scales displayed quantities; matching ignores servings.
- **Spice level** is 0-3 on both recipes and the user profile.
- **Embeddings** are `vector(768)`. If the embedding model changes size, change the column and re-embed.

## Access

Row level security is on for every table with no policies, so the public anon key reads nothing. The server uses the service key (`SUPABASE_SERVICE_KEY`) and never exposes it to the browser.

## Setup

1. Create a free project at supabase.com.
2. Open the SQL editor and run `supabase/migrations/0001_init.sql`.
3. Copy the project URL and keys into `.env.local` (see `.env.example` once added).

## Allergen filter shape

```sql
select r.id
from recipes r
where r.allergen_status in ('tagged', 'verified')
  and not exists (
    select 1 from recipe_allergens ra
    where ra.recipe_id = r.id
      and ra.allergen_id = any (:user_allergen_ids)
  );
```

This runs inside the search query, so the LLM cannot override it.
