# MakeADish

A Thai-first cooking helper that lives in LINE. Take a photo of what is in your kitchen, confirm the ingredients, set your allergies and spice level, and get recipes you can cook now, plus ones that are "almost there" and need one or two more items.

> **Status: live in LINE on the real backend.** The chat flow works end to end in the LINE Official Account (rich menu → photo in the chat → confirm card → results carousel → recipe page), and the pages run on the real API and Supabase database (31 dishes). Live site: https://ai-menu-five.vercel.app. The UI still runs with no keys in mock mode for local work. Sections marked _(planned)_ are not built yet. Update this file as things land.
>
> **Next:** a third result group for partial matches, "ต้องซื้อเพิ่ม" (#78: search #79, Results page #80), more dishes (#81, target 60-100), real-photo and allergy testing (#32), demo rehearsal (#33).

## Why this exists

Most recipe tools start from a dish. MakeADish starts from your kitchen, works in Thai, and runs inside LINE so there is no app to install. It searches a real recipe database instead of letting an LLM invent recipes, and it never returns a dish that conflicts with a saved allergy.

The product spec is summarized below. Market sizing and competitor material is kept by the team outside this repo.

## Product spec

**Idea.** A cooking helper inside LINE. The main chat is a hub with a rich menu (Scan, History, Menus); replying to plain chat messages with the cooking assistant comes later. Tap Scan and the camera opens right in the chat. Send a photo of your ingredients, and it asks one question: is this what you have? Fix the list, check your saved allergies and spice level, and tap find. It shows recipes you can make now, and a second tab with recipes that are almost a match and need one or two more items, with food-type filters. A recipe suggests allergy-safe swaps for anything missing, and walks you through the steps on a big, glanceable timeline. Finishing the last step asks for a rating and saves it to History.

**Chat and Mini App, each where it's best.** Quick steps live in the chat: the camera, a one-tap "is this right?" card and a swipeable results carousel, with no page loads. Steps that need a real screen open the Mini App: editing ingredients and allergies, filters, and cooking with the step timeline. The full split and its reasons are in `docs/line-chat-flow.md`.

**Solution choice.** A single AI agent with RAG. It searches a real recipe database instead of making recipes up, and it checks its own results and retries when matches are poor. A plain LLM would invent recipes, and multiple agents would cost more than this task needs.

**Inputs**
- Photo of ingredients
- Edited ingredient tags
- Spice level and allergies (saved once); food type as a filter on Results
- Free-text questions in the chat
- Cook ratings

**Outputs**
- Ranked recipes in two tabs: Matches and Almost there (a third group, partial matches with more to buy, is planned in #78)
- Match percentage and the missing ingredients
- Step-by-step recipe
- Cook history and favorites
- Chat answers personalized to the user's history

**Data and tools**
- Vision LLM (reads the photo)
- Recipe vector database (the RAG source)
- User database (profile, allergies, cook history)
- Filter tool
- LINE Messaging API, rich menu and LINE Mini App
- Backend that runs the agent

**Pages**

| Page | What it does |
|---|---|
| Scan | User takes or uploads a photo. Vision LLM returns an ingredient list. |
| Check (`/form`) | "ถูกต้องไหม?": ingredient chips (+/-) and one preferences line (allergies in red, spice) that opens a bottom sheet. Pre-filled from the saved profile. |
| Results | Agent: plan, search, filter, check, retry. Tab 1 "Matches" uses your ingredients. Tab 2 "Almost there" needs 1-2 more items (listed). Food-type pills filter both tabs. Pantry staples (salt, sugar, pepper, oil, fish sauce, soy sauce, oyster sauce; `data/staples.ts`) are assumed in every kitchen and never count as missing. |
| Recipe | Missing items with allergy-safe swaps, ingredients, and วิธีทำ as a glanceable step timeline (icon, heat, timer, screen kept on). The last step opens the rating, which writes to History. |
| History | Cooked dishes, ratings, favorites. |
| Menus | Browse and search the full catalog. |

**Agent tools:** recipe vector DB (RAG), filter (spice / category / allergy), and user history (skip recent, boost liked).

**Where the recipes come from.** Mainly a set of Thai dishes we write ourselves (about 60 to 100), checked by hand. An open dataset is only an optional supplement, and only if its license allows redistribution. An AI tool tags each recipe with spice level and allergens, on top of a keyword rule map. Tags are spot-checked by hand.

**Positioning.** The open gap is Thai-first cooking from your fridge: photo scan, inside LINE, knows your allergies. There is no app to download, every rating improves the next suggestion, and the Thai recipe set is checked by hand.

**Still to do (product side).** The rationale, the trade-offs (cost, accuracy, risks, business value), and laying it all out on the one-page slide.

## The demo flow

```
Scan photo -> check screen (fix ingredients; allergies and spice saved in the profile)
           -> results: [Matches] [Almost there] -> recipe steps
           -> "I cooked this" + rating -> History -> better suggestions next time
```

Other pages: **History** (cooked dishes, ratings, favorites), **Menus** (browse and search the catalog). The Ask chat page was cut: help now shows up as allergy-safe swaps on recipes, and chat replies in LINE come later.

Presenter script: [docs/demo-script.md](docs/demo-script.md). How the UI fits together: [docs/how-the-app-works.md](docs/how-the-app-works.md). Colors, type and components: [DESIGN.md](DESIGN.md).

## How it works

| Part | Type | Notes |
|---|---|---|
| Photo to ingredient list | Vision LLM | Input step only |
| Tags and form | Plain UI | Pre-filled from the saved profile |
| Recipe search | RAG (vector search) | Over our recipe table |
| Allergy / spice / category filters | Hard database filters | The LLM cannot override these |
| Match % and "Almost there" | Plain code | Computed from ingredient overlap, not by the LLM. 2 or fewer missing items = Almost there |
| Retry and relax | Agent loop | Capped at 3 tries, shown in the UI |
| Personalization | Query over user history | Skip recent dishes, boost liked ones |

## Tech stack

- **App and API:** Next.js (TypeScript), mobile-first, styled like a LINE Mini App
- **Database:** Supabase free tier (Postgres + pgvector) for recipes, embeddings, profiles and history. This is the only vector store; no separate vector service or reranker.
- **AI:** one LLM provider behind a single wrapper, so switching is a one-line change. Start with the Gemini free API tier (vision, Thai text, embeddings); Groq or OpenRouter free models are fallbacks. A small paid credit is the demo-day fallback.
- **Hosting:** Vercel free tier
- **LINE integration:** LINE Official Account with a Messaging API webhook (`app/api/line/webhook`), a rich menu (`design/rich-menu/`) and the pages opened as a LIFF app. Which step lives in the chat and which on a page: `docs/line-chat-flow.md`.

The whole project should run at zero cost. Free-tier limits change, so check rate limits on Day 1 and cache LLM results where possible.

### LLM provider and limits

Tested with `scripts/test-llm.mjs` (run `node --env-file=.env.local scripts/test-llm.mjs <photo>`).

| Job | Model | Result |
|---|---|---|
| Thai text | `gemini-3.5-flash-lite` | Pass, natural Thai, about 1.5-2 s |
| Vision | `gemini-3.5-flash-lite` | Pass. Listed the right ingredients for one food photo and returned `NO_FOOD` for a non-food photo |
| Embeddings | `gemini-embedding-001` | Pass, 768 dimensions, matches `vector(768)` |
| Fallback | `gemini-3.8-flash` | Works, but was slow (35 s) and returned HTTP 503 under load |

Limits (free tier, read from AI Studio):

| Model | Requests/min | Tokens/min | Requests/day |
|---|---|---|---|
| `gemini-3.5-flash-lite` | 15 | 250k | 500 |
| `gemini-embedding-001` | 100 | 30k | 1000 |

The free tier's data-use terms are not recorded yet.

Rules for the LLM wrapper:
- Retry on HTTP 429, 5xx and network errors, with a short backoff (about 2 s, then 5 s).
- If the main model still fails, fall back to the second model.
- With 15 requests per minute, a scan plus an agent loop of up to 3 tries can use several requests per user. Cache results and avoid parallel calls so a demo with a few users does not hit the limit.
- The daily caps are the tighter limit: 500 text/vision requests and 1000 embedding requests per day, shared by development, testing and the demo. Every search embeds one query, so test with mock mode on and keep real calls for integration and rehearsal.
- Embed the recipe set once, throttled to stay under 30k tokens per minute (batch several recipes per request), and store the vectors. Never re-embed unchanged recipes.

## Design decisions

**Allergen policy.** Allergy filtering is the one hard safety rule.
- Allergen tags come first from a keyword rule map (fish sauce, shrimp paste, oyster sauce, peanut and so on). The LLM tagger is a second check, never the only one.
- A recipe with unknown or missing allergen data is excluded, never shown.
- Hidden-allergen ingredients common in Thai cooking are listed in `data/allergen-rules` once added.

**Identity.** The demo uses an anonymous ID stored in the browser. The profile and history tables carry a field that can later hold a LINE user ID.

**Ingredient matching.** One canonical ingredient table (id, Thai name, English name, aliases) is the source of truth. The photo scan output and every recipe ingredient are mapped to those ids, so "หมู" and "หมูสับ" match correctly. Matching uses ids only, with no unit conversion. Quantities are stored as display text such as "2 tbsp".

**Servings.** Removed: recipes show their own amounts with "สำหรับ N ที่" (`base_servings`). Nothing scales, and nothing about servings is stored per user.

**Privacy.** We never store photos: the server discards each photo right after the scan. A photo sent in the LINE chat stays only in the user's own chat history. No personal data is sent to the LLM provider.

## Getting started

Prerequisites: Node.js 20+ (22 recommended), npm, git.

```bash
git clone <repo-url>
cd <repo-folder>
npm install
cp .env.example .env.local
npm run dev
```

Then open http://localhost:3000 on your phone-sized browser window. Run `npm test` for the automated tests.

### Deploy (Vercel, free tier)

Import the GitHub repo at vercel.com/new (framework: Next.js, no build settings to change). Add the environment variables below under Production; for a mock-only demo, `NEXT_PUBLIC_USE_MOCKS=true` is enough. Server keys must never get a `NEXT_PUBLIC_` prefix.

Deploy from the repo root on `dev`: `npx vercel deploy --prod --project ai-menu`. `NEXT_PUBLIC_*` values are baked in at build time, so redeploy after changing them.

### Environment variables

Copy `.env.example` to `.env.local` and fill in your own values. **Never commit real keys.**

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_USE_MOCKS` | Unset or `true`: pages use mock data with no keys. `false`: pages call the real API (production) |
| `LLM_API_KEY` | Vision, agent, tagging and embeddings |
| `LLM_PROVIDER` | Which provider the wrapper should use (default `gemini`) |
| `LLM_MODEL`, `LLM_FALLBACK_MODEL` | Optional model overrides (defaults in `lib/llm.ts`) |
| `SUPABASE_URL` | Database URL |
| `SUPABASE_ANON_KEY` | Public client key |
| `SUPABASE_SERVICE_KEY` | Server-only key. Never expose to the browser. |
| `NEXT_PUBLIC_LIFF_ID` | LIFF app id (LINE Login channel). Empty = LINE features in the pages stay off |
| `LINE_LOGIN_CHANNEL_ID` | Server-only. Verifies the LIFF ID token that links a profile to the chat user |
| `LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN` | Server-only. The Messaging API bot used by the webhook |

### Mock mode

The UI runs end to end on mock data with no keys, so frontend work never waits on backend work. Every page reads data through one file, `mocks/api.ts`. With `NEXT_PUBLIC_USE_MOCKS=true` (the default in `.env.example`) it returns mock data; with `false` it calls the endpoints in `docs/api-contract.md`. Swaps are always computed in the browser until their endpoint lands. See `docs/how-the-app-works.md`.

## Project structure

```
docs/            api-contract.md, schema.md, line-chat-flow.md, how-the-app-works.md, demo-script.md, manual-test-checklist.md. Class PDFs stay out of the repo.
app/             Pages (Person A); app/line/ builds the chat cards
app/api/         Endpoints: scan, options, ingredients, profile, recommend, recipes, history, favorites, line/webhook (Person B)
components/      UI components (Person A)
mocks/           Mock data and the single data door, mocks/api.ts (Person A)
types/           Shared request/response types (both)
lib/             LLM wrapper, scan, match logic, stores, LINE client and webhook handler (Person B)
data/            Recipe batches, ingredients, allergen rules, staples (Person B)
scripts/         SQL builders for the recipe, ingredient and allergen seeds, LLM smoke test
supabase/        Database migrations and seeds
design/          Rich menu image, source and upload steps
```

Tests sit next to the code they cover (`*.test.ts` in `app/` and `lib/`).

## Team workflow

Two roles, each owning their own folders to avoid merge conflicts:

- **Person A, App and UX:** pages, components, LINE look and feel, loading and error states, deploy
- **Person B, AI and Data:** recipe dataset and tagging, embeddings, endpoints, agent loop, personalization

Rules:

1. The API contract in `docs/` is the source of truth for request and response shapes. Change it in a pull request that both people approve.
2. Branch names: `a/<feature>` and `b/<feature>`. Open pull requests into `dev`.
3. `main` only receives merges from `dev` at integration checkpoints and on demo day.
4. Small commits with clear messages. No secrets, ever.
5. If you are blocked on the other person's work, use mock data and keep going.

## 7-day plan

| Day | Person A | Person B |
|---|---|---|
| 1 | Scaffold app, LINE-style layout, routing | API contract, database and keys, collect recipes |
| 2 | Scan and Form pages (mock data) | Clean and tag recipes, add Thai dishes, embed and load |
| 3 | Results (two tabs) and Recipe pages | Vision endpoint, search endpoint with filters |
| 4 | Connect pages to real endpoints | Agent loop, match %, Almost there. **Integration checkpoint** |
| 5 | History and Menus, "I cooked this" and rating | Personalization, swap suggestions (substitutes data) |
| 6 | Polish, error states, Thai copy | Test with real photos, fix tags, allergy tests |
| 7 | Demo script, backup recording, deploy | Seed demo user, rehearse |

If behind: cut LIFF and chat replies in LINE first (the Ask page is already cut). Never cut the core path.

## Testing

Automated: `npm test` runs every `*.test.ts` in `app/` and `lib/`: match % and staples, the allergy filter, recipe batches, the API routes (profile, recipes, history and favorites), the LINE webhook, signature and ID-token checks, chat cards, step parsing, swaps, the cooking timer and photo shrinking.

Manual checks that need a person (full checklist: [docs/manual-test-checklist.md](docs/manual-test-checklist.md)):

- Scan about 10 real photos in varied lighting, including a blurry and a non-food one. Target: at least 8 of 10 list the main ingredients correctly, and the non-food photo is rejected with a clear message
- Test on a real phone at about 375px width
- Confirm no result in either tab contains a saved allergen, across at least 5 allergens
- Spot-check about 20 LLM-tagged recipes by hand
- Have a Thai speaker read recipe and UI text
- Test new user with no history, offline, and slow responses
- Repeat the full flow on the deployed version, on the demo device and network

## Contributing

1. Pick a task from the plan or the issue list.
2. Create a branch from `dev`.
3. Keep changes inside your area, or ask first.
4. Run the tests and check the flow on a phone-sized window.
5. Open a pull request into `dev` and ask the other person to review.

## Data and safety notes

- Recipes are mainly Thai dishes we write ourselves. If an open dataset is added as a supplement, its name and license are recorded here. Spice and allergen tags are LLM-generated and spot-checked by hand, so they may still contain errors. Do not treat this demo as medical or allergy advice.
- Do not send personal data to the LLM provider. Free tiers may use inputs to improve their models.
- Free tier limits can change. Test early and cache where possible.

## Team

| Person | GitHub | Role |
|---|---|---|
| Person A | [@Boeingxd](https://github.com/Boeingxd) | App and UX |
| Person B | [@postscrippt](https://github.com/postscrippt) | AI and Data |

## License

The code is released under the [MIT License](LICENSE). The recipe text in `data/` is written by the team. Any recipe imported from an outside dataset keeps that dataset's license, which must allow redistribution.
