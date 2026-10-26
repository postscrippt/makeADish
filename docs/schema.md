# Database schema

Postgres on the Supabase free tier, with pgvector. The SQL lives in `supabase/migrations/0001_init.sql`; this page explains it.

## Tables

| Table | Purpose |
|---|---|
| `allergens` | Fixed list of allergens, id is a slug (`peanut`, `shellfish`, ...) |
| `ingredients` | Canonical ingredient list: Thai name, English name, `aliases` array, `allergen_status` (`unknown` or `tagged`, added in `0003`) |
| `ingredient_allergens` | Which allergens an ingredient contains. The rule-based tagging source |
| `recipes` | Recipe text, steps (jsonb), spice level 0-3, base servings, `cook_minutes` (added in `0002`), embedding, `allergen_status` |
| `recipe_ingredients` | Links a recipe to canonical ingredient ids, with quantity as display text |
| `recipe_allergens` | Allergens per recipe, derived from its ingredients plus manual or LLM additions |
| `users` | Anonymous UUID now, nullable `line_user_id` for later. Saved allergies and spice level |
| `substitutes` | Swap options for a missing ingredient (added in `0003`): one row per option, with the option's ingredient slugs |
| `history` | Cooked dishes: rating (1-5), timestamp |
| `favorites` | A user's favorite recipes (added in `0002`), independent of cooking |

## Rules the schema enforces or supports

- **Ingredient matching uses ids only.** Scan output and recipe ingredients both map to `ingredients.id`. Aliases (for example หมู and หมูสับ) live in `ingredients.aliases`. No unit conversion; `quantity_text` is display text such as "2 tbsp".
- **Unknown allergen data is excluded.** `recipes.allergen_status` is `unknown`, `tagged` or `verified`. Search must only return `tagged` or `verified` recipes, and must exclude any recipe with a row in `recipe_allergens` for one of the user's allergies.
- **Servings** are stored as `base_servings` and shown as written ("สำหรับ N ที่"). There is no scaling, and users have no saved servings.
- **Swaps** use the same unknown rule as recipes. An option's allergens are the union of `ingredient_allergens` for its ingredients. If any of those ingredients has `allergen_status = 'unknown'`, the option is unknown and is never shown.
- **Spice level** is 0-3 on both recipes and the user profile.
- **Embeddings** are `vector(768)`. If the embedding model changes size, change the column and re-embed.

## Allergen tagging

The rules are in `data/allergen-rules.ts`, one entry per ingredient in `data/ingredients.ts`:
- a list of allergens means tagged (an empty list means no allergens),
- `null` means unknown: contents depend on the brand or recipe.

A recipe's allergens are the union of its ingredients' allergens (`lib/allergens.ts`). One unknown ingredient makes the whole recipe unknown (`allergen_status = 'unknown'`), and unknown recipes are never shown. A recipe must list **every** ingredient that carries an allergen, including pastes and sauces used in the steps; the rules cannot see what the ingredient list leaves out. An LLM tagger, if used, is only a second check and can add allergens but never remove them.

To change a rule: edit `data/allergen-rules.ts`, run `node scripts/build-allergen-sql.mjs`, and run the new `supabase/seed/ingredient-allergens.sql` in the Supabase SQL editor (after `supabase/seed/ingredients.sql`).

## Loading recipes

`data/recipes/batch-N.md` is the source, and the batches are listed in `data/recipes/batches.ts` (batch 0 is the original mock dishes, batch 1 the first draft, batch 2 simple dishes with few main ingredients). `node scripts/build-recipes-sql.mjs` checks every dish and writes `supabase/seed/recipes-batch-N.sql` for each batch. Each batch has its own `source` tag (`own:batch-0`, `own:batch-1`, `own:batch-2`), so running one batch never touches another's dishes. The check stops the build if a dish uses an ingredient id that is not in the table, has a bad category or spice level, or if the allergens written in the file differ from what the ingredient rules derive. Run the SQL in the Supabase SQL editor after the migrations and both ingredient seed files.

The SQL finds each dish by `source` and Thai title and updates it in place, so re-running it keeps recipe ids and anything pointing at them (history, favorites). Dishes from batch 1 have `source = 'own:batch-1'`. To take the draft dishes out again: `delete from recipes where source = 'own:batch-1';` (this fails if someone already has one in history, which is intended).

**Batch 1 is loaded for testing and has not been reviewed by a Thai speaker.** Do not treat it as final.

After running all three batches, check (the SQL silently skips an ingredient id that is missing from `ingredients`, so the counts matter): `select count(*) from recipes;` should be 31, `select count(*) from recipe_ingredients;` should be 205, and `select count(*) from recipe_allergens;` should be 69. Per batch: batch 0 has 9 dishes, 39 ingredient rows and 17 allergen rows; batch 1 has 10, 80 and 30; batch 2 has 12, 86 and 22.

Left out of batch 0 on purpose: หมูทอดกระเทียม. The mock has only pork and garlic and marks its allergens unknown; complete the marinade first, then add it back.

## Access

Row level security is on for every table with no policies, so the public anon key reads nothing. The server uses the service key (`SUPABASE_SERVICE_KEY`) and never exposes it to the browser.

## Setup

1. Create a free project at supabase.com.
2. Open the SQL editor and run the files in `supabase/migrations/` in order: `0001_init.sql`, `0002_cook_minutes_favorites.sql`, then `0003_drop_servings_add_substitutes.sql`.
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
