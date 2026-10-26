# How the app works

Plain-language map of the UI. Updated as pages land.

## Pages and where their data comes from

```
 LINE rich menu tile
        │
        ▼
  /scan ──────────────► /form ──────────────► /results ──► /recipe/[id]
  pick photo            edit tags             (next PR)    (next PR)
  scan(photo)           spice, category,
        │               allergies, servings
        │                    │
        ▼                    ▼
  ┌─────────────────────────────────────────┐
  │ mocks/api.ts   ← every page asks here   │
  │  scan · getIngredients · getOptions ·   │
  │  getProfile · saveProfile               │
  └─────────────────────────────────────────┘
        │ today: fake data (mocks/data.ts)
        │ later (#13): Person B's real endpoints
```

## The pieces

| File | What it is |
|---|---|
| `types/api.ts` | The shapes of data passed around (an ingredient, a scan result, a search request). **Proposed**, waiting on Person B (issue #2). |
| `mocks/api.ts` | The only door to data. Pages never touch fake data directly, so swapping in real endpoints changes this one file. |
| `mocks/data.ts` | Fake ingredients, allergens, categories. |
| `app/draft.ts` | Remembers the scan result and search between pages, in this browser tab only (`sessionStorage`). Not in the URL, so allergies never show up in links. |
| `components/Chip.tsx` | The round toggle buttons on the Form page. |

## Where things are remembered

- **Between pages (this tab only):** scanned ingredients and the last search, in `app/draft.ts`.
- **Across visits:** the profile (anonymous id, allergies, spice, servings) in `localStorage`. Moves to the database later.
- **Never:** the photo. It lives in memory only for the preview and is dropped when you leave the Scan page.

## Trying error states

Open `/scan?mock=nofood`, `/scan?mock=blurry` or `/scan?mock=error`, pick any photo and press Scan.

## Mock mode

`NEXT_PUBLIC_USE_MOCKS=true` (the default, see `.env.example`) runs everything on fake data with no keys.
