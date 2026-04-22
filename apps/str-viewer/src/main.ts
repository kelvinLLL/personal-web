import "./styles.css";
import { formatStringForReading, type StringView } from "./stringFormatter";

const sampleText =
  '"system: 你是一个严谨的助手\\n\\nuser: 请整理这段 prompt：\\\\n- 保留引号\\n- 展示换行\\n- 不执行任何代码"';

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <a class="skip-link" href="#source-input">跳到输入</a>
  <section class="shell">
    <header class="topbar">
      <div class="brand-block">
        <span class="brand-mark" aria-hidden="true">SV</span>
        <div>
          <p class="eyebrow">STR VIEWER</p>
          <h1>字符串阅读器</h1>
        </div>
      </div>
      <div class="actions" aria-label="工具">
        <button id="sample-button" type="button" class="ghost-button">示例</button>
        <button id="clear-button" type="button" class="ghost-button">清空</button>
        <button id="copy-button" type="button">复制结果</button>
      </div>
    </header>

    <main id="main-content" class="workspace" aria-label="字符串阅读工作区">
      <label class="pane input-pane">
        <span class="panel-title">
          <span>输入</span>
          <span>RAW</span>
        </span>
        <textarea id="source-input" spellcheck="false" autocomplete="off"></textarea>
      </label>

      <section class="pane output-pane" aria-label="格式化输出">
        <div class="output-head">
          <div>
            <span class="panel-title">
              <span>输出</span>
              <span>FORMATTED</span>
            </span>
          </div>
          <div id="stats-line" class="stats-grid" aria-label="格式化统计"></div>
          <div id="notice-list" class="notices"></div>
        </div>
        <div id="line-output" class="line-output" aria-live="polite"></div>
      </section>
    </main>

    <p id="copy-feedback" class="sr-status" aria-live="polite"></p>
  </section>
`;

const sourceInput = must<HTMLTextAreaElement>("#source-input");
const sampleButton = must<HTMLButtonElement>("#sample-button");
const clearButton = must<HTMLButtonElement>("#clear-button");
const copyButton = must<HTMLButtonElement>("#copy-button");
const statsLine = must<HTMLDivElement>("#stats-line");
const noticeList = must<HTMLDivElement>("#notice-list");
const lineOutput = must<HTMLDivElement>("#line-output");
const copyFeedback = must<HTMLParagraphElement>("#copy-feedback");

sourceInput.value = sampleText;
render();

sourceInput.addEventListener("input", render);

sampleButton.addEventListener("click", () => {
  sourceInput.value = sampleText;
  sourceInput.focus();
  render();
});

clearButton.addEventListener("click", () => {
  sourceInput.value = "";
  sourceInput.focus();
  render();
});

copyButton.addEventListener("click", async () => {
  const view = formatStringForReading(sourceInput.value);

  try {
    await navigator.clipboard.writeText(view.readable);
    setCopyState("已复制", "已复制格式化结果");
  } catch {
    setCopyState("复制失败", "复制失败，请手动选中输出内容");
  }

  window.setTimeout(() => {
    setCopyState("复制结果", "");
  }, 1200);
});

function render(): void {
  const view = formatStringForReading(sourceInput.value);
  renderStats(view);
  renderNotices(view.notices);
  renderLines(view);
}

function renderStats(view: StringView): void {
  statsLine.replaceChildren(
    createStat("行", String(view.stats.lines)),
    createStat("字符", String(view.stats.characters)),
    createStat("可见", String(view.stats.visibleCharacters)),
  );
}

function createStat(label: string, value: string): HTMLElement {
  const item = document.createElement("span");
  item.className = "stat-item";

  const valueNode = document.createElement("strong");
  valueNode.textContent = value;

  const labelNode = document.createElement("span");
  labelNode.textContent = label;

  item.append(valueNode, labelNode);

  return item;
}

function renderNotices(notices: string[]): void {
  noticeList.replaceChildren();
  noticeList.hidden = notices.length === 0;

  for (const notice of notices) {
    const item = document.createElement("span");
    item.textContent = notice;
    noticeList.append(item);
  }
}

function renderLines(view: StringView): void {
  lineOutput.replaceChildren();

  for (const line of view.lines) {
    const row = document.createElement("div");
    row.className = "line-row";

    const gutter = document.createElement("span");
    gutter.className = "line-number";
    gutter.textContent = String(line.number);

    const content = document.createElement("pre");
    content.className = line.empty ? "line-text is-empty" : "line-text";
    content.textContent = line.empty ? "空行" : line.text;

    row.append(gutter, content);
    lineOutput.append(row);
  }
}

function setCopyState(label: string, message: string): void {
  copyButton.textContent = label;
  copyFeedback.textContent = message;
}

function must<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Missing element: ${selector}`);
  }

  return element;
}
