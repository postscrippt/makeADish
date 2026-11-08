# How the app works

Plain-language map of the UI. Updated as pages land.

## Pages and where their data comes from

```
 (the LINE chat does the scanning: rich menu Scan → camera → photo → confirm card → carousel; there is no scan page)

  /form ───────────► /results ─────────► /recipe/[id]
  type ingredients   two tabs:            missing items + safe swaps
  (พิมพ์เอง)          ทำได้เลย (0 missing)  (getSubstitutes)
  [แก้ไข] in chat     ขาดวัตถุดิบอีกนิด     วิธีทำ timeline, ♥ favorite
  forwards here       food-type pills      last step → ★ → logCooked()
  with ?ids=          edit sheet
                      searchRecipes()
        │               │                │                      │
        ▼               ▼                ▼                      ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │ mocks/api.ts   ← every page asks here                            │
  │  getIngredients · getOptions · getProfile · saveProfile · │
  │  searchRecipes · getRecipe · logCooked · getHistory ·            │
  │  getFavorites · setFavorite · getSubstitutes                     │
  └──────────────────────────────────────────────────────────────────┘
        ▲               ▲
  /history          /menus
  cooked + ★,       catalog, search,
  favorites ♥       category, hides
  getHistory()      your allergens
                    listRecipes()
        │ today: fake data (mocks/data.ts)
        │ later (#13): Person B's real endpoints
```

## The pieces

| File | What it is |
|---|---|
| `types/api.ts` | The shapes of data passed around (an ingredient, a scan result, a search request). **Proposed**, waiting on Person B (issue #2). |
| `mocks/api.ts` | The only door to data. Pages never touch fake data directly, so swapping in real endpoints changes this one file. |
| `mocks/data.ts` | Fake ingredients, allergens, categories. |
| `mocks/recipes.ts` | 10 fake recipes. One has unknown allergens on purpose and must never show up. |
| `app/recipe/steps.ts` | Reads a step sentence into verb, detail, icon, heat and minutes for the timeline (keyword table). Tested by `npm test`. |
| `app/recipe/swaps.ts` | The allergy filter for swap suggestions; unknown allergens are hidden. Tested by `npm test`. |
| `mocks/substitutes.ts` | Hand-picked swaps for the mock recipes. |
| `components/CookMode.tsx` | Full-screen cooking: step card, what the step uses, heat, timer, next-step preview; keeps the screen on. |
| `app/recipe/stepIngredients.ts` | Which recipe ingredients a step names (for "ใช้ในขั้นนี้"). Tested by `npm test`. |
| `components/SearchForm.tsx` | The one ingredient screen: ingredients, allergies and spice, with one button. Used by `/form` and by the Results sheet. |
| `components/SearchSheet.tsx` | `SearchForm` in a bottom sheet on Results. |
| `components/IngredientPicker.tsx` | Chips, search and quick-add for ingredients; used by the entry form and the sheet. |
| `components/RecipeCard.tsx` | One result in the Results list: name, time, spice, match %, what's missing. |
| `app/draft.ts` | Remembers the scan result and search between pages, in this browser tab only (`sessionStorage`). Not in the URL, so allergies never show up in links. |
| `components/Chip.tsx` | The round toggle buttons (Form, Menus). |
| `app/error.tsx` | Friendly "something went wrong + try again" page if a page crashes. Failed loads (e.g. offline) show a message on the page itself. |
| `app/not-found.tsx` | "ไม่พบหน้านี้" for unknown links. |

## Inside LINE

What happens in the chat and what happens on a page: `docs/line-chat-flow.md`. When `NEXT_PUBLIC_LIFF_ID` is set and a page is opened inside LINE, `app/liff.ts` turns on the recipe page's [ส่งเข้าแชท] / [แชร์ให้เพื่อน] (the card comes from `app/recipe/recipeCard.ts`) and [กลับไปที่แชท] after rating. Outside LINE these buttons don't appear.

## Where things are remembered

- **Between pages (this tab only):** scanned ingredients and the last search, in `app/draft.ts`.
- **Across visits:** the profile (anonymous id, allergies, spice), cooked history and favorites in `localStorage`. Moves to the database later.
- **Never:** the photo. Photos only exist in the LINE chat; the web app never sees one.

## Trying error states

- Results: open `/results?mock=empty` or `/results?mock=error` (after doing a search once).
- Swaps: open a recipe from Results with `&mock=error` added and tap "ใช้อะไรแทนได้?".

## How results are picked (mock version)

1. Drop any recipe whose allergen data is unknown, or that contains something you're allergic to.
2. Drop recipes spicier than you chose, or not in the chosen category.
3. Match % = how many of the recipe's ingredients you have. 0 missing → ทำได้เลย, 1-2 missing → ขาดวัตถุดิบอีกนิด, more → hidden.

The real version (Person B) follows the same rules on the server.

## Mock mode

`NEXT_PUBLIC_USE_MOCKS=true` (the default, see `.env.example`) runs everything on fake data with no keys.

## Swapping in real endpoints (issue #13)

When Person B's endpoints exist:

1. Agree the final shapes in `docs/api-contract.md` and update `types/api.ts` to match.
2. In `mocks/api.ts`, replace each `notWired()` branch with a `fetch` to the real endpoint, for example
   `const res = await fetch("/api/scan", { method: "POST", body: form }); if (!res.ok) throw new Error(); return res.json();`
3. Set `NEXT_PUBLIC_USE_MOCKS=false` in `.env.local` and on Vercel.
4. No page should need changes. Every page already shows a friendly message when a call throws.
5. Run `docs/manual-test-checklist.md` again on real data.
