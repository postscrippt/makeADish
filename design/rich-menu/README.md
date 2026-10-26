# LINE rich menu

The menu at the bottom of the LINE chat. It's a compact menu (2500×843): a big Scan tile on the left, with History, Menus and Ask stacked on the right.

- `rich-menu.png` is the image you upload (PNG, under 1 MB).
- `rich-menu.html` is the editable source. After editing, re-render it from this folder:
  ```bash
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --hide-scrollbars --force-device-scale-factor=1 --window-size=2500,843 --virtual-time-budget=5000 --screenshot="$PWD/rich-menu.png" "file://$PWD/rich-menu.html"
  ```
- `rich-menu.json` holds the tap areas and links, for the API route below. Swap the URLs for LIFF URLs once a LIFF app exists.

| Tile | x, y | width × height | Opens |
|---|---|---|---|
| สแกนวัตถุดิบ | 0, 0 | 1250 × 843 | `/scan` |
| ประวัติ | 1250, 0 | 1250 × 281 | `/history` |
| เมนูทั้งหมด | 1250, 281 | 1250 × 281 | `/menus` |
| ถามผู้ช่วย | 1250, 562 | 1250 × 281 | `/ask` |

## Set it up

**A. LINE Official Account Manager** (no code): go to Rich menus → Create, choose the Compact size and a template whose areas match the table above, upload `rich-menu.png`, and set each area's action to Link. If no template has this split (half-width tile on the left, three rows on the right), use B.

**B. Messaging API** (any area layout). Run this locally with your channel access token. Never commit the token.
```bash
export LINE_CHANNEL_TOKEN=...   # LINE Developers console → Messaging API → Channel access token
ID=$(curl -s -X POST https://api.line.me/v2/bot/richmenu -H "Authorization: Bearer $LINE_CHANNEL_TOKEN" -H "Content-Type: application/json" -d @rich-menu.json | sed 's/.*"richMenuId":"\([^"]*\)".*/\1/')
curl -s -X POST "https://api-data.line.me/v2/bot/richmenu/$ID/content" -H "Authorization: Bearer $LINE_CHANNEL_TOKEN" -H "Content-Type: image/png" --data-binary @rich-menu.png
curl -s -X POST "https://api.line.me/v2/bot/user/all/richmenu/$ID" -H "Authorization: Bearer $LINE_CHANNEL_TOKEN"
```
