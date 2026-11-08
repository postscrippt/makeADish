# UX v2: one obvious action per screen

Status: plan, written 2026-11-08 by Person A's UX session. Follows the first pass (PRs 93-97). Brand stays exactly as in `DESIGN.md` and `app/globals.css`: no new colors, fonts or shadows. Only layout, hierarchy, copy and flow change.

## What was wrong (the user's words, mapped to causes)

| Complaint | Cause in code |
|---|---|
| "I have to tick again to confirm the ingredients" | `/scan` → `/form` ("ถูกต้องไหม?" + "หาเมนู") → `/results`. In LINE the confirm card already asked, and its [แก้ไข] link opens the same check screen. The check screen is a gate, not an editor. |
| "I don't know what to press" | Check, Results, Recipe and Cook mode each show 2-4 equal-weight buttons or pinned bars (tabs + chips + summary + header). |
| "Wide bottom gap, no useful info" in steps | `CookMode` has one short card in a `flex-1` area; the step bar and buttons are pinned at the bottom, nothing fills the middle. |
| Tick circles on ingredients feel pointless | They only toggle local state. They also look like the confirm tick. |

## Research (Refero, 2026-11-08)

Searched screens (iOS and web), flows and styles. Reviewed about 40 screens, 5 flows, 20 styles. Kept only what answers our four problems.

### Decision ledger

| Decision | Source | Role of the borrowed idea | Why for us |
|---|---|---|---|
| The result screen owns the "is this right?" check: detected items are listed on the result surface with edit in place and one Done | FoodNoms nutrition-label scan review (sheet over the scan); Foodllama flow 11787 "Meal logging and scan review" | Pattern: review lives where the outcome is, one Done | Removes the Check page. Results shows "ingredients we used" + แก้ไข. |
| Editing opens a bottom sheet with live suggestions and a disabled-until-changed Done | Instacart "Search for an item" modal (Done disabled until a pick); Kitchen Stories "Add ingredient" (input + live match list); DoorDash bulk search (items parsed into chips) | Pattern: one sheet, one Done | Edit stays one tap away, never a forced step. |
| Manual entry keeps a full page, with chips for common items and one count-bearing button | Kitchen Stories "Add ingredient" | Pattern | Typing from scratch has no scan to confirm. |
| Step-by-step shows "what you use in this step" above the instruction | Kitchen Stories step screen (ingredient + tool cue row above large text) | Content block | Fills the middle of cook mode with info that is useful right now. |
| Timer is a big dedicated tile, not a small pill | Crouton "Start Timer" (floating, centered); Kitchen Stories (timer highlighted in the text) | Component size and place | Hands are busy; a 44px pill is hard to hit. |
| Next step is previewed at the bottom of the step | Crouton and Kitchen Stories (progress dots / numbered bar, next arrow) | Pattern | Answers "what is coming" and anchors the bottom. We show the text, not only dots. |
| Never a checklist in cook mode | Crouton (ingredient checklist panel) is the one we reject | Rejected | The user called the ticks pointless. We list quantities; nothing to tick. |
| Recipe page: quantity and name as two clean columns, time up top, ONE fixed "start cooking" button | Kitchen Stories recipe detail; Blue Apron ingredients | Layout | Tick circles go away; the page reads as ingredients, steps, start. |
| Missing items shown inline in the ingredient list, with swaps under the row | Julienne flow 6479 (select ingredients) for inline row actions | Pattern | One list instead of two (amber card repeated every ingredient). |
| Filters are a scrolling chip row, only the tabs are pinned | Mela search results; Foodvisor results | Pattern | Two pinned rows cost ~110px of a 667px screen. |
| Brand discipline: one flat teal block, accent colors rationed | N26 style (one teal block, flat), Say Briefly (yellow only as highlight), FoodNoms style (rounded, accent = primary action) | Principle only, no colors or fonts | Rule for v2: `brand-deep` = the one primary button, `butter` = selected or key fact, nothing else gets a fill. |

Reference lock: primary direction is our own design system (`DESIGN.md`). Preserve: teal header with rounded bottom, white `rounded-3xl` cards with `shadow-card`, pill buttons and chips, Prompt font, butter for selected and key facts. Borrow only the layout patterns above. Reject: colors and fonts from any reference, emoji as icons, checklists, bottom tab bars (the rich menu is our only menu).

## The new flow

```
CHAT (unchanged)                      WEB (LIFF)
rich menu Scan → camera → photo
confirm card [ถูกต้อง หาเมนู] ─► carousel ─► [ดูสูตร] ─► Recipe
             [แก้ไข] ─────────► /form?ids=… ─redirect─► Results with the edit sheet open
             carousel [ดูทั้งหมด] ► Results

Mock mode: /scan ──► Results (was: /scan → /form → Results)
Typing by hand ("พิมพ์เอง"): /form (entry) ──► Results
Results ──► Recipe ──► Cook mode ──► rate ──► back to chat
```

Rules: a screen asks the user to confirm something at most once. Anything the chat already confirmed is never asked again. Editing is always optional and in place.

## Screen by screen

Header on every page: the flow shell stays (back only inside the flow, step pills 1-3, no web menu).

### 1. Form (`/form`) — typing ingredients by hand only
- Primary action: **หาเมนู จาก N อย่าง** (disabled until one item is added). Same sticky bar.
- Shows: title "เพิ่มวัตถุดิบ", a one-line prompt, the search field, quick-add chips, chosen items as butter chips with ×.
- Removes: the "ถูกต้องไหม?" heading, the preferences card (moved to Results).
- If the page is opened with `?ids=` or with a scan draft it does not render: it forwards to Results (`?edit=1` for the chat's [แก้ไข] link).

### 2. Results (`/results`) — "เลือกเมนู"
- Primary action: **tap a dish** (cards have a chevron; title says เลือกเมนู).
- Shows, top to bottom: a summary card (ingredient chips, allergy and spice line, one แก้ไข button) → pinned tabs (ทำได้เลย / ต้องซื้อเพิ่ม) → a scrolling category chip row → dish cards.
- Edit sheet (new `SearchSheet`): ingredient chips with ×, search, quick-add, allergies, spice, one **ดูเมนูใหม่** button. It saves the profile and searches again in place.
- Removes: the pinned filter row, the "จาก … แก้วัตถุดิบ" link line, the second page for editing.
- Empty and error states keep one primary button each.

### 3. Recipe (`/recipe/[id]`)
- Primary action: **เริ่มทำ** (one fixed bottom button; "ทำต่อ ขั้นที่ N" when resumed).
- Shows: title, meta (time, spice, servings), favorite heart, allergy alert if any, a status line when a pantry is known (มีครบ / ขาด N อย่าง), the ingredient list (qty right-aligned), steps, then quiet send/share links (inside LINE only).
- Missing ingredients: highlighted rows inside the same list; "ใช้อะไรแทนได้?" opens swaps under the row.
- Removes: tick circles and the strike-through state, the separate amber "ต้องซื้อเพิ่ม" card, the secondary buttons above the content.

### 4. Cook mode (full screen)
- Primary action: **ขั้นต่อไป** (last step: เสร็จแล้ว). Back is a small ‹ button.
- Shows: header (×, name, 2/4), numbered step bar under it, then one flex column that fills the screen:
  1. step card: icon, the verb at 36px, the detail at 22px (this card grows, content centered)
  2. **ใช้ในขั้นนี้**: ingredients named in this step with their quantity (matched from the recipe ingredients)
  3. heat tile + big timer tile (only when the step has them)
  4. **ต่อไป** preview of the next step (last step: "เสร็จแล้ว ให้คะแนนเมนู")
- Bottom bar holds only ‹ and the primary button, so there is no stack of controls.
- Done when: on a 375×667 screen no step shows a gap larger than a card gap between the blocks and the bottom bar.

### 5. History (`/history`)
- Primary action: **tap a past dish** to open it.
- Shows: pinned tabs, row cards (title 18px, stars and date, heart at the end). Empty states keep their single primary button.
- Removes: the close-to-chat button under a non-empty list (LINE's X closes the window).

### 6. Menus (`/menus`)
- Primary action: **tap a dish**. Search and a scrolling chip row are pinned together; count line below.
- Uses the same dish card as Results (chevron). Removes the close-to-chat button under the list.

### 7. Scan (`/scan`, mock mode and non-chat fallback)
- Primary action: **สแกน**; on success goes straight to Results.

## PR plan (stacked, each from the previous branch)

1. `a/ux2-plan` — this doc.
2. `a/ux2-results` — IngredientPicker, SearchSheet, Form entry only, Results restructure, RecipeCard chevron, Scan → Results.
3. `a/ux2-recipe-cook` — Recipe page without ticks, Cook mode rebuild, `stepIngredients` helper + test.
4. `a/ux2-lists` — History and Menus polish.

Each PR gets up to three review rounds: 375px screenshots against this doc, then tsc, lint, `npm test`, `npm run build`. Checklist: one primary action per screen, no dead gap, no repeated confirm, brand tokens untouched.

## Not verified here
Real LINE (LIFF webview, rich menu, wake lock, vibration, back/close behavior) is not covered; only mock mode at 375px in a desktop browser.

## Cook mode layout (revised after review)
Problem: the step card stretched to the screen and re-centered or re-anchored its content depending on which extras a step had, so the verb and instruction moved from step to step and a different gap opened each time.

Rule: fixed zones in a fixed order, anchored the same on every step. Variable content changes size, never position.
1. Action band, pinned: icon + verb (44px) + heat flames at the right.
2. Instruction card (takes the free height): the instruction is sized to fill it (22-52px), top-left anchored. Ingredients pinned to its bottom.
3. Timer tile, only when the step has a time.
4. "ต่อไป" strip.
