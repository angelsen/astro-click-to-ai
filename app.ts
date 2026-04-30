import { defineToolbarApp } from "astro/toolbar";
import type { CapturedClick, ClickList } from "./types.ts";

const APP_ID = "click-to-ai";
const EVENT = `${APP_ID}:save`;
const MAX_TEXT = 200;
const MAX_HTML = 600;
const SNIPPET_PREVIEW = 50;

function buildSelector(el: Element): string {
  const parts: string[] = [];
  let current: Element | null = el;
  while (current && current !== document.body && parts.length < 5) {
    let part = current.tagName.toLowerCase();
    if (current.id) {
      parts.unshift(`${part}#${current.id}`);
      break;
    }
    const cls = Array.from(current.classList).slice(0, 2).join(".");
    if (cls) part += `.${cls}`;
    parts.unshift(part);
    current = current.parentElement;
  }
  return parts.join(" > ");
}

function capture(el: Element): CapturedClick {
  const rect = el.getBoundingClientRect();
  return {
    timestamp: new Date().toISOString(),
    url: location.href,
    pathname: location.pathname,
    tag: el.tagName.toLowerCase(),
    id: el.id,
    classes: Array.from(el.classList),
    selector: buildSelector(el),
    text: (el.textContent ?? "").trim().slice(0, MAX_TEXT),
    outerHtml: el.outerHTML.slice(0, MAX_HTML),
    rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    note: "",
  };
}

function truncate(val: string, max: number): string {
  return val.length > max ? val.slice(0, max - 1) + "\u2026" : val;
}

const PANEL_STYLES = `
:host {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: linear-gradient(0deg, #13151a, #13151a), linear-gradient(0deg, #343841, #343841);
  border: 1px solid rgba(52, 56, 65, 1);
  border-radius: 12px;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  color: rgba(191, 193, 201, 1);
  position: fixed;
  z-index: 2000000009;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  width: 350px;
  min-height: 200px;
  max-height: 420px;
  padding: 0;
  overflow: hidden;
  box-shadow:
    0px 0px 0px 0px rgba(19, 21, 26, 0.3),
    0px 1px 2px 0px rgba(19, 21, 26, 0.29),
    0px 4px 4px 0px rgba(19, 21, 26, 0.26),
    0px 10px 6px 0px rgba(19, 21, 26, 0.15),
    0px 17px 7px 0px rgba(19, 21, 26, 0.04),
    0px 26px 7px 0px rgba(19, 21, 26, 0.01);
}

@media (forced-colors: active) {
  :host { background: white; }
}

hr {
  border: 1px solid rgba(27, 30, 36, 1);
  margin: 0;
  width: 100%;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px;
  gap: 8px;
}

h1 {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.count-badge {
  font-size: 13px;
  padding: 2px 8px;
  border-radius: 8px;
  background: rgba(138, 75, 255, 0.2);
  color: rgba(183, 153, 255, 1);
  font-weight: 600;
}

.count-badge.empty {
  background: rgba(61, 184, 108, 0.2);
  color: rgba(61, 184, 108, 1);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.clear-btn {
  background: transparent;
  border: 1px solid rgba(52, 56, 65, 1);
  color: rgba(191, 193, 201, 1);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

#click-list {
  display: flex;
  flex-direction: column;
  overflow: auto;
  overscroll-behavior: contain;
  height: 100%;
}

.item {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-bottom: 1px solid #1F2433;
  text-align: left;
  width: 100%;
  font-family: inherit;
  color: inherit;
  cursor: default;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.item-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.item-tag {
  display: inline-block;
  color: white;
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 2px 6px;
  margin-right: 6px;
  flex-shrink: 0;
}

.item-text {
  font-size: 13px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-selector {
  font-size: 11px;
  color: rgba(191, 193, 201, 0.6);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-btn {
  background: transparent;
  border: none;
  color: rgba(191, 193, 201, 0.4);
  font-size: 16px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  flex-shrink: 0;
  font-family: inherit;
  line-height: 1;
}

.remove-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px;
  text-align: center;
  gap: 8px;
}

.empty-state p {
  margin: 0;
  font-size: 13px;
  color: rgba(191, 193, 201, 0.6);
  line-height: 1.5;
}

.empty-state .hint {
  font-size: 12px;
  margin-top: 4px;
}

.item-note {
  box-sizing: border-box;
  width: 100%;
  margin-top: 6px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  font-family: inherit;
  outline: none;
  resize: none;
}

.item-note::placeholder {
  color: rgba(191, 193, 201, 0.35);
}

.item-note:focus {
  border-color: rgba(138, 75, 255, 0.5);
  background: rgba(255, 255, 255, 0.06);
}
`;

class ClickToAiPanel extends HTMLElement {
  shadowRoot: ShadowRoot;
  private list: ClickList;
  private onClear: () => void;
  private onRemove: (idx: number) => void;
  private onNote: (idx: number, note: string) => void;

  constructor(
    list: ClickList,
    onClear: () => void,
    onRemove: (idx: number) => void,
    onNote: (idx: number, note: string) => void,
  ) {
    super();
    this.list = list;
    this.onClear = onClear;
    this.onRemove = onRemove;
    this.onNote = onNote;
    this.shadowRoot = this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>${PANEL_STYLES}</style>
      <header>
        <h1>Click to AI</h1>
        <div class="header-right">
          <span class="count-badge empty">0</span>
          <button class="clear-btn">Clear</button>
        </div>
      </header>
      <hr />
      <div id="click-list"></div>
    `;
    this.shadowRoot
      .querySelector(".clear-btn")!
      .addEventListener("click", () => this.onClear());
  }

  render() {
    const badge = this.shadowRoot.querySelector(".count-badge")!;
    badge.textContent = String(this.list.length);
    badge.className = "count-badge" + (this.list.length === 0 ? " empty" : "");

    const container = this.shadowRoot.getElementById("click-list")!;
    container.innerHTML = "";

    if (this.list.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.innerHTML = `
        <p>Click any element on the page to capture it.</p>
        <p class="hint">Captured elements are saved to <code>TODO</code></p>
      `;
      container.appendChild(empty);
      return;
    }

    this.list.forEach((entry, idx) => {
      const item = document.createElement("div");
      item.className = "item";

      const row = document.createElement("div");
      row.className = "item-row";

      const tag = document.createElement("span");
      tag.className = "item-tag";
      tag.textContent = truncate(entry.tag, 10);

      const info = document.createElement("div");
      info.className = "item-info";

      const text = document.createElement("div");
      text.className = "item-text";
      const preview = entry.text.slice(0, SNIPPET_PREVIEW) || entry.selector;
      text.textContent = truncate(preview, SNIPPET_PREVIEW);

      const sel = document.createElement("div");
      sel.className = "item-selector";
      sel.textContent = entry.selector;

      info.append(text, sel);

      const remove = document.createElement("button");
      remove.className = "remove-btn";
      remove.textContent = "\u00d7";
      remove.title = "Remove";
      remove.addEventListener("click", (e) => {
        e.stopPropagation();
        this.onRemove(idx);
      });

      row.append(tag, info, remove);

      const note = document.createElement("input");
      note.className = "item-note";
      note.type = "text";
      note.placeholder = "Add note\u2026";
      note.value = entry.note;
      let debounce: ReturnType<typeof setTimeout>;
      note.addEventListener("input", () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => this.onNote(idx, note.value), 300);
      });

      item.append(row, note);
      container.appendChild(item);
    });
  }
}

try {
  customElements.define("astro-click-to-ai-panel", ClickToAiPanel);
} catch {}

export default defineToolbarApp({
  init(canvas, app, server) {
    const list: ClickList = [];

    const panel = new ClickToAiPanel(
      list,
      () => {
        list.length = 0;
        panel.render();
        server.send(EVENT, list);
      },
      (idx) => {
        list.splice(idx, 1);
        panel.render();
        server.send(EVENT, list);
      },
      (idx, note) => {
        list[idx].note = note;
        server.send(EVENT, list);
      },
    );
    panel.style.display = "none";
    canvas.appendChild(panel);
    panel.render();

    // Hover highlight overlay
    const highlight = document.createElement("div");
    highlight.style.cssText =
      "position: fixed; pointer-events: none; z-index: 2000000008; border: 2px solid rgba(138, 75, 255, 0.7); background: rgba(138, 75, 255, 0.08); border-radius: 3px; display: none; transition: all 0.05s ease-out;";
    const label = document.createElement("div");
    label.style.cssText =
      "position: absolute; top: -22px; left: -2px; background: rgba(138, 75, 255, 0.85); color: #fff; font: 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace; padding: 2px 6px; border-radius: 3px 3px 0 0; white-space: nowrap;";
    highlight.appendChild(label);
    document.documentElement.appendChild(highlight);

    const onMouseMove = (e: MouseEvent) => {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target || target.closest("astro-dev-toolbar")) {
        highlight.style.display = "none";
        return;
      }
      const rect = target.getBoundingClientRect();
      highlight.style.display = "block";
      highlight.style.top = rect.top + "px";
      highlight.style.left = rect.left + "px";
      highlight.style.width = rect.width + "px";
      highlight.style.height = rect.height + "px";
      let tag = target.tagName.toLowerCase();
      if (target.id) tag += `#${target.id}`;
      else if (target.classList.length) tag += `.${target.classList[0]}`;
      label.textContent = tag;
      label.style.top = rect.top < 24 ? "0px" : "-22px";
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest("astro-dev-toolbar")) return;
      e.preventDefault();
      e.stopPropagation();

      list.push(capture(target));
      panel.render();
      server.send(EVENT, list);
    };

    app.onToggled(({ state }) => {
      panel.style.display = state ? "flex" : "none";
      highlight.style.display = "none";

      if (state) {
        document.addEventListener("click", onClick, { capture: true });
        document.addEventListener("mousemove", onMouseMove);
      } else {
        document.removeEventListener("click", onClick, { capture: true });
        document.removeEventListener("mousemove", onMouseMove);
      }
    });
  },
});
