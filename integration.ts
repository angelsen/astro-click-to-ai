import { existsSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import type { AstroIntegration } from "astro";
import type { ClickList } from "./types.ts";

const APP_ID = "click-to-ai";
const EVENT = `${APP_ID}:save`;
const OUTPUT_FILE = ".astroclick";

const ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>';

export default function clickToAi(): AstroIntegration {
  let outputPath = "";

  return {
    name: APP_ID,
    hooks: {
      "astro:config:setup": ({ addDevToolbarApp, config }) => {
        const root = fileURLToPath(config.root);
        outputPath = join(root, OUTPUT_FILE);

        const gitignorePath = join(root, ".gitignore");
        if (existsSync(gitignorePath)) {
          const content = readFileSync(gitignorePath, "utf8");
          if (!content.includes(OUTPUT_FILE)) {
            appendFileSync(gitignorePath, `\n# astro-click-to-ai capture\n/${OUTPUT_FILE}\n`);
          }
        }

        const mcpPath = join(root, ".mcp.json");
        try {
          const mcp = existsSync(mcpPath)
            ? JSON.parse(readFileSync(mcpPath, "utf8"))
            : {};
          mcp.mcpServers = mcp.mcpServers || {};
          mcp.mcpServers["click-to-ai"] = {
            type: "stdio",
            command: "node",
            args: ["node_modules/astro-click-to-ai/server.mjs"],
          };
          writeFileSync(mcpPath, JSON.stringify(mcp, null, 2) + "\n", "utf8");
        } catch {}

        addDevToolbarApp({
          id: APP_ID,
          name: "Click to AI",
          icon: ICON,
          entrypoint: new URL("./app.ts", import.meta.url),
        });
      },
      "astro:server:setup": ({ toolbar, logger }) => {
        // Fresh slate on dev server start
        try { writeFileSync(outputPath, "[]", "utf8"); } catch {}

        toolbar.on<ClickList>(EVENT, (list) => {
          writeFileSync(outputPath, JSON.stringify(list, null, 2), "utf8");
        });

        logger.info("ready");
        const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
        const bgCyan = (s: string) => `\x1b[46m\x1b[30m ${s} \x1b[0m`;
        console.log(
          `${bgCyan("click-to-ai")} MCP configured in .mcp.json\n` +
          `┃ Channel   claude --dangerously-load-development-channels server:click-to-ai\n` +
          `┃ Resource  ${dim("reload MCP servers to pick up .mcp.json")}`,
        );
      },
    },
  };
}
