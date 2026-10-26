# API contract

Source of truth for request and response shapes between the app (Person A) and the endpoints (Person B). Change it in a pull request that both people approve.

The TypeScript types live in `types/api.ts`. This page says what each endpoint does and how it fails. If the two disagree, fix the one that is wrong in the same PR.

> **Status: decided by Person B, waiting for Person A's approval.** The decisions are listed at the bottom.

## Conventions

- **Base path:** `/api` (Next.js route handlers under `app/api/`).
- **Format:** JSON in and out, except `POST /api/scan` which takes `multipart/form-data`.
- **Who is calling:** every request except `GET /api/options` and `GET /api/ingredients` sends the header `x-anon-id: <uuid>`. It is the anonymous user id from the browser and maps to `users.id`. The server creates the user row on first use. A LINE user id can be linked to it later (`users.line_user_id`).
- **Ids:** all ids in the API are strings.
  - Ingredient id = `ingredients.slug` (for example `holy-basil`).
  - Allergen id = `allergens.id` (for example `shellfish`).
  - Recipe id = `recipes.id` converted to a string (for example `"42"`).
  - Category id is a slug such as `stir-fry`.
- **Language:** `th` is the Thai name and is always present. `en` may be empty.
- **Safety rules the server enforces** (the client must not rely on doing them):
  - A recipe with unknown allergen data is never returned by any endpoint.
  - A recipe containing one of the user's allergens is never returned.
  - Match percentage and "Almost there" (2 or fewer missing items) are computed in code from ingredient ids. The LLM does not compute them.
  - Servings are not part of the API. Recipes keep `base_servings` only for the "สำหรับ N ที่" label.
  - The agent retries at most 3 times.
- **Photos:** we never store photos. The server discards a photo right after scanning. A photo sent in the LINE chat stays only in the user's own chat history.

### Errors

HTTP status carries the class of problem, the body carries the detail:

```json
{ "error": { "code": "rate_limited", "message": "Try again in a moment" } }
```

| Status | `code` | When |
|---|---|---|
| 400 | `bad_request` | Missing or invalid field |
| 401 | `unauthorized` | `POST /api/line/webhook` only: the `x-line-signature` check failed |
| 404 | `not_found` | Unknown recipe id |
| 413 | `too_large` | Photo over the size limit |
| 429 | `rate_limited` | The LLM free tier limit was hit and retries did not help |
| 500 | `server_error` | Anything else |
| 503 | `unavailable` | The LLM and its fallback both failed |

`POST /api/scan` is the one exception: a photo that is not usable is a normal outcome, so it returns `200` with `{ "ok": false, "reason": ... }`. See below.

The app shows a friendly Thai message for any non-2xx response.

## Endpoints

### `POST /api/scan`

Reads a photo and returns the ingredients it sees.

- **Request:** `multipart/form-data` with one field, `photo` (JPEG, PNG or WebP, up to 5 MB). The client should downscale large photos before sending.
- **Response `200`:** `ScanResult`
  ```json
  { "ok": true, "ingredients": [ { "id": "pork", "th": "หมู", "en": "pork", "aliases": ["หมูสับ"] } ] }
  ```
  or
  ```json
  { "ok": false, "reason": "no_food" }
  ```
  `reason` is one of `no_food`, `blurry`, `error`.
- **Notes:** the server maps what the vision model names to canonical ingredient ids and drops anything it cannot map. An empty `ingredients` list with `ok: true` is allowed. The user adds items by hand.

### `GET /api/ingredients`

- **Response `200`:** `Ingredient[]`, the canonical list used by the tag editor's search.

### `GET /api/options`

- **Response `200`:** `Options`
  ```json
  { "allergens": [ { "id": "peanut", "th": "ถั่วลิสง" } ], "categories": [ { "id": "stir-fry", "th": "ผัด" } ], "staples": ["salt", "sugar", "fish-sauce"] }
  ```
  - `staples` (added later, optional for old clients): ingredient ids assumed to be in every kitchen (salt, sugar, pepper, cooking oil, fish sauce, soy sauce, oyster sauce). `/api/recommend` never counts them as missing and leaves them out of the match percentage. Pages should do the same: do not list a staple under "ต้องซื้อเพิ่ม". Staples do not change allergens: a dish with fish sauce still carries `fish`. The list is in `data/staples.ts`.

### `GET /api/profile`

- **Headers:** `x-anon-id`
- **Response `200`:** `Profile`. A new user gets defaults (`allergies: []`, `spice: 1`) and the row is created.

### `PUT /api/profile`

- **Headers:** `x-anon-id`
- **Request:** `Profile`
- **Response `204`**, no body.
- **Validation:** `spice` is 0 to 3, every allergy id must exist.
- **Linking to LINE (optional header):** `x-line-id-token: <LIFF ID token>`. Send it when the page is open inside LINE (`liff.getIDToken()`). The server verifies the token with LINE and links the verified LINE user id to this user, so the chat applies the saved allergies. The client never sends a LINE user id itself. If the token is invalid or expired the answer is `401` and **nothing is saved**; if the server has no `LINE_LOGIN_CHANNEL_ID` or LINE cannot be reached it is `503` and nothing is saved. If the same LINE account saves from a new browser, the link moves to the newest save.

### `POST /api/recommend`

Runs the search and agent loop.

- **Headers:** `x-anon-id` (history is used to skip recent dishes and boost liked ones)
- **Request:** `SearchRequest`
  ```json
  { "ingredientIds": ["pork", "egg"], "spice": 2, "category": null, "allergies": ["shellfish"] }
  ```
  `category: null` means any. `spice` means "up to this level": a recipe is kept if its spice level is at most `spice`.
- **Response `200`:** `SearchResult`
  ```json
  { "matches": [ /* RecipeMatch */ ], "almostThere": [ /* RecipeMatch */ ], "tries": 1 }
  ```
  - `matches`: missing nothing.
  - `almostThere`: missing 1 or 2 items.
  - Each list is sorted by `matchPercent`, highest first.
  - `tries` is the number of agent attempts, from 1 to 3. The UI shows it.
  - Both lists can be empty. That is a valid answer, not an error.
- **Notes:** the `allergies` in the body are the ones to filter on. The server also unions them with the saved profile allergies, so a stale client cannot weaken the filter.

### `GET /api/recipes`

The full catalog for the Menus page.

- **Headers:** `x-anon-id`
- **Query:** `q` (optional search text), `category` (optional)
- **Response `200`:** `RecipeSummary[]`
- **Notes:** allergies are never sent in the URL, because query strings end up in server logs. The server filters on the allergies saved in the user's profile (found through `x-anon-id`).

### `GET /api/recipes/:id`

- **Headers:** `x-anon-id`
- **Response `200`:** `Recipe`
- **Response `404`:** unknown id, or a recipe whose allergen data is unknown.

### `POST /api/history`

Records that the user cooked a dish.

- **Headers:** `x-anon-id`
- **Request:** `{ "recipeId": "42", "rating": 4 }` (`rating` is 1 to 5)
- **Response `201`:** `HistoryEntry`
- **Note:** the server fills `th` and `cookedAt`. The client does not send them.

### `GET /api/history`

- **Headers:** `x-anon-id`
- **Response `200`:** `HistoryEntry[]`, newest first.

### `GET /api/favorites`

- **Headers:** `x-anon-id`
- **Response `200`:** `Favorite[]`

### `PUT /api/favorites/:recipeId`

- **Headers:** `x-anon-id`
- **Request:** `{ "favorite": true }`
- **Response `204`**, no body.

### `POST /api/ask`

> **Later: chat replies in LINE. Do not build this now.** The Ask page was removed. Chat answers will come through the LINE webhook (`docs/line-chat-flow.md`) if time allows. The shape below is kept for that case only.

The cooking assistant. Same agent as `recommend`, answers from the recipe database and the user's history.

- **Headers:** `x-anon-id`
- **Request:** `{ "history": ChatMessage[] }`, the conversation so far. The last item is the user's new message. The client sends at most the last 10 messages.
- **Response `200`:** one `ChatMessage` with `role: "assistant"`. `recipes`, if present, are dishes the answer refers to and are shown as links.
- **Notes:** the same hard filters apply. If the only matching dishes contain the user's allergens, the answer says so and names no dish.

### `POST /api/substitutes`

Suggests safe swaps for one ingredient in a recipe.

- **Headers:** `x-anon-id`
- **Request:** `{ "ingredientId": "oyster-sauce" }`
- **Response `200`:** `SwapResult` (see `app/recipe/swaps.ts`), one of:
  ```json
  { "kind": "ok", "options": [ { "label": "ซีอิ๊วขาว", "ingredientIds": ["soy-sauce"], "allergens": ["soy"] } ] }
  ```
  ```json
  { "kind": "unsafe" }
  ```
  ```json
  { "kind": "none" }
  ```
  - `ok`: at least one swap is safe for this user.
  - `unsafe`: swaps exist but all contain one of the user's allergens.
  - `none`: no swap is known for this ingredient.
- **Notes:** the allergy filter runs on the server against the saved profile. An option with any untagged (unknown) ingredient counts as unknown and is hidden, the same rule as recipes.

### `POST /api/line/webhook`

Receives events from the LINE Messaging API. It is not called by the app.

- **Behavior:** verify the `x-line-signature` header against the channel secret and reject the request if it does not match. Then reply to the message or postback. The server only replies to events and does not push messages.
- **Details:** see `docs/line-chat-flow.md`.

## Where this differs from the database

Differences found when comparing `types/api.ts` with `docs/schema.md`:

| Topic | App types | Database | Proposal |
|---|---|---|---|
| Recipe and ingredient ids | strings (`"holy-basil"`, `"r1"`) | `serial` ints plus `ingredients.slug` | API ids are strings. Ingredients use `slug`. Recipes use the int as a string. The endpoint code converts. |
| Cooking time | `minutes` on `Recipe` and `RecipeMatch` | no column | Add `cook_minutes smallint` to `recipes` (new migration). |
| Favorites | separate list, toggled on any recipe | `history.is_favorite` per cook row | Add a `favorites (user_id, recipe_id)` table. A user can favorite a dish they have not cooked. |
| Unknown allergens | `allergens: null` | `allergen_status = 'unknown'` | Same idea. The API never returns these recipes, so `Recipe.allergens` can drop `null`. |
| Allergen list | no `tree_nut` in mock data | `tree_nut` is seeded | Add `tree_nut` to `mocks/data.ts`. |
| Categories | list in mock data | free text column, no table | Fix the category slugs in one shared list (`data/categories`), used by both sides. |
| Profile spice | always 0 to 3 | nullable | Treat null as default `1` on read. |

## Decisions

Person B (postscrippt) delegated these and they were settled with the recommended answers. They are final once Person A approves the pull request.

1. **Ids are strings in the API.** Ingredients use `slug`, recipes use the int id as a string. The endpoints convert.
2. **`x-anon-id` header** identifies the user for the demo.
3. **`cook_minutes` added to `recipes`** (migration `0002_cook_minutes_favorites.sql`).
4. **`favorites` table** replaces `history.is_favorite` (same migration).
5. **Search returns `200` with empty lists** when nothing matches, and `tries` shows how hard it tried.
6. **Photo limit of 5 MB**, with the client downscaling first.
7. **Endpoint paths** exactly as listed above. Person A uses these in `mocks/api.ts` for issue #13.

Still to do after approval: update the status line at the top, and make `types/api.ts` match (add `tree_nut` to the mock allergens too).
