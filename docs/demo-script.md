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
| 0:00 | Show the LINE chat with the rich menu | "Most recipe apps start from a dish. MakeADish starts from your kitchen, inside LINE, which most Thai users already have open." |
| 0:20 | Tap **สแกนวัตถุดิบ**, take the photo | "Take one photo of what you have." |
| 0:35 | Spinner, then the check screen | "It reads the ingredients and asks one question: is this right?" Remove one chip, tap **+ เพิ่ม**, add **ไก่**. Point at the red allergy line. |
| 1:00 | Point at the red "แพ้: …" line, tap **แก้ไข** to show the sheet | "Allergies are a hard filter. The AI can never override them. Unknown allergen data means the recipe is never shown." |
| 1:15 | Tap **หาเมนู** | "Match % is plain code from ingredient overlap, not the AI guessing." |
| 1:30 | Show **ทำได้เลย**, then **ขาดวัตถุดิบอีกนิด** | "Can cook now, or missing just one or two things." |
| 1:50 | Open ผัดกะเพราหมู, tap **ใช้อะไรแทนได้?** on ซอสหอยนางรม | "Missing something? It suggests a swap, and never one you're allergic to." |
| 2:15 | Step through วิธีทำ with **ขั้นต่อไป**; on the last step tap **เสร็จแล้ว ให้คะแนนเมนูนี้**, give 5 stars | "One big step at a time, readable from the counter. Finishing saves it to your history." |
| 2:30 | Back, open **ประวัติ** | "History and favorites feed better suggestions next time." |
| 2:50 | Open **เมนูทั้งหมด** | "Browse every dish. I'm allergic to shellfish, so tom yum goong is hidden, and it says why." |
| 3:20 | Back to the rich menu | "Runs at zero cost: Next.js on Vercel, Supabase, Gemini free tier. Photos are never stored." |
| 3:40 | End | Questions |

## If something breaks

- **Scan fails or is slow:** "Let me skip the photo" → **หรือ พิมพ์วัตถุดิบเอง**, type the ingredients.
- **Real endpoints down:** switch to the mock build (`NEXT_PUBLIC_USE_MOCKS=true` deploy) and keep going; the flow is identical.
- **Network down:** play the backup video.

## Backup recording

Record the script above on the demo phone (iOS: Control Center → Screen Recording; Android: Quick Settings → Screen record). Save it to `Drive / MakeADish / demo-backup.mp4` and on the laptop's desktop. Don't commit it to the repo.
