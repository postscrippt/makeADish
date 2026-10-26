# MakeADish

A Thai-first cooking helper that lives in LINE. Take a photo of what is in your kitchen, confirm the ingredients, set your allergies and spice level, and get recipes you can cook now, plus ones that are "almost there" and need one or two more items.

> **Status: UI complete on mock data; backend in progress.** Every page runs end to end with no keys (mock mode). Live mock demo: https://ai-menu-five.vercel.app Sections marked _(planned)_ are not built yet. Update this file as things land.

## Why this exists

Most recipe tools start from a dish. MakeADish starts from your kitchen, works in Thai, and runs inside LINE so there is no app to install. It searches a real recipe database instead of letting an LLM invent recipes, and it never returns a dish that conflicts with a saved allergy.

The product spec is summarized below. Market sizing and competitor material is kept by the team outside this repo.

## Product spec

**Idea.** A cooking helper inside LINE. The main chat is a hub with a rich menu (Scan, History, Menus); replying to plain chat messages with the cooking assistant comes later. Tap Scan and a LINE Mini App opens. Take a photo of your ingredients, and the app asks one question: is this what you have? Fix the list, check your saved allergies and spice level, and tap find. It shows recipes you can make now, and a second tab with recipes that are almost a match and need one or two more items, with food-type filters. A recipe suggests allergy-safe swaps for anything missing, and walks you through the steps on a big, glanceable timeline. Finishing the last step asks for a rating and saves it to History.

**Why a hub and a Mini App.** The chat stays clean, with no Flex cards or long menus. The photo, tag editing and sliders need a real screen, which a chat bubble cannot give. The chat is only for conversation.

**Solution choice.** A single AI agent with RAG. It searches a real recipe database instead of making recipes up, and it checks its own results and retries when matches are poor. A plain LLM would invent recipes, and multiple agents would cost more than this task needs.

**Inputs**
- Photo of ingredients
- Edited ingredient tags
- Spice level and allergies (saved once); food type as a filter on Results
- Free-text questions in the chat
- Cook ratings

**Outputs**
- Ranked recipes in two tabs: Matches and Almost there
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
| Results | Agent: plan, search, filter, check, retry. Tab 1 "Matches" uses your ingredients. Tab 2 "Almost there" needs 1-2 more items (listed). Food-type pills filter both tabs. |
| Recipe | Missing items with allergy-safe swaps, ingredients, and วิธีทำ as a glanceable step timeline (icon, heat, timer, screen kept on). The last step opens the rating, which writes to History. |
| History | Cooked dishes, ratings, favorites. |
| Menus | Browse and search the full catalog. |

**Agent tools:** recipe vector DB (RAG), filter (spice / category / allergy), and user history (skip recent, boost liked).

**Where the recipes come from.** A mix of an open recipe dataset, a small set of Thai dishes we write or check ourselves, and an AI tool to tag each recipe with spice level and allergens. Tags are spot-checked by hand.

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

## Tech stack _(planned, change if the team decides otherwise)_

- **App and API:** Next.js (TypeScript), mobile-first, styled like a LINE Mini App
- **Database:** Supabase free tier (Postgres + pgvector) for recipes, embeddings, profiles and history. This is the only vector store; no separate vector service or reranker.
- **AI:** one LLM provider behind a single wrapper, so switching is a one-line change. Start with the Gemini free API tier (vision, Thai text, embeddings); Groq or OpenRouter free models are fallbacks. A small paid credit is the demo-day fallback.
- **Hosting:** Vercel free tier
- **LINE integration:** web app first; LIFF wrapper and rich menu are stretch goals

The whole project should run at zero cost. Free-tier limits change, so check rate limits on Day 1 and cache LLM results where possible.

## Design decisions

**Allergen policy.** Allergy filtering is the one hard safety rule.
- Allergen tags come first from a keyword rule map (fish sauce, shrimp paste, oyster sauce, peanut and so on). The LLM tagger is a second check, never the only one.
- A recipe with unknown or missing allergen data is excluded, never shown.
- Hidden-allergen ingredients common in Thai cooking are listed in `data/allergen-rules` once added.

**Identity.** The demo uses an anonymous ID stored in the browser. The profile and history tables carry a field that can later hold a LINE user ID.

**Ingredient matching.** One canonical ingredient table (id, Thai name, English name, aliases) is the source of truth. The photo scan output and every recipe ingredient are mapped to those ids, so "หมู" and "หมูสับ" match correctly. Matching uses ids only, with no unit conversion. Quantities are stored as display text such as "2 tbsp".

**Servings.** Removed from the UI: recipes show their own amounts with "สำหรับ N ที่". `servings` stays in `types/api.ts` until Person B agrees to drop it.

**Privacy.** Photos are not stored; they are discarded after the scan. No personal data is sent to the LLM provider.

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

Import the GitHub repo at vercel.com/new (framework: Next.js, no build settings to change). Add the environment variables from `.env.example`; for a mock-only demo, `NEXT_PUBLIC_USE_MOCKS=true` is enough. `SUPABASE_SERVICE_KEY` must not get a `NEXT_PUBLIC_` prefix.

### Environment variables

Copy `.env.example` to `.env.local` and fill in your own values. **Never commit real keys.**

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_USE_MOCKS` | `true` runs the UI on mock data with no keys |
| `LLM_API_KEY` | Vision, agent, tagging and embeddings |
| `LLM_PROVIDER` | Which provider the wrapper should use |
| `SUPABASE_URL` | Database URL |
| `SUPABASE_ANON_KEY` | Public client key |
| `SUPABASE_SERVICE_KEY` | Server-only key. Never expose to the browser. |

### Mock mode

The UI runs end to end on mock data with no keys, so frontend work never waits on backend work. `NEXT_PUBLIC_USE_MOCKS=true` (the default in `.env.example`) makes every page read from `mocks/api.ts`. See `docs/how-the-app-works.md`.

## Project structure _(planned)_

```
docs/            api-contract.md, schema.md (Person B, Day 1) and manual-test-checklist.md (Person A, Day 1). Class PDFs stay out of the repo.
app/             Pages and routes (Person A)
components/      UI components (Person A)
mocks/           Mock data and the single data door, mocks/api.ts (Person A)
types/           Shared request/response types (both)
api/ or app/api/ Endpoints: scan, recommend, recipe, history (Person B)
lib/             LLM wrapper, agent loop, match logic (Person B)
data/            Recipe dataset, tagging scripts, embedding loader (Person B)
tests/           Automated tests
```

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

Automated: `npm test` (step parsing and the swap allergy filter today). Planned: match % logic, allergy filter, API contract.

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

- Recipes come from an open dataset (name and license to be recorded here once chosen), plus Thai dishes we write or check ourselves. Spice and allergen tags are LLM-generated and spot-checked by hand, so they may still contain errors. Do not treat this demo as medical or allergy advice.
- Do not send personal data to the LLM provider. Free tiers may use inputs to improve their models.
- Free tier limits can change. Test early and cache where possible.

## Team

| Person | GitHub | Role |
|---|---|---|
| Person A | [@Boeingxd](https://github.com/Boeingxd) | App and UX |
| Person B | [@postscrippt](https://github.com/postscrippt) | AI and Data |

## License

_Choose a license (MIT is the usual choice) before making the repo public. Check that the recipe dataset license allows redistribution._
