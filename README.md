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

## What it does NOT do

- **No `.astro` source mapping** — Astro doesn't annotate rendered DOM with source files. The captured selector and outerHTML are usually enough context for an AI to find the right component.
- **No production output** — uses Astro's dev toolbar API; nothing ships in your build.

## License

MIT
