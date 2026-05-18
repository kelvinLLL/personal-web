import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLifeLogEntry } from '../life-log/src/parse-entry.mjs';

const validEntry = `---
date: 2026-05-17
title: 婚礼、正反馈和一块拼图
mood: 感慨
source: voice-transcript
visibility: private
tags:
  - 婚礼
  - 探索生活
---

## 今日发生的事

- 去参加婚礼。
- 想到未来的拼图签到。

## 今日核心感悟

我还在学习如何从别人的正反馈里走向自己的确认。

## 整理版

今天参加婚礼，看到朋友进入人生的新阶段。

## 札记版

那块拼图像是人生里每段关系留下的位置。

## 原始记录

今天去参加贝贝和他老婆的婚礼了。
`;

test('parseLifeLogEntry extracts frontmatter, sections, bullets, and excerpt', () => {
  const entry = parseLifeLogEntry(validEntry, '2026-05-17-wedding.md');

  assert.equal(entry.slug, '2026-05-17-wedding');
  assert.equal(entry.date, '2026-05-17');
  assert.equal(entry.title, '婚礼、正反馈和一块拼图');
  assert.equal(entry.mood, '感慨');
  assert.deepEqual(entry.tags, ['婚礼', '探索生活']);
  assert.deepEqual(entry.sections.events, ['去参加婚礼。', '想到未来的拼图签到。']);
  assert.equal(entry.sections.insight, '我还在学习如何从别人的正反馈里走向自己的确认。');
  assert.equal(entry.excerpt, '我还在学习如何从别人的正反馈里走向自己的确认。');
});

test('parseLifeLogEntry rejects entries missing a required section', () => {
  const missingRaw = validEntry.replace(/\n## 原始记录\n\n今天去参加贝贝和他老婆的婚礼了。\n/, '\n');

  assert.throws(
    () => parseLifeLogEntry(missingRaw, 'bad.md'),
    /Missing required section: 原始记录/,
  );
});

test('parseLifeLogEntry rejects entries missing required frontmatter', () => {
  const missingTitle = validEntry.replace('title: 婚礼、正反馈和一块拼图\n', '');

  assert.throws(
    () => parseLifeLogEntry(missingTitle, 'bad.md'),
    /Missing required frontmatter: title/,
  );
});
