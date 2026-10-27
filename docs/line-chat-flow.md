# MakeADish in LINE: what happens in the chat, what happens on a page

Status: agreed by Person A and Person B (2026-10-26). Person B's task list: `docs/superpowers/plans/2026-10-26-person-b-backend.md`. The chat parts (steps 2–5) need Person B's LINE webhook. The page parts and "send to chat" are built (`app/liff.ts`, `app/recipe/recipeCard.ts`).

## Why
Today nothing of ours happens in the LINE chat. The rich menu is an image whose tap areas open our web pages, and every step is a page load away from the chat. The goal is the least friction: put each step where it costs the fewest taps and waits, and is easiest to read and fix.

- **Chat** (messages, Flex cards, quick-reply buttons):
  - Good: no load time, native camera, stays in the chat history, can be forwarded, and **replies are free**.
  - Bad: cards are static, buttons are limited, and choosing several items or editing is clumsy. It also needs a server (webhook).
- **Page** (our Next.js app opened inside LINE as a LIFF app):
  - Good: fully interactive, and works without a server.
  - Bad: every open costs a load, and the user leaves the chat.

## The flow

```
CHAT                                               PAGE (LIFF)
────                                               ───────────
1  Rich menu: [สแกนวัตถุดิบ] [ประวัติ] [เมนูทั้งหมด] ──► History, Menus pages
        │ Scan tile sends the message "สแกนวัตถุดิบ"
2  Bot: "ถ่ายรูปวัตถุดิบได้เลย"
   quick replies [📷 ถ่ายรูป] [🖼 คลังภาพ] [พิมพ์เอง] ──► /form (type ingredients)
        │ user sends a photo
3  … loading animation (up to 60 s) …
4  Card: "เจอ 5 อย่าง: ไข่ · หมูสับ · …"
   "แพ้: กุ้ง · เผ็ดน้อย"
   [ถูกต้อง หาเมนู]  [แก้ไข] ─────────────────────────► /form (fix chips, allergies)
        │ postback                                        └─► /results
5  Carousel: up to 10 dish cards
   ทำได้เลย first, then ขาดอีกนิด ("ขาด: ซอสหอยนางรม")
   each [ดูสูตร] ──────────────────────────────────────► 6 /recipe/[id]
   last card [ดูทั้งหมด / กรองประเภท] ─────────────────► /results (tabs, filters)
                                                         swaps, ingredients,
                                                         วิธีทำ timeline (timer,
                                                         screen kept on)
8  Recipe card posted by the user ◄── [ส่งเข้าแชท] ──── [แชร์ให้เพื่อน] → share picker
   (ingredients, ต้องซื้อ, step verbs, [เริ่มทำ] ──────► reopens the page)
                                                       7 last step → ★ rating
   back in the chat ◄──────────────────────────────── [กลับไปที่แชท]
11 (later) free text "มีไข่กับหมู" → same carousel as 5
```

| # | Step | Where | Why |
|---|---|---|---|
| 1 | Start | Chat (rich menu) | Already there. |
| 2 | Take or pick a photo | **Chat** quick replies (camera, camera roll) | Native camera, no page load. The biggest friction cut. |
| 3 | Waiting | **Chat** loading animation | Feels native. Replies stay free. |
| 4 | "ถูกต้องไหม?" | **Chat** card, editing goes to the page | Most scans are right, so this is one tap. Editing chips doesn't work well in a chat. |
| 5 | Results | **Chat** carousel, tabs and filters go to the page | You see menus with no page load. |
| 6 | Recipe and cooking | **Page** | The timer, current step, screen-on and swaps can't work in a static card. |
| 7 | Rate | **Page**, then [กลับไปที่แชท] | It's where you finish cooking, and one tap returns to LINE. |
| 8 | Keep, shopping list, share | **Message** sent from the page | วัตถุดิบ stays in the chat as a shopping list and can be forwarded. วิธีทำ is shown as a preview (verbs) with [เริ่มทำ]. |
| 9 | History, Menus | Page | Lists, search, filters. |
| 10 | Allergies, spice | Page (sheet on `/form`) | Multi-select is clumsy in a chat. The summary still shows on the step 4 card. |
| 11 | Free-text questions | Chat (later) | Same carousel as step 5. |

**วัตถุดิบ / วิธีทำ as a message:** วัตถุดิบ works well as a message (shopping list, keepsake). วิธีทำ works only as a preview. Cooking stays on the page, because a static card can't show the current step, run a timer or keep the screen on.

## Photo rule (agreed by both, 2026-10-26)
"**We** never store photos: the server discards a photo right after scanning. A photo sent in the chat stays only in the user's own LINE chat history." Now in README and CLAUDE.md.

## What Person B builds (chat side)
A webhook route under `app/api/` (server-only; channel secret and access token in env, never in client code).
1. **Check the `x-line-signature` header** on every request. Reject requests where it fails.
2. **Message "สแกนวัตถุดิบ"** → reply with a text plus quick replies: `camera`, `cameraRoll`, and a `uri` to `/form`.
3. **Image message:**
   - start the loading animation (`POST /v2/bot/chat/loading/start`, 1:1 chats only)
   - fetch the content, run the scan, discard the bytes
   - reply with the **confirm card**
   - on no food, blurry or an error, reply with the reason and the same quick replies
4. **Postback "confirm"** → run the same search as the app (allergy hard filter from the user's profile, match % in code, at most 3 tries) → reply with the **results carousel**.
5. **Use replies only.** Replies don't count toward the monthly quota; push messages do. The reply token is single-use, so send exactly one reply per event.
6. **Ingredients the user confirmed** must reach the pages. Pass them in the link (ingredient ids only, never allergies) or store them under the LINE user id.

**The messages are ready in `app/line/cards.ts`** (Person A's design, unit-tested). Call them and send the result as the reply:
- `scanPrompt(formUrl)` (step 2): text plus quick replies [ถ่ายรูป] (camera), [เลือกจากคลังภาพ] (camera roll), [พิมพ์เอง] → `/form`.
- `confirmCard(ingredients, { allergyNames, spiceLabel }, editUrl, confirmData)` (step 4):
  - a teal header "เจอวัตถุดิบ N อย่าง / ถูกต้องไหม?"
  - ingredients one per line in two columns
  - allergies in red, or "ยังไม่ได้ระบุอาหารที่แพ้"
  - [ถูกต้อง หาเมนู] as a postback with your `confirmData`, and [แก้ไข] as a link
- `resultsCarousel(result, recipeUrl, allUrl, editUrl)` (step 5):
  - up to 10 dish cards, ทำได้เลย first, each with a match % pill and "ขาด: …" for almost-there dishes
  - dishes from the `partial` group come after the others, labelled "ต้องซื้อเพิ่ม", each with its "ขาด: …" list
  - a last card [ดูทั้งหมด] linking to the results page
  - when nothing matches, one card with [แก้วัตถุดิบ]
  - pass in the **already hard-filtered** search result; the function only lays it out

To preview one, print its `contents` as JSON and paste it into LINE's Flex Message Simulator.

## Built now (Person A, no server)
- **`app/line/cards.ts`** + `app/line/flex.ts`: the chat messages for steps 2, 4 and 5 (above), and shared Flex building blocks in the DESIGN.md palette.
- **`app/liff.ts`:**
  - loads the LIFF SDK only when `NEXT_PUBLIC_LIFF_ID` is set, and does nothing outside LINE
  - `canSendToChat`, `sendToChat`, `canShare`, `shareToFriends`, `closeToChat`, `liffUrl`
- **The card's [เริ่มทำ]** opens `/recipe/{id}?cook=1&missing=…`. The page scrolls straight to step 1 and shows "ต้องซื้อเพิ่ม" with swap buttons. Only ingredient ids are in the link; allergies come from the opener's own profile.
- **`app/recipe/recipeCard.ts`:**
  - the recipe as a Flex card: brand header, ingredients with missing ones in amber as "ต้องซื้อ", numbered step verbs, and [เริ่มทำ] linking to the LIFF recipe URL
  - only URI buttons, because cards sent from LIFF may not have other actions
  - unit-tested
- **Recipe page:**
  - [ส่งเข้าแชท] appears only when opened from a LINE chat, and [แชร์ให้เพื่อน] only when the share picker is available
  - after rating inside LINE, [กลับไปที่แชท] closes the page

## Webhook status (Person B)
Built in `app/api/line/webhook/route.ts` with the logic in `lib/line/` (signature check, LINE API client, event handler) and `lib/match.ts` (hard filters and match % in code). It runs on **stand-ins** until Task 2 lands, all in `lib/line/standins.ts`:
- **Scan** returns a fixed ingredient list (pork, egg, garlic, chili, holy basil) and ignores the photo.
- **Search** ranks the mock recipes with the real rules.
- **Profile** is found through `users.line_user_id` once the person has saved their profile inside LINE with the `x-line-id-token` header (see the contract). Until then the chat has no allergies on file, and the old note below still applies to those people. If the database cannot be reached the chat sends no results instead of unfiltered ones. (Search is still the stand-in, so the filter takes effect when the real search lands.)
- **Before linking:** a LINE user who never saved a profile in LINE has no saved allergies, so nothing is filtered by allergy. The confirm card says "ยังไม่ได้ระบุอาหารที่แพ้" and links to the form. **Do not demo this to someone with a food allergy until the saved profile is linked to the LINE user id (Task 2).**

How the steps behave:
- "สแกนวัตถุดิบ" gets the camera prompt. Any other text gets no reply for now.
- A photo starts the loading animation (1:1 chats only), downloads the image, scans, then replies once with the confirm card. The photo bytes are not kept.
- The [ถูกต้อง หาเมนู] postback carries ingredient ids only (`action=search&ids=a,b,c`, kept under 300 characters). Allergies always come from the saved profile, never from the message.
- Exactly one reply per event. No push messages.
- A bad `x-line-signature` gets 401. Event errors are logged by status only, never the token or message text.

**Open point for Person A:** the [แก้ไข] and [ดูทั้งหมด] buttons link to `/form?ids=a,b,c` and `/results?ids=a,b,c`. The pages keep their draft in `sessionStorage`, so they ignore `ids` today. They should read it into the draft when it is present (ingredient ids only).

Replace for the real thing (Task 2): `standInScan`, `standInSearch` and `standInGetProfile`, wired in the route.

## Setup (account owner)
1. LINE Official Account with the **Messaging API** enabled (for the webhook and rich menu).
2. A **LINE Login channel** with a **LIFF app**:
   - size Full
   - endpoint `https://ai-menu-five.vercel.app`
   - scopes `openid`, `profile`, `chat_message.write`
   - **share target picker** turned on
3. Put the LIFF ID in `NEXT_PUBLIC_LIFF_ID` (Vercel env and `.env.local`), then redeploy.
4. Point the rich menu tiles at `https://liff.line.me/{LIFF_ID}/scan` (and `/history`, `/menus`). When the webhook is live, change the Scan tile to a message action that sends "สแกนวัตถุดิบ". See `design/rich-menu/README.md`.

## Test in real LINE
1. From the chat, open `https://liff.line.me/{LIFF_ID}/recipe/pad-kra-pao-moo`.
2. [ส่งเข้าแชท] posts the card into the chat, and [เริ่มทำ] on the card reopens the recipe.
3. [แชร์ให้เพื่อน] opens the friend picker.
4. Step through to the end, rate, then [กลับไปที่แชท] closes the page.
5. In a normal browser, none of these buttons show.
