# Demo script

About 4 minutes. One presenter drives the phone, the other narrates. Practice it twice on the demo phone and network the day before.

## Before you start

- [ ] Phone charged, Do Not Disturb on, brightness up, screen mirroring tested
- [ ] Open the deployed URL (or LINE rich menu) once so it is warm
- [ ] Clear site data, then cook and rate ไข่เจียวหมูสับ (4 stars) once so History is not empty
- [ ] Profile allergy set to **อาหารทะเลมีเปลือก** (shellfish) for the safety moment
- [ ] Ingredients ready to photograph: pork, eggs, garlic, chili, holy basil
- [ ] Backup video open in another tab (see below)

## Script

| Time | Do | Say |
|---|---|---|
| 0:00 | Show the LINE chat with the rich menu | "Most recipe apps start from a dish. AI Menu starts from your kitchen, inside LINE, which most Thai users already have open." |
| 0:20 | Tap **สแกนวัตถุดิบ**, take the photo | "Take one photo of what you have." |
| 0:35 | Spinner, then Form with tags | "It reads the ingredients. You can fix anything it got wrong." Remove one tag, add **ไก่** by typing. |
| 1:00 | Point at the red allergy chips | "Allergies are a hard filter. The AI can never override them. Unknown allergen data means the recipe is never shown." |
| 1:15 | Tap **หาเมนู** | "Match % is plain code from ingredient overlap, not the AI guessing." |
| 1:30 | Show **ทำได้เลย**, then **ขาดอีกนิด** | "Can cook now, or missing just one or two things." |
| 1:50 | Open ผัดกะเพราหมู, change servings 1 → 2 | "Amounts scale; the match doesn't change. It tells you what to buy." |
| 2:15 | Tap **ทำเมนูนี้แล้ว**, give 5 stars | "Cooking it saves to your history." |
| 2:30 | Back, open **ประวัติ** | "History and favorites feed better suggestions next time." |
| 2:50 | Open **ถามผู้ช่วย**, ask "อยากกินต้มยำ" | "Ask anything. Watch: I'm allergic to shellfish, so it refuses to suggest tom yum goong." |
| 3:20 | Back to the rich menu | "Runs at zero cost: Next.js on Vercel, Supabase, Gemini free tier. Photos are never stored." |
| 3:40 | End | Questions |

## If something breaks

- **Scan fails or is slow:** "Let me skip the photo" → **ไม่ถ่ายรูป พิมพ์วัตถุดิบเอง**, type the ingredients.
- **Real endpoints down:** switch to the mock build (`NEXT_PUBLIC_USE_MOCKS=true` deploy) and keep going; the flow is identical.
- **Network down:** play the backup video.

## Backup recording

Record the script above on the demo phone (iOS: Control Center → Screen Recording; Android: Quick Settings → Screen record). Save it to `Drive / AI Menu / demo-backup.mp4` and on the laptop's desktop. Don't commit it to the repo.
