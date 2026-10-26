# MakeADish design system

Taken from the pitch deck: deep teal, butter yellow, white cards with very soft corners, pill shapes, a rounded geometric font. Tokens live in `app/globals.css` (`@theme`). Use the token classes (`bg-brand`, `text-muted`, …), never raw hex or Tailwind's zinc/gray.

## Colors

| Token | Hex | Use |
|---|---|---|
| `brand` | `#09809d` | Page headers, home hero, desktop backdrop |
| `brand-deep` | `#066a82` | Primary buttons, user chat bubble, stepper icons |
| `ink` | `#0b3a47` | Body text and headings |
| `muted` | `#4f6e78` | Secondary text, unselected chips |
| `edge` | `#cfe3e9` | Borders, dividers, disabled fills, empty stars |
| `mist` | `#eaf5f8` | Page background behind cards |
| `butter` | `#f6e39a` | Accent: selected chips and tabs, match % badge, step numbers, icon circles, Scan tile |
| `butter-soft` | `#fbf3d2` | Pressed state on cards |
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
| Page title (header) | `text-xl font-bold text-white` |
| Recipe title | `text-2xl font-bold` |
| Section heading | `text-lg font-semibold` |
| Card title | `text-base`–`text-lg font-semibold` |
| Body | `text-base` |
| Meta and hints | `text-sm`/`text-xs text-muted` |

## Shape and depth
- Cards: `rounded-3xl bg-white shadow-card`, no border.
- Inline notes and alerts: `rounded-2xl`.
- Buttons, chips, tabs, inputs, badges: `rounded-full` (pills).
- Teal surfaces get rounded bottoms (`rounded-b-3xl` header, `rounded-b-[2.5rem]` home hero) so white cards appear to sit on them.
- One shadow: `shadow-card` (soft, teal-tinted). No other shadows.

## Components
- **`btn-primary`** (utility in `globals.css`): `brand-deep` pill, white semibold, min height 48px, greys out when disabled. One per screen.
- **`btn-secondary`**: white pill with an `edge` ring. For alternatives (e.g. "เลือกจากคลังภาพ").
- **`PageHeader`**: sticky `brand` bar, back chevron, white bold title.
- **`Chip`**: unselected is white with an `edge` border and `muted` text. Selected is `butter` with `ink` text. Danger chips (allergies) turn red when selected.
- **Tabs** (Results, History): a white pill track with `shadow-card`; the active tab is a `butter` pill.
- **`RecipeCard`**: white card, `butter` match % pill, amber "ขาดอีก" line.
- **`StepsTimeline`** (วิธีทำ): a 3px `edge` line through 48px circles. Done = `brand` circle with a white check; upcoming = white circle with an `edge` ring; the current step is a white `rounded-3xl` card with a `butter-soft` art area (72px `StepIcon`), the verb at 26px bold, the detail in `muted`, and pills. Heat pill: `mist`, three stroked flames (lit ones full, the rest at 25% opacity) plus ไฟอ่อน/กลาง/แรง. Time pill: `butter`, "⏱ N นาที · เริ่ม" → countdown. One sticky bottom button, min 56px.
- **`StepIcon`**: one stroked icon per action kind (whisk, pan, pot, steam, knife, mortar, add, season, plate, generic).
- **`PrefsSheet`**: bottom sheet (`rounded-t-3xl bg-white`) over a `bg-ink/40` backdrop. Escape or a backdrop tap closes it.
- **Preferences line** (check screen): one white card; allergies in `red-700` semibold so the safety filter is always visible.
- **Icons**: 24px stroked line icons (stroke 2, round caps) inside a `butter` circle. Same set in `app/page.tsx` and the rich menu.
- **Logo**: `public/logo.svg` (white MDi mark, transparent background). Use it on teal only. Favicon: `app/icon.svg`.

## Do and don't
- Do keep the touch targets: min 44px (`h-11`), primary buttons 48px.
- Do check every page at 375px.
- Don't use emoji as UI icons (the 🌶 spice markers and the ♥/★ glyphs are fine).
- Don't put text on `butter` in any color other than `ink`.
- Don't add new colors. If something needs one, add a token here first.

## LINE rich menu
`design/rich-menu/rich-menu.html` uses the same palette and icons: Scan on `butter` at left, two rows (History, Menus) on `brand` with butter icon circles. Re-render it with the command in its README after any change.
