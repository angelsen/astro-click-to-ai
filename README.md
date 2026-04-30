# astro-click-to-ai

Astro Dev Toolbar app that captures clicked elements as a JSON list with annotations for AI coding assistants.

Toggle the app on, click elements to build up a list, add notes describing what you want changed, then reference `@astroclick` in your AI assistant.

## Install

```bash
npm install -D astro-click-to-ai
```

## Use

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import clickToAi from "astro-click-to-ai";

export default defineConfig({
  integrations: [clickToAi()],
});
```

The `astroclick` output file is automatically added to `.gitignore` on first run.

## Workflow

1. `npm run dev` — the toolbar shows a clipboard icon.
2. Toggle the app on. A side panel opens and a hover highlight follows your cursor.
3. Click any element. A note popup appears inline — type what you want changed, then press **Enter** to add it (or **Escape** to add without a note).
4. Repeat for more elements. Edit notes in the side panel, remove items with x, or clear all.
5. In your AI assistant: `@astroclick do these changes`.
6. Toggle off — clicks pass through normally.

## Captured fields

Each entry in `astroclick` contains:

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

When I reference @astroclick, read the file. Each entry has a selector, outerHtml, and
a note field describing what I want changed. Use selector and outerHtml to find the
element in src/, then follow the note.
```

## MCP Server (optional)

The package includes a stdio MCP server that watches `astroclick` and exposes it to MCP-aware tools. No SDK dependency — pure JSON-RPC over stdio.

**Features:**
- **Resource** `click-to-ai://clicks` — returns captured clicks, drains on read
- **Channel** — pushes new clicks live into Claude Code sessions as they happen

**Setup:**

```bash
claude mcp add --scope project click-to-ai npx astro-click-to-ai
```

Or add to `.mcp.json`:

```json
{
  "mcpServers": {
    "click-to-ai": {
      "command": "npx",
      "args": ["astro-click-to-ai"]
    }
  }
}
```

With the MCP server running, you don't need `@astroclick` — clicks arrive automatically as channel events, and any MCP client can read the `click-to-ai://clicks` resource.

## What it does NOT do

- **No `.astro` source mapping** — Astro doesn't annotate rendered DOM with source files. The captured selector and outerHTML are usually enough context for an AI to find the right component.
- **No production output** — uses Astro's dev toolbar API; nothing ships in your build.

## License

MIT
