# Manual test checklist

Tick each box (`[x]`) when it passes, and write the date and tester. Run the whole list on mock data first, then again on real endpoints and on the deployed URL.

Tester: ______  Date: ______  Build: mock / real / deployed  Device: ______

## Phone layout (about 375px wide)

- [ ] Every page: no sideways scrolling, no cut-off or overlapping Thai text
- [ ] Every button and link is easy to tap (about a fingertip, 44px)
- [ ] Tested on a real phone, not only a resized browser

## New user (clear site data first)

- [ ] Home shows the 4 tiles: สแกนวัตถุดิบ, ประวัติ, เมนูทั้งหมด, ถามผู้ช่วย
- [ ] History shows the empty message and a button to start scanning
- [ ] Results opened directly says no ingredients were chosen and links to Scan
- [ ] Form starts with no allergies, เผ็ดน้อย, 2 ที่

## Scan

- [ ] "ถ่ายรูป" opens the camera on a phone
- [ ] "เลือกจากคลังภาพ" opens the photo picker
- [ ] A spinner shows while scanning, and buttons are disabled
- [ ] About 10 real photos in varied lighting: at least 8 list the main ingredients correctly (real endpoints only)
- [ ] Blurry photo shows the blurry message (mock: `/scan?mock=blurry`)
- [ ] Non-food photo shows the no-food message (mock: `/scan?mock=nofood`)
- [ ] Failure shows the error message, and "ลองสแกนอีกครั้ง" works (mock: `/scan?mock=error`)
- [ ] "หรือ พิมพ์วัตถุดิบเอง" goes to Form
- [ ] The photo is not saved anywhere after the scan (nothing in Network uploads except the scan call)

## Form

- [ ] Scanned ingredients appear as tags
- [ ] × removes a tag
- [ ] Typing Thai (ไก่), English (chicken) or an alias (หมูสับ) finds the ingredient; tapping adds it
- [ ] Typing something unknown shows "ไม่พบวัตถุดิบนี้"
- [ ] "หาเมนู" is disabled with no ingredients
- [ ] Allergies, spice and servings are remembered on the next visit

## Results

- [ ] Loading spinner shows
- [ ] "ทำได้เลย" lists recipes with nothing missing; "ขาดวัตถุดิบอีกนิด" lists recipes missing 1-2 items, with the items named
- [ ] Match % looks right for 3 recipes checked by hand
- [ ] **Allergy safety:** for at least 5 different allergens, no recipe in either tab contains the saved allergen
- [ ] No recipe is shown whose allergen data is unknown (mock: หมูทอดกระเทียม never appears)
- [ ] Spicier-than-chosen and other-category recipes are not shown
- [ ] Nothing found shows the empty message and "แก้เงื่อนไข" (mock: `/results?mock=empty`)
- [ ] Failure shows the error and "ลองอีกครั้ง" works (mock: `/results?mock=error`)

## Recipe

- [ ] Changing servings changes amounts (1/2 → 1 when doubling) but never the match
- [ ] Missing ingredients are tagged ขาด and listed in "ต้องซื้อเพิ่ม"
- [ ] Opening from Menus (no search) shows no ขาด tags
- [ ] ♡ / ♥ favorite toggles and is remembered
- [ ] "ทำเมนูนี้แล้ว" → stars → "บันทึก" saves; the dish appears in History right away
- [ ] A bad recipe link shows "ไม่พบสูตรอาหารนี้"

## History

- [ ] "ที่เคยทำ" lists cooked dishes with stars and Thai date, newest first
- [ ] "เมนูโปรด" lists favorites, including ones never cooked
- [ ] Un-favoriting removes it from the favorites tab

## Menus

- [ ] All recipes listed; search works in Thai (ไข่) and English (omelette)
- [ ] Category chips filter the list
- [ ] Dishes with a saved allergen are hidden, with a note saying which allergy

## Ask

- [ ] Starter questions send and get an answer with recipe links
- [ ] "กำลังพิมพ์…" shows while waiting
- [ ] A question about a dish you are allergic to says so instead of suggesting it
- [ ] Failure shows "ตอบไม่สำเร็จ" and "ลองอีกครั้ง" works (mock: `/ask?mock=error`)

## Slow and offline

- [ ] Throttle to "Slow 4G" in browser dev tools: every page shows a loading state, nothing looks frozen
- [ ] Go offline mid-flow: an error message with a retry shows, never a blank page
- [ ] Unknown URL shows "ไม่พบหน้านี้"

## Content

- [ ] A Thai speaker read every page's UI text and about 5 recipes (note fixes below)
- [ ] About 20 LLM-tagged recipes spot-checked by hand for allergens (Person B)

## Deployed

- [ ] Full demo flow works on the deployed URL, on the demo phone and network
- [ ] Opening a tile from the LINE rich menu lands on the right page

Notes:
