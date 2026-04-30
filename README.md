# astro-click-to-ai

Astro Dev Toolbar plugin that captures clicked elements with annotations for AI coding assistants. Includes an MCP server with resource and channel support — clicks arrive live in your AI session.

## Install

```bash
npm install -D astro-click-to-ai
```

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import clickToAi from "astro-click-to-ai";

export default defineConfig({
  integrations: [clickToAi()],
});
```

On first `npm run dev`, the integration automatically:
- Adds `.astroclick` to `.gitignore`
- Configures the MCP server in `.mcp.json`

## Workflow

1. `npm run dev` — the toolbar shows a clipboard icon.
2. Toggle the app on. A side panel opens and a hover highlight follows your cursor.
3. Click any element. A note popup appears inline — type what you want changed, then press **Enter** to add it (or **Escape** to add without a note).
4. Repeat for more elements. Edit notes in the side panel, remove items with x, or clear all.
5. Your AI assistant receives the clicks:
   - **MCP channel** — clicks push live into Claude Code sessions
   - **MCP resource** — `click-to-ai://clicks` returns pending captures (drains on read)
   - **File** — `@.astroclick` for clients without MCP support
6. Toggle off — clicks pass through normally.

## MCP Server

The package includes a stdio MCP server (no SDK dependency, pure JSON-RPC). It's auto-configured in `.mcp.json` on first run.

**Resource** `click-to-ai://clicks` — returns captured clicks, drains on read. Works with any MCP client.

**Channel** — pushes new clicks live as `<channel source="click-to-ai">` events. For Claude Code, start with:

```bash
claude --dangerously-load-development-channels server:click-to-ai
```

The file is cleared on each `npm run dev` and capped at 50 items.

## Captured fields

Each entry contains:

```ts
type CapturedClick = {
  timestamp: string; // ISO timestamp
  url: string; // full page URL
  pathname: string; // pathname only
  tag: string; // lowercase tag name
  id: string; // element id, if any
  classes: string[]; // class list
  selector: string; // computed CSS selector path
  text: string; // truncated textContent (200 chars)
  outerHtml: string; // truncated outerHTML (600 chars)
  rect: { x: number; y: number; width: number; height: number };
  note: string; // your annotation
};
```

## AI assistant prompt

Copy and paste this into your AI assistant to set up the plugin:

```
Install astro-click-to-ai and add it to astro.config.mjs:

npm install -D astro-click-to-ai

Then add clickToAi() to the integrations array:

import clickToAi from "astro-click-to-ai";
export default defineConfig({ integrations: [clickToAi()] });

Run npm run dev — it auto-configures .mcp.json and .gitignore.

When I click elements in the browser, they arrive via MCP channel or the
click-to-ai://clicks resource. Each entry has a selector, outerHtml, and
a note field describing what I want changed. Use selector and outerHtml to
find the element in src/, then follow the note.
```

## What it does NOT do

- **No `.astro` source mapping** — Astro doesn't annotate rendered DOM with source files. The captured selector and outerHTML are usually enough context for an AI to find the right component.
- **No production output** — uses Astro's dev toolbar API; nothing ships in your build.

## License

MIT
