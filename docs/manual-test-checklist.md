# Manual test checklist

Tick each box (`[x]`) when it passes, and write the date and tester. Run the whole list on mock data first, then again on real endpoints and on the deployed URL.

Tester: ______  Date: ______  Build: mock / real / deployed  Device: ______

## Phone layout (about 375px wide)

- [ ] Every page: no sideways scrolling, no cut-off or overlapping Thai text
- [ ] Every button and link is easy to tap (about a fingertip, 44px)
- [ ] Tested on a real phone, not only a resized browser

## New user (clear site data first)

- [ ] Home shows the 3 tiles: สแกนวัตถุดิบ, ประวัติ, เมนูทั้งหมด
- [ ] History shows the empty message and a button to start scanning
- [ ] Results opened directly says no ingredients were chosen and links to Scan
- [ ] The check screen (`/form`) shows "ยังไม่ได้ระบุอาหารที่แพ้ · เผ็ดน้อย" and "ตั้งค่า"

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

## Check screen (`/form`)

- [ ] Header says "เจอวัตถุดิบ N อย่าง"; scanned ingredients appear as big chips
- [ ] × removes a chip; "+ เพิ่ม" opens the search box
- [ ] With nothing scanned: header "เพิ่มวัตถุดิบ", search box already open and focused
- [ ] Typing Thai (ไก่), English (chicken) or an alias (หมูสับ) finds the ingredient; tapping adds it
- [ ] Typing something unknown shows "ไม่พบวัตถุดิบนี้"
- [ ] "หาเมนู" is disabled with no ingredients
- [ ] "ตั้งค่า"/"แก้ไข" opens the sheet; Escape or tapping outside closes it; focus returns to the button
- [ ] Saved allergies show in red on the line ("แพ้: …") and are remembered on the next visit

## Results

- [ ] Loading spinner shows
- [ ] "ทำได้เลย" lists recipes with nothing missing; "ขาดวัตถุดิบอีกนิด" lists recipes missing 1-2 items, with the items named
- [ ] Match % looks right for 3 recipes checked by hand
- [ ] **Allergy safety:** for at least 5 different allergens, no recipe in either tab contains the saved allergen
- [ ] No recipe is shown whose allergen data is unknown (mock: หมูทอดกระเทียม never appears)
- [ ] Spicier-than-chosen recipes are not shown
- [ ] Food-type pills (ทั้งหมด · ผัด · ต้ม …) filter both tabs and update the counts
- [ ] A pill with nothing in the current tab shows "ไม่มีเมนู…ในแท็บนี้" and "ดูทั้งหมด" restores the list
- [ ] Nothing found shows the empty message and "แก้วัตถุดิบ" (mock: `/results?mock=empty`)
- [ ] Failure shows the error and "ลองอีกครั้ง" works (mock: `/results?mock=error`)

## Recipe

- [ ] Missing ingredients are tagged ขาด and listed in "ต้องซื้อเพิ่ม"; ingredients show "สำหรับ N ที่" and no servings control
- [ ] "ใช้อะไรแทนได้?" on ซอสหอยนางรม shows ซีอิ๊วดำ + น้ำตาล; with a soy allergy it shows "ไม่มีตัวแทนที่ปลอดภัยสำหรับคุณ"
- [ ] Error state: `/recipe/pad-kra-pao-moo?from=results&mock=error` → "ใช้อะไรแทนได้?" shows "โหลดไม่สำเร็จ" and retry
- [ ] Opening from Menus (no search) shows no ขาด tags
- [ ] ♡ / ♥ favorite toggles and is remembered
- [ ] วิธีทำ: the current step is a big card (icon, verb, detail); "ขั้นต่อไป" checks it off and opens the next; tapping any step jumps to it
- [ ] ไข่ตุ๋น step 3 shows ไฟกลาง flames and "⏱ 15 นาที · เริ่ม"; the timer counts down, pauses on tap, and resets when you switch step
- [ ] Last step's "เสร็จแล้ว ให้คะแนนเมนูนี้" → stars → "บันทึก" saves; the dish appears in History right away
- [ ] Screen stays on during steps (real phone)
- [ ] Timer vibrates at zero (Android)
- [ ] A bad recipe link shows "ไม่พบสูตรอาหารนี้"

## History

- [ ] "ที่เคยทำ" lists cooked dishes with stars and Thai date, newest first
- [ ] "เมนูโปรด" lists favorites, including ones never cooked
- [ ] Un-favoriting removes it from the favorites tab

## Menus

- [ ] All recipes listed; search works in Thai (ไข่) and English (omelette)
- [ ] Category chips filter the list
- [ ] Dishes with a saved allergen are hidden, with a note saying which allergy

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
