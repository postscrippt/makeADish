# Person B backend plan: real endpoints, LINE webhook, data changes

> For Person B (and any agent helping). Agreed with Person A on 2026-10-26. Tasks are ordered; each ends in its own PR into `dev`.

**Goal:** replace the mock data with real Supabase and Gemini endpoints, and make the LINE chat work (camera → confirm card → results carousel), without changing what the pages see.

**Start here:** merge Person A's open PRs into `dev` first, in this order: #42 (`a/ux-flow`), then #43 (`a/line-liff`). Then branch from `dev` (`b/<task>`).

**Read first:**
- `docs/api-contract.md` (#45): **the source of truth for endpoint paths and shapes.** Where this plan and the contract differ, the contract wins.
- `docs/line-chat-flow.md`: which steps happen in the chat and which on a page, and the webhook spec.
- `types/api.ts`: the data shapes. The pages already use them, and `servings` is gone.
- `mocks/api.ts`: every function the pages call, with mock behaviour that matches the rules. Your routes must return the same shapes.
- `docs/schema.md`: your schema.

## Global constraints (from CLAUDE.md, unchanged)
- **Allergy filtering is a hard DB filter.** Recipes with unknown allergen data are never returned, and the LLM never decides allergens.
- **Match % and "Almost there" (≤2 missing) are computed in code** from ingredient-id overlap.
- **All LLM calls go through the single wrapper in `lib/`.** The agent retry loop is capped at 3 tries.
- **Photo rule (agreed):** we never store photos. The server discards a photo right after scanning. A photo sent in the LINE chat stays only in the user's own chat history.
- **Server-only secrets:** `SUPABASE_SERVICE_KEY`, `LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN`. Never import them in client code, never commit `.env*`, and add new names to `.env.example`.
- **The UI must keep working with `NEXT_PUBLIC_USE_MOCKS=true` and no keys.**

## Task 1: Data changes (small, do first)
- **Migration `supabase/migrations/0003_drop_servings.sql`** (0002 is #45's `cook_minutes` + `favorites`): drop `users.default_servings`. Servings were removed from the app; recipes keep `base_servings` for the "สำหรับ N ที่" label.
- **`docs/schema.md`:** change the Servings line to say the base amounts are shown as written, with no scaling.
- **Optional now, useful soon:** store `recipes.steps` jsonb items as `{ "text": "...", "verb": "นึ่ง", "heat": 2, "minutes": 15 }`, with everything except `text` optional. The API keeps returning `steps: string[]` (just `text`) for now. The app already reads verb, heat and minutes from the text (`app/recipe/steps.ts`), so switching to the stored fields later is a small change on Person A's side.
- **Substitutes table**, for the "ใช้อะไรแทนได้?" swaps: `substitutes(ingredient_id, label_th, option_ingredient_ids text[])`.
  - An option's allergens are derived from `ingredient_allergens` of its option ingredients.
  - **Decide:** today a missing row in `ingredient_allergens` can mean either "no allergens" or "not tagged yet". Add `ingredients.allergen_status` (`unknown` / `tagged`) so that options with any untagged ingredient count as unknown, and are therefore hidden. This matches `safeSwaps` in `app/recipe/swaps.ts`.
  - Seed it from `mocks/substitutes.ts`.

## Task 2: API routes (replace the mocks)
One route per mock function, under `app/api/`. **Paths, headers, errors and validation come from `docs/api-contract.md`.** The table below only maps each mock function to its route. Every user-specific call sends `x-anon-id`. Person A then swaps the insides of `mocks/api.ts` to call them (issue #13); no page changes.

| Mock function | Route (from the contract) | Notes |
|---|---|---|
| `scan(photo)` | `POST /api/scan` (multipart, ≤5 MB) | Vision LLM through `lib/`. Map the output to canonical ids. Unusable photos get `200 { ok:false, reason }`. Discard the bytes. |
| `getIngredients()` | `GET /api/ingredients` | Used by the check screen's search box. |
| `getOptions()` | `GET /api/options` | Allergens (including `tree_nut`) and categories from the shared list. |
| `getProfile()` / `saveProfile(p)` | `GET` / `PUT /api/profile` | The shape is `{ anonId, allergies, spice }`, with no servings. |
| `searchRecipes(req)` | `POST /api/recommend` | The agent: hard allergy filter (SQL in `docs/schema.md`) combined with the saved profile allergies, match % in code, at most 3 tries. The app sends `category: null` and filters food type itself. |
| `listRecipes()` | `GET /api/recipes` | **Filter on the saved profile allergies; no `allergies` query param** (see the review on #45). |
| `getRecipe(id)` | `GET /api/recipes/:id` | `steps` stays `string[]`. Unknown allergens give a 404. |
| `logCooked`, `getHistory` | `POST` / `GET /api/history` | The client sends `{ recipeId, rating }` and the server fills `th` and `cookedAt`. |
| `getFavorites`, `setFavorite` | `GET /api/favorites`, `PUT /api/favorites/:recipeId` | Uses #45's `favorites` table. |
| `getSubstitutes(id)` | `POST /api/substitutes` | Requested on #45. Request `{ ingredientId }`, response `SwapResult`. Reuse `safeSwaps` from `app/recipe/swaps.ts` on the allergens derived from `ingredient_allergens`, against the saved profile allergies. |
| `ask()` | none | The Ask page was removed. Chat replies in LINE come later, through the webhook. |

**Tests:** for search, check that for ≥5 allergens no result contains the allergen, that an `unknown` recipe is never returned, and that match % is right for 3 hand-checked recipes. For substitutes, check that an option with an untagged ingredient is hidden.

## Task 3: LINE webhook (the chat steps)
**Route `POST /api/line/webhook`.** The full spec is in `docs/line-chat-flow.md` → "What Person B builds".
1. Verify `x-line-signature` (HMAC-SHA256 of the raw body with `LINE_CHANNEL_SECRET`, base64). Reply 200 fast and ignore bad signatures.
2. **Text "สแกนวัตถุดิบ"** → reply `scanPrompt(liffUrl("/form"))`.
3. **Image message:**
   - start the loading animation: `POST https://api.line.me/v2/bot/chat/loading/start` with `{ chatId: userId, loadingSeconds: 60 }`, 1:1 chats only
   - fetch the bytes: `GET https://api-data.line.me/v2/bot/message/{id}/content`
   - run the same scan as `/api/scan`, then drop the bytes
   - save the confirmed-ingredient draft under `users.line_user_id`
   - reply `confirmCard(ingredients, { allergyNames, spiceLabel }, liffUrl("/form"), "action=search")`
   - on failure, reply with the reason text plus `scanPrompt`'s quick replies
4. **Postback `action=search`** → load the draft and profile, run the same search as `/api/recommend`, and reply `resultsCarousel(result, id => liffUrl(\`/recipe/${id}?from=results\`), liffUrl("/results"), liffUrl("/form"))`.
5. **Use replies only.** The reply token is single-use and replies don't count toward the free quota. Never push.
- The message builders are ready and tested: `app/line/cards.ts` (`scanPrompt`, `confirmCard`, `resultsCarousel`). Use `liffUrl` from `app/liff.ts`.
- **Open point for both of you:** pages opened from the carousel need the draft (ingredients) and the profile. Either key both by LINE user id (via `liff.getProfile()` on the page, which Person A adds), or pass the ingredient ids in the link (never allergies). Agree before building step 4.
- **Tests:** signature check (valid, invalid); each event type gives the right builder output (mock the LINE HTTP calls).

## Task 4: Decide with Person A
- **Pantry staples:** should fish sauce, oyster sauce, rice and garlic count as already owned for "ทำได้เลย"? If yes, the search treats a fixed list as owned when computing what's missing.

## Setup the account owner does (not code)
- Messaging API channel: set the webhook URL `https://ai-menu-five.vercel.app/api/line/webhook` and turn webhooks on.
- LINE Login channel with a LIFF app:
  - endpoint `https://ai-menu-five.vercel.app`
  - scopes `openid`, `profile`, `chat_message.write`
  - share target picker on
  - put the LIFF ID in `NEXT_PUBLIC_LIFF_ID`
- Rich menu (`design/rich-menu/`): LIFF links, then the Scan tile becomes a message action once Task 3 is live.

## Done when
- `NEXT_PUBLIC_USE_MOCKS=false` runs the whole web flow on real data.
- In LINE, Scan → photo in the chat → confirm card → carousel → recipe page works.
- `npm test` and `npm run build` pass, and the mock mode still works.
