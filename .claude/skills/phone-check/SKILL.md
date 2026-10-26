---
name: phone-check
description: Check the app at phone width (375px): start the dev server, screenshot pages via Playwright MCP, report layout issues. Use after UI changes or before opening a PR.
---

Check the app at phone width. Routes to check: `$ARGUMENTS` (default `/`).

1. Make sure the dev server is up on http://localhost:3000. If not, start `npm run dev` in the background and remember you started it.
2. `mcp__playwright__browser_resize` to 375×812.
3. For each route: `mcp__playwright__browser_navigate`, then `mcp__playwright__browser_take_screenshot`.
4. Look for: horizontal scroll or overflow, tap targets under ~44px, cut-off or overlapping Thai text, missing loading/error/empty states.
5. Report findings per route with file suggestions. Don't fix anything unless asked.
6. If you started the dev server, stop it.
