import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseLifeLogEntry } from '../src/parse-entry.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const lifeLogRoot = path.resolve(scriptDir, '..');
const entriesDir = path.join(lifeLogRoot, 'data', 'entries');
const generatedDir = path.join(lifeLogRoot, 'generated');

async function main() {
  const entries = await readEntries();

  entries.sort((left, right) => {
    if (left.date !== right.date) {
      return right.date.localeCompare(left.date);
    }
    return left.slug.localeCompare(right.slug);
  });

  await fs.mkdir(generatedDir, { recursive: true });
  await fs.writeFile(
    path.join(generatedDir, 'entries.json'),
    `${JSON.stringify({ entries }, null, 2)}\n`,
  );
  await fs.writeFile(path.join(generatedDir, 'index.html'), renderPreview(entries));

  console.log(`Generated ${entries.length} Life Log entr${entries.length === 1 ? 'y' : 'ies'}.`);
}

async function readEntries() {
  const filenames = (await fs.readdir(entriesDir))
    .filter((filename) => filename.endsWith('.md'))
    .sort();

  return Promise.all(
    filenames.map(async (filename) => {
      const markdown = await fs.readFile(path.join(entriesDir, filename), 'utf8');
      return parseLifeLogEntry(markdown, filename);
    }),
  );
}

function renderPreview(entries) {
  const entryCards = entries.map(renderEntry).join('\n');

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Life Log Preview</title>
    <style>
      :root {
        color: #1f2933;
        background: #f7f3ed;
        font-family: ui-serif, "Songti SC", "Noto Serif CJK SC", Georgia, serif;
      }
      body {
        margin: 0;
      }
      main {
        max-width: 820px;
        margin: 0 auto;
        padding: 56px 20px 80px;
      }
      header {
        margin-bottom: 36px;
      }
      h1 {
        margin: 0 0 10px;
        font-size: 36px;
        line-height: 1.15;
      }
      .subtitle {
        margin: 0;
        color: #667085;
        font-size: 16px;
      }
      article {
        border-top: 1px solid #d6cec1;
        padding: 32px 0 40px;
      }
      h2 {
        margin: 0 0 8px;
        font-size: 28px;
        line-height: 1.25;
      }
      h3 {
        margin: 28px 0 10px;
        font-size: 17px;
      }
      p, li {
        font-size: 17px;
        line-height: 1.75;
      }
      .meta, .tags {
        color: #667085;
        font-size: 14px;
      }
      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 14px;
      }
      .tag {
        border: 1px solid #d6cec1;
        border-radius: 999px;
        padding: 3px 9px;
        background: #fffaf2;
      }
      details {
        margin-top: 30px;
        border: 1px solid #d6cec1;
        border-radius: 8px;
        padding: 14px 16px;
        background: #fffaf2;
      }
      summary {
        cursor: pointer;
        font-weight: 600;
      }
      pre {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        font-family: ui-sans-serif, system-ui, sans-serif;
        line-height: 1.65;
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>Life Log</h1>
        <p class="subtitle">A quiet archive for voice notes, small events, and the self that is slowly becoming.</p>
      </header>
      ${entryCards}
    </main>
  </body>
</html>
`;
}

function renderEntry(entry) {
  return `<article>
  <p class="meta">${escapeHtml(entry.date)} · ${escapeHtml(entry.mood)} · ${escapeHtml(entry.visibility)}</p>
  <h2>${escapeHtml(entry.title)}</h2>
  <div class="tags">${entry.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
  <h3>今日发生的事</h3>
  <ul>
    ${entry.sections.events.map((event) => `<li>${escapeHtml(event)}</li>`).join('\n    ')}
  </ul>
  <h3>今日核心感悟</h3>
  ${renderParagraphs(entry.sections.insight)}
  <h3>整理版</h3>
  ${renderParagraphs(entry.sections.edited)}
  <h3>札记版</h3>
  ${renderParagraphs(entry.sections.literary)}
  <details>
    <summary>原始记录</summary>
    <pre>${escapeHtml(entry.sections.raw)}</pre>
  </details>
</article>`;
}

function renderParagraphs(text) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim())}</p>`)
    .join('\n  ');
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

await main();
