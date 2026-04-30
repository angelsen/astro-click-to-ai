# astro-click-to-ai

Astro Dev Toolbar app that captures clicked-element context as JSON for use with AI coding assistants.

When the toolbar app is active, clicking any element in the dev preview writes `last-click.json` at the project root. Reference it in Claude (or Cursor, Windsurf, etc.) as `@last-click.json` so the assistant knows exactly which element to edit.

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

Add to `.gitignore`:

```
last-click.json
```

## Workflow

1. Run `npm run dev`.
2. Click the **Click to AI** icon in the Astro dev toolbar to toggle on. Cursor turns into a crosshair.
3. Click any element on the page. A highlight appears, the toolbar window confirms the capture, and `last-click.json` is written at the project root.
4. In your AI assistant: `@last-click.json change this button's hover state to teal-300`.
5. Toggle off — clicks pass through to the page normally.

## Captured fields

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
};
```

## What it does NOT do

- **No `.astro` source mapping** — Astro doesn't annotate rendered DOM with source files. The captured selector and outerHTML are usually enough context for an AI to find the right component.
- **No history** — only the most recent click is preserved. Click again to refresh.
- **No production output** — uses Astro's dev toolbar API; nothing ships in your build.

## License

MIT
