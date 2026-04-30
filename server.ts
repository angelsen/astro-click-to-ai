#!/usr/bin/env node
import { readFileSync, writeFileSync, watch, existsSync } from "node:fs";
import { createInterface } from "node:readline";
import { resolve } from "node:path";

const FILE = resolve(process.cwd(), "astroclick");
const URI = "click-to-ai://clicks";
const INSTRUCTIONS =
  "Click-to-AI captures arrive as <channel source=\"click-to-ai\"> when the user clicks " +
  "elements in the Astro dev preview. Each entry has a selector, outerHtml, and note field. " +
  "Use selector and outerHtml to find the element in src/, then follow the note. " +
  "Read the click-to-ai://clicks resource to get all pending captures (drains on read).";

let initialized = false;
const pending: object[] = [];

function send(msg: object) {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

function pushChannel(content: string, meta?: Record<string, string>) {
  const msg = {
    jsonrpc: "2.0",
    method: "notifications/claude/channel",
    params: { content, meta },
  };
  if (!initialized) {
    pending.push(msg);
    return;
  }
  send(msg);
}

function readClicks(): string {
  try {
    return readFileSync(FILE, "utf8");
  } catch {
    return "[]";
  }
}

function handle(msg: { id?: number; method: string; params?: any }) {
  const { id, method } = msg;

  if (method === "initialize") {
    send({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        serverInfo: { name: "click-to-ai", version: "0.2.0" },
        capabilities: {
          resources: {},
          experimental: { "claude/channel": {} },
        },
        instructions: INSTRUCTIONS,
      },
    });
    return;
  }

  if (method === "notifications/initialized") {
    initialized = true;
    for (const queued of pending) send(queued);
    pending.length = 0;
    return;
  }

  if (method === "resources/list") {
    send({
      jsonrpc: "2.0",
      id,
      result: {
        resources: [
          {
            uri: URI,
            name: "Captured clicks",
            description:
              "Elements clicked in the Astro dev preview with annotations. Drains on read.",
            mimeType: "application/json",
          },
        ],
      },
    });
    return;
  }

  if (method === "resources/read") {
    const content = readClicks();
    try {
      writeFileSync(FILE, "[]", "utf8");
    } catch {}
    send({
      jsonrpc: "2.0",
      id,
      result: {
        contents: [{ uri: URI, mimeType: "application/json", text: content }],
      },
    });
    return;
  }

  if (method === "resources/templates/list") {
    send({
      jsonrpc: "2.0",
      id,
      result: { resourceTemplates: [] },
    });
    return;
  }

  if (id != null) {
    send({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `method not found: ${method}` },
    });
  }
}

// NDJSON over stdin
const rl = createInterface({ input: process.stdin });
rl.on("line", (line) => {
  try {
    handle(JSON.parse(line));
  } catch {}
});

// Watch directory for file creation + changes
let debounce: ReturnType<typeof setTimeout>;
const DIR = resolve(FILE, "..");
const BASENAME = "astroclick";

watch(DIR, (_, filename) => {
  if (filename !== BASENAME) return;
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    const raw = readClicks();
    try {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        pushChannel(raw, { count: String(list.length) });
        try { writeFileSync(FILE, "[]", "utf8"); } catch {}
      }
    } catch {}
  }, 100);
});
