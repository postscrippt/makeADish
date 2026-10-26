# MakeADish UX and flow revision: design

Date: 2026-10-26. Owner: Person A. Branch: `a/ux-flow` (off `a/design-revamp`, PR #41).

## Intent
Every tap in MakeADish should earn its place. The path from "what's in my kitchen" to "a dish on the table" should have as little friction and guessing as possible. Two things in the current app go against that:

- **Servings is busywork.** It only multiplies the displayed amounts, and it can be set in two places (Form and Recipe).
- **The cooking steps (วิธีทำ) are an afterthought.** They're a plain numbered list at the bottom of the recipe, but they're the part people use while cooking.

The person cooking has their phone **propped on the counter and glances at it with messy hands**. So the design has to hold up to glances: large text, one obvious next action, big tap targets, a screen that stays on, and no hunting for your place.

## Goals
1. The steps become the heart of the recipe page: a visual, glanceable timeline.
2. Fewer decisions before you see menus. The Form becomes one short "is this right?" check.
3. Remove features that don't earn their place: servings everywhere, and the Ask chat page.
4. Help where it actually matters: safe, allergy-filtered swaps for missing ingredients.

## Non-goals
- No change to Scan, History or Menus beyond what's listed below.
- No full-screen "cook mode". The user chose the on-page timeline over it.
- No AI assistant replying inside the LINE chat yet. It's noted as later work (needs Person B).
- No new colors, fonts or food photos. Follow `DESIGN.md`.
- No step progress saved across page loads.

## Anti-goals (a failure even if it works)
- The allergy filter becoming invisible or easy to forget. Allergies must always show in red where the user confirms a search.
- Anything that needs precise taps or reading a paragraph mid-cook.
- The LLM deciding allergens, match %, or "almost there". The rules in CLAUDE.md don't change.

## Constraints
- Next 16 with `cacheComponents` (see CLAUDE.md). Mobile-first, checked at 375px. Must run end to end on mock data with no keys.
- Person A owns `app/`, `components/`, `mocks/` and `design/`. `types/api.ts` holds shapes proposed for `docs/api-contract.md`. Changing those shapes (removing `servings`, adding step fields) needs Person B's agreement. **Until then, leave the types as they are and stop reading or writing `servings`.** Code that has to fill the field (e.g. `SearchRequest.servings`, profile defaults) sends a fixed value with a comment.
- Contrast and touch-target rules in `DESIGN.md`: buttons at least 48px, other targets at least 44px.

## Decisions (made with the user)

### 1. Flow
Home → Scan → **Check screen** (replaces the Form) → Results → Recipe (with the steps timeline) → rate → History.
Home and the rich menu lose Ask: Scan, History, Menus.

### 2. Check screen (replaces `app/form`)
- *Builder's call (recorded):* keep the `/form` route; only its contents change, so existing links keep working.
- Header: "เจอวัตถุดิบ N อย่าง" (found N ingredients). If there are none: "เพิ่มวัตถุดิบ" (add ingredients).
- Heading "ถูกต้องไหม?" (is this right?) with the hint "แตะ × เพื่อลบ หรือเพิ่มที่ขาด" (tap × to remove, or add what's missing).
- The ingredient chips are the page: big butter chips with ×, then a "+ เพิ่ม" (add) chip. Tapping it reveals the existing search box and suggestions. If the scan found nothing, the search box starts open and focused.
- **Preferences line:** one white card with **แพ้: …** in red (allergy names), then a dot and the spice label, then "แก้ไข" (edit). With no allergies set, it shows "ยังไม่ได้ระบุอาหารที่แพ้" (no allergies set yet) and the action reads "ตั้งค่า" (set up).
- แก้ไข/ตั้งค่า opens a **bottom sheet** with the existing allergy chips (danger style) and spice chips, plus a "บันทึก" (save) button. Saving writes the profile.
- One sticky button: "หาเมนู" (find menus). It's disabled with no ingredients.
- **Removed from this screen:** servings (from the whole app) and food type (moves to Results).

### 3. Results
- Keep the two tabs, ทำได้เลย (can make now) and ขาดอีกนิด (almost there), and their current logic.
- Add a row of food-type filter pills under the tabs: "ทั้งหมด" (all) plus each category, in the existing Chip style, scrolling sideways if needed. They filter the current results in place. The search runs with `category: null`.
- If a filter empties a tab, show a short message and a way back to "ทั้งหมด".

### 4. Recipe page, top to bottom
*Builder's call (recorded):* one recipe page for every entry point (Results, Menus, History, favorites). People cook from browsed recipes too, so the timeline, sticky button, wake lock and rate-at-last-step apply everywhere.

1. Title, time, spice.
2. **Missing items** (only when some are missing). Each item gets a small "ใช้อะไรแทนได้?" (what can I use instead?) button. Tapping it shows the swaps inline. **Decided with the user: swaps come from a fixed list, not free AI text.**
   - A small table in `mocks/` maps a missing ingredient id to substitute options. Each option holds one or more ingredient ids plus a Thai label, e.g. oyster sauce → "ซีอิ๊วดำ + น้ำตาล", holy basil → "ใบโหระพา". It covers at least every ingredient that can be missing in the mock recipes.
   - **Allergy filter in code:** hide any option whose ingredients carry an allergen the user is allergic to, using the same allergen data and rule as the recipe hard filter. Options with unknown allergen data are hidden too.
   - If nothing is left, show "ไม่มีตัวแทนที่ปลอดภัยสำหรับคุณ" (no safe substitute for you). If the table has no entry, show "ยังไม่มีคำแนะนำสำหรับวัตถุดิบนี้" (no suggestion yet for this ingredient).
   - Reached through a mock function in `mocks/api.ts` (e.g. `getSubstitutes(ingredientId, allergies)`), so the real version can swap in later. The filter function gets unit tests.
   - Later (Person B): the AI may suggest substitute ingredient ids, which go through the same filter. The AI never decides allergens.
   - The `ask()` mock is no longer used by the UI. Keep it for Person B's reference.
3. **Ingredients**, compact. Heading "วัตถุดิบ", a small label "สำหรับ {baseServings} ที่" (serves N), and amounts exactly as written in the recipe. No stepper, no scaling.
4. **วิธีทำ: B1 timeline** (below).
5. The old "ทำเมนูนี้แล้ว" (I made this) section is removed. Rating now opens from the last step.

### 5. วิธีทำ timeline (B1)
Reference mockup: `.superpowers/brainstorm/*/content/cook-steps-v2.html` (option B1). It's a local file, not committed. The description below is the source of truth.

- A section heading "วิธีทำ" with progress on the right: "{done} จาก {total} เสร็จแล้ว" (done of total finished).
- A vertical line connects all steps.
  - **Finished steps:** a teal (`brand`) circle with a white check, then the short label in `muted`.
  - **Upcoming steps:** a white circle with an `edge` ring, then the short label in `muted`.
  - **Current step:** one large white card (`rounded-3xl`, `shadow-card`) containing:
    - a `butter-soft` picture area with a large line icon for the action
    - the verb in large bold type (around 26px)
    - a detail line in `muted`
    - pills: heat, then time
- **Heat pill:** three line-flame icons (the stroked flame from the mockup, which the user picked), filled for low, medium or high, plus the label (ไฟอ่อน / ไฟกลาง / ไฟแรง). It's only shown when the step mentions heat.
- **Time pill:** a `butter` pill "⏱ N นาที · เริ่ม" (N minutes, start). Tapping it starts a countdown shown in the pill. Tapping again pauses or resets (builder's call). When it reaches zero the pill shows "ครบเวลาแล้ว" (time's up) and the phone vibrates where `navigator.vibrate` exists. It's only shown when the step has a number of minutes.
- **One sticky bottom button**, `btn-primary`, at least 56px tall:
  - "ขั้นต่อไป" (next step) moves the current step on by one.
  - On the last step it reads "เสร็จแล้ว ให้คะแนนเมนูนี้" (done, rate this dish) and opens the existing star rating, then saves to History as today.
- Tapping any step in the timeline makes it the current step.
- **Screen stays on:** request a Screen Wake Lock while the recipe page is open and visible. If it's not supported, it fails silently.
- **Step parsing** happens in app code, not in the data, for now. A small pure function turns a step string into `{ verb, detail, icon, heat, minutes }`:
  - It matches a keyword table of Thai cooking verbs (ตี, ผสม/คน, ผัด, ทอด, นึ่ง, ต้ม, หั่น/ซอย, โขลก, ปรุง, เสิร์ฟ/ตัก…) to an icon and a short verb.
  - It reads ไฟอ่อน/ไฟกลาง/ไฟแรง/ร้อนจัด for heat, and `(\d+) นาที` for minutes.
  - Anything that doesn't match gets a generic icon. The whole sentence then becomes the detail, with the verb "ขั้นที่ N" (step N).
  - This function gets unit tests. Later, Person B can provide these fields in the recipe data instead.

### 6. Ask
- Delete `app/ask` and remove Ask from home and the rich menu.
- Re-render `design/rich-menu/rich-menu.png`: Scan on the left half, History and Menus as two rows on the right. Update `rich-menu.json` tap areas and the rich-menu README to match.
- Keep `ask()` in `mocks/api.ts` for reference; the swap button uses the fixed substitutes list (section 4).

### 7. Servings
- Remove the Stepper from Form and Recipe. Delete `components/Stepper.tsx` and `scaleQty` if nothing else uses them.
- Stop reading or writing `servings` in app code. Fields the types still require get a fixed value with a comment pointing to the pending agreement with Person B.

### 8. Docs
Update README (Ask, servings, Form wording), `docs/how-the-app-works.md`, `docs/manual-test-checklist.md`, `docs/demo-script.md` and `DESIGN.md` (timeline, flame pill, bottom sheet) to match.

## Left to the builder
- Exact icon set and drawings (stroked line icons, stroke 2, round caps, like the home icons).
- The bottom-sheet implementation, focus handling and closing on backdrop tap. It must be keyboard and screen-reader usable.
- Timer pause/reset behavior. Whether the timeline auto-scrolls the current step into view (recommended).
- Exact Thai keyword table, and wording of empty and error states (match the tone in `docs/thai-copy-review.md`).
- Commit breakdown.

## Follow-ups (not in this work)
- Person B: agree to remove `servings` and add structured step fields (`verb`, `heat`, `minutes`) to `types/api.ts` / `docs/api-contract.md`.
- Person B: hook the AI assistant up to the LINE chat (replaces the Ask page's purpose).
