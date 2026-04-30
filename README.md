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

Add to `.gitignore`:

```
/astroclick
```

## Workflow

1. Run `npm run dev`.
2. Click the **Click to AI** icon in the Astro dev toolbar to toggle on.
3. Hover over elements — a live highlight shows what you're about to select.
4. Click to capture. Each element appears as a card in the side panel.
5. Add a note to each item describing what you want changed.
6. Remove individual items with the x button, or clear all.
7. In your AI assistant: `@astroclick do these changes`.
8. Toggle off — clicks pass through to the page normally.

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
