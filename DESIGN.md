# MakeADish design system

Taken from the pitch deck: deep teal, butter yellow, white cards with very soft corners, pill shapes, a rounded geometric font. Tokens live in `app/globals.css` (`@theme`). Use the token classes (`bg-brand`, `text-muted`, …), never raw hex or Tailwind's zinc/gray.

## Colors

| Token | Hex | Use |
|---|---|---|
| `brand` | `#09809d` | Page headers, home hero, desktop backdrop |
| `brand-deep` | `#066a82` | Primary buttons, user chat bubble, stepper icons |
| `ink` | `#0b3a47` | Body text and headings |
| `muted` | `#4f6e78` | Secondary text, unselected chips |
| `edge` | `#cfe3e9` | Borders, dividers, disabled fills (never the only cue for a state: 1.3:1 on white) |
| `mist` | `#eaf5f8` | Page background behind cards |
| `butter` | `#f6e39a` | Accent with two jobs: the hero headline on `brand`, and "selected / current" (chips, tabs, the current cook step). Nothing else: not badges, pills on teal, or step numbers |
| `butter-soft` | `#fbf3d2` | Quiet tint: icon circles and the pressed state on cards |
| `flame` / `flame-deep` | `#ea580c` / `#c2410c` | Cook mode heat only: the lit flames, and the heat label text (4.7:1) |
| red-700 / red-50 | Tailwind | Allergies and errors only (safety color, keep it red) |
| amber-700/800 / amber-50 | Tailwind | "Missing ingredient" notes only |

The deck's teal is brighter (`#0995b4`), but white text on it only reaches 3.5:1. `brand` is the closest teal that passes 4.5:1 with white.

### Contrast rules (WCAG AA)
- White on `brand`: 4.6:1. OK for any text.
- White on `brand-deep`: 6.2:1. Buttons.
- `ink` on `butter`: 9.6:1. OK for any text.
- `muted` on white: 5.5:1. On `mist`: 4.9:1.
- **`butter` text on `brand`: 3.6:1. Large text only** (24px+, or 18.7px+ bold), e.g. the home headline.
- `ink` on `brand` fails. Never use it.

## Type
Font: **Prompt** (Thai + Latin, `next/font/google`, weights 400/500/600/700). It pairs with the deck's Poppins.

| Role | Classes |
|---|---|
| Hero headline | `text-4xl font-bold text-butter` (on `brand` only) |
| Screen hero headline | `text-3xl font-bold text-butter text-balance`, inside the `PageHeader` hero (24px+ bold, so butter on `brand` passes) |
| Page title (header) | `text-xl font-bold text-white` |
| Recipe title | `text-2xl font-bold` |
| Section heading | `text-xl font-bold` (`text-lg font-semibold` for sub-groups) |
| Card title | `text-base`–`text-lg font-semibold` |
| Body | `text-base` |
| Meta and hints | `text-sm text-muted` (14px is the floor; no `text-xs`) |

## Shape and depth
- Cards: `rounded-3xl bg-white shadow-card`, no border.
- Inline notes and alerts: `rounded-2xl`.
- Buttons, chips, tabs, inputs, badges: `rounded-full` (pills).
- Teal surfaces get rounded bottoms (`rounded-b-3xl` header, `rounded-b-[2.5rem]` home hero) so white cards appear to sit on them.
- One shadow: `shadow-card` (soft, teal-tinted). No other shadows.

## Components
- **`btn-primary`** (utility in `globals.css`): `brand-deep` pill, white semibold, min height 48px, greys out when disabled. One per screen.
- **`btn-secondary`**: white pill with an `edge` ring. For alternatives (e.g. "เลือกจากคลังภาพ").
- **`PageHeader`**: `brand` bar, back chevron, white bold title; sticky when it is just the bar. No step counter: pages open from chat links and each other in any order. With children it becomes a **hero** (`rounded-b-[2.5rem]`): the screen's headline in butter and its key summary inside the teal, which scrolls away; white content rises over it. Page content uses `px-5`, `gap-4` between cards and `gap-6` between sections.
- **`Chip`**: unselected is white with an `edge` border and `muted` text. Selected is `butter` with `ink` text. 44px high. Danger chips (allergies) turn red when selected.
- **Segmented** (Results, History tabs): `aria-pressed` toggle buttons, not the ARIA tab pattern. A white pill track with `shadow-card`, pinned under the header; the active one is a `butter` pill. Stars: filled `★` in amber-600, empty `☆` in `muted` (shape carries the state). Filter chips scroll with the list (only Menus pins its search and chips).
- **`RecipeCard`**: white card with a 56px `butter-soft` icon circle (drawn `StepIcon` by dish category), 18px title, a meta line, then one status line from `app/dishStatus.ts`: "ทำได้เลย" in `brand-deep`, or "ขาด N อย่าง: …" in amber. The ทำได้เลย tab on Results skips the ready line (the tab and hero already say it). No match % is shown. A chevron says "tap to open".
- **`CookMode`** (full screen, from "เริ่มทำ"): `brand` header, then the same zones in the same order on every step. (1) A pinned action band: 64px `butter-soft` icon circle, the verb at 34px (2.125rem) bold, and when the step uses the stove its heat right under the verb: three flames (lit: filled `flame` with a `butter` core; off: an empty `muted` outline) and the label ไฟอ่อน/กลาง/แรง in `flame-deep`, no pill. The band keeps one height with or without it, so nothing below it moves. (2) Under it, the part that scrolls: a white `rounded-3xl` card that hugs its content (the instruction at 22px (1.375rem), a `butter` timer tile when the step has a time, "ใช้ในขั้นนี้" ingredient pills with amounts), then the list of steps from the current one on (current row on a white card with a `butter` number, the rest quiet, ending with "เสร็จแล้ว ให้คะแนนเมนู"). The bottom bar is only back and the primary button (min 56px). Type sizes are fixed and in rem so they follow the text-size setting (34 / 22 / 16 px); free height is never filled by scaling type or stretching a card.
- **`StepIcon`**: one stroked icon per action kind (whisk, pan, pot, steam, knife, mortar, add, season, plate, generic).
- **`IngredientPicker`**: chosen items as `butter` chips with ×, a search box, quick-add pills, and "ดูวัตถุดิบทั้งหมด" for someone who does not know the name. Search (`app/ingredientSearch.ts`) ignores spaces and Thai tone marks and forgives one wrong letter; it only suggests catalog items. No match shows what was typed and a way to browse, never a dead end.
- **`SearchForm`**: everything a search is based on, in one component: ingredients (`IngredientPicker`), allergies, spice, and one primary button. It is the only ingredient screen: the typed-entry page (`/form`, `layout="page"`, pinned button bar) and the Results edit sheet (`layout="sheet"`) both render it, so picking and editing are the same screen. Allergies sit on `/form` too, because a manual pick has no confirm card to show them first.
- **`SearchSheet`**: `SearchForm` inside a bottom sheet (`rounded-t-3xl bg-white`) over a `bg-ink/40` backdrop. Escape or a backdrop tap closes it.
- **Results hero**: "ทำได้เลย N เมนู" in butter, "จากวัตถุดิบ N อย่าง", the ingredients as white pills, then the allergy + spice line and the one แก้ไข button (allergies in a white pill with `red-700` semibold, so the safety filter is always visible and passes contrast on teal).
- **Icons**: 24px stroked line icons (stroke 2, round caps) inside a `butter` circle. Same set in `app/page.tsx` and the rich menu.
- **Logo**: `public/logo.svg` (white MDi mark, transparent background). Use it on teal only. Favicon: `app/icon.svg`.

## Do and don't
- Do keep the touch targets: min 44px (`h-11`), primary buttons 48px.
- Do check every page at 375px.
- Don't use emoji as UI icons (the 🌶 spice markers and the ♥/★ glyphs are fine).
- Don't put text on `butter` in any color other than `ink`.
- Don't add new colors. If something needs one, add a token here first.

## LINE chat cards
Flex cards (`app/line/cards.ts`: scan prompt, confirm card, results carousel; `app/recipe/recipeCard.ts`; shared pieces in `app/line/flex.ts`) use the same tokens as hex: a `brand` header with white text, `ink` body, `muted` secondary text, amber `#b45309` for what is missing, and a `brand-deep` primary button. One button per card. Dish cards in the carousel use the same status line as the web `RecipeCard` (`app/dishStatus.ts`): title, meta, then "ทำได้เลย" or "ขาด N อย่าง: …". Cards sent from LIFF may only use link (URI) buttons.

## LINE rich menu
`design/rich-menu/rich-menu.html` uses the same palette and icons: Scan on `butter` at left, two rows (History, Menus) on `brand` with butter icon circles. Re-render it with the command in its README after any change.

- **Dialogs** (`SearchSheet`, `CookMode`): both use `useDialog` — focus moves in and back, Escape closes, Tab stays inside.
