import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import lucide from "@iconify-json/lucide/icons.json" with { type: "json" };
import type { ClickList } from "./types.ts";

const APP_ID = "click-to-ai";
const EVENT = `${APP_ID}:save`;
const OUTPUT_FILE = "TODO";

const ICON_NAME = "crosshair";
const lucideIcon = lucide.icons[ICON_NAME];
const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lucide.width} ${lucide.height}">${lucideIcon.body}</svg>`;

export default function clickToAi(): AstroIntegration {
  let outputPath = "";

  return {
    name: APP_ID,
    hooks: {
      "astro:config:setup": ({ addDevToolbarApp, config }) => {
        outputPath = fileURLToPath(new URL(OUTPUT_FILE, config.root));
        addDevToolbarApp({
          id: APP_ID,
          name: "Click to AI",
          icon: ICON,
          entrypoint: new URL("./app.ts", import.meta.url),
        });
      },
      "astro:server:setup": ({ toolbar }) => {
        toolbar.on<ClickList>(EVENT, (list) => {
          writeFileSync(outputPath, JSON.stringify(list, null, 2), "utf8");
        });
      },
    },
  };
}
