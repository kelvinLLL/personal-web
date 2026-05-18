import path from 'node:path';

const REQUIRED_FRONTMATTER = ['date', 'title', 'mood', 'source', 'visibility', 'tags'];

const REQUIRED_SECTIONS = {
  events: '今日发生的事',
  insight: '今日核心感悟',
  edited: '整理版',
  literary: '札记版',
  raw: '原始记录',
};

export function parseLifeLogEntry(markdown, filename) {
  const { frontmatter, body } = parseFrontmatter(markdown, filename);

  for (const key of REQUIRED_FRONTMATTER) {
    if (frontmatter[key] === undefined || frontmatter[key] === '') {
      throw new Error(`Missing required frontmatter: ${key}`);
    }
  }

  if (!Array.isArray(frontmatter.tags) || frontmatter.tags.length === 0) {
    throw new Error('Missing required frontmatter: tags');
  }

  const sectionsByTitle = parseSections(body);
  const sections = {};

  for (const [key, title] of Object.entries(REQUIRED_SECTIONS)) {
    const value = sectionsByTitle.get(title);
    if (!value) {
      throw new Error(`Missing required section: ${title}`);
    }
    sections[key] = key === 'events' ? parseEventBullets(value) : value;
  }

  return {
    slug: slugFromFilename(filename),
    date: frontmatter.date,
    title: frontmatter.title,
    mood: frontmatter.mood,
    source: frontmatter.source,
    visibility: frontmatter.visibility,
    tags: frontmatter.tags,
    excerpt: makeExcerpt(sections.insight),
    sections,
  };
}

function parseFrontmatter(markdown, filename) {
  const normalized = markdown.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    throw new Error(`Missing frontmatter in ${filename}`);
  }

  return {
    frontmatter: parseFrontmatterBlock(match[1]),
    body: match[2],
  };
}

function parseFrontmatterBlock(block) {
  const data = {};
  let listKey = null;

  for (const rawLine of block.split('\n')) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      continue;
    }

    const listItem = line.match(/^\s*-\s+(.+)$/);
    if (listItem && listKey) {
      data[listKey].push(cleanValue(listItem[1]));
      continue;
    }

    const keyValue = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (!keyValue) {
      throw new Error(`Invalid frontmatter line: ${line}`);
    }

    const [, key, value = ''] = keyValue;
    if (value === '') {
      data[key] = [];
      listKey = key;
      continue;
    }

    data[key] = cleanValue(value);
    listKey = null;
  }

  return data;
}

function parseSections(body) {
  const sections = new Map();
  let currentTitle = null;
  let currentLines = [];

  for (const line of body.split('\n')) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      if (currentTitle) {
        sections.set(currentTitle, currentLines.join('\n').trim());
      }
      currentTitle = heading[1];
      currentLines = [];
      continue;
    }

    if (currentTitle) {
      currentLines.push(line);
    }
  }

  if (currentTitle) {
    sections.set(currentTitle, currentLines.join('\n').trim());
  }

  return sections;
}

function parseEventBullets(content) {
  const bullets = content
    .split('\n')
    .map((line) => line.match(/^\s*-\s+(.+)$/)?.[1]?.trim())
    .filter(Boolean);

  if (bullets.length === 0) {
    throw new Error('Missing event bullets in section: 今日发生的事');
  }

  return bullets;
}

function makeExcerpt(content) {
  return content.replace(/\s+/g, ' ').trim().slice(0, 140);
}

function cleanValue(value) {
  return value.trim().replace(/^['"]|['"]$/g, '');
}

function slugFromFilename(filename) {
  return path.basename(filename, path.extname(filename));
}
