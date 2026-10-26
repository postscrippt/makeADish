# LINE rich menu

The menu at the bottom of the LINE chat. It's a full-height menu (2500×1686): a big Scan tile on the left, with History and Menus stacked on the right.

- `rich-menu.png` is the image you upload (PNG, under 1 MB).
- `rich-menu.html` is the editable source. After editing, re-render it from this folder:
  ```bash
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --hide-scrollbars --force-device-scale-factor=1 --window-size=2500,1686 --virtual-time-budget=5000 --screenshot="$PWD/rich-menu.png" "file://$PWD/rich-menu.html"
  ```
- `rich-menu.json` holds the tap areas and links, for the API route below. The links already use the LIFF app (`https://liff.line.me/2012226850-YpXIkuN3/scan`, `/history`, `/menus`), so pages open as the LIFF app and can send cards into the chat. The Scan area sends the message "สแกนวัตถุดิบ", and the bot replies with camera buttons, so the photo is taken in the chat. **Upload this menu only after the webhook is switched on** (Use webhook = on); before that, tapping Scan gets no reply. See `docs/line-chat-flow.md`.

| Tile | x, y | width × height | Opens |
|---|---|---|---|
| สแกนวัตถุดิบ | 0, 0 | 1250 × 1686 | `/scan` |
| ประวัติ | 1250, 0 | 1250 × 843 | `/history` |
| เมนูทั้งหมด | 1250, 843 | 1250 × 843 | `/menus` |

## Set it up

**A. LINE Official Account Manager** (no code): go to Rich menus → Create, choose the Large size and a template whose areas match the table above, upload `rich-menu.png`, and set each area's action to Link. If no template has this split (half-width tile on the left, two rows on the right), use B.

**B. Messaging API** (any area layout). Run this locally with your channel access token. Never commit the token. Paste the commands rather than typing them: some keyboards turn `@` into a wide `＠`, which curl can't read. Each step should print `{}`; an HTML "Bad Request" page means it failed.
```bash
cd design/rich-menu                          # the commands read rich-menu.json and rich-menu.png from here
export LINE_CHANNEL_TOKEN="$(pbpaste)"       # copy the channel access token first (Developers console → Messaging API); never type it into a command
ID=$(curl -s -X POST https://api.line.me/v2/bot/richmenu -H "Authorization: Bearer $LINE_CHANNEL_TOKEN" -H "Content-Type: application/json" -d @rich-menu.json | sed 's/.*"richMenuId":"\([^"]*\)".*/\1/')
curl -s -X POST "https://api-data.line.me/v2/bot/richmenu/$ID/content" -H "Authorization: Bearer $LINE_CHANNEL_TOKEN" -H "Content-Type: image/png" --data-binary @rich-menu.png
curl -s -X POST "https://api.line.me/v2/bot/user/all/richmenu/$ID" -H "Authorization: Bearer $LINE_CHANNEL_TOKEN" -d ''   # -d '': LINE's edge rejects a POST with no body
```
