import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  assert.ok(fs.existsSync(absolutePath), `Expected file to exist: ${relativePath}`);
  return fs.readFileSync(absolutePath, 'utf8');
}

test('repo SDD workflow artifacts exist', () => {
  const expectedFiles = [
    'AGENTS.md',
    'docs/development-rules.md',
    'docs/features/README.md',
    'docs/features/sdd-feature-development.md',
    '.agents/skills/sdd-feature-development/SKILL.md',
    '.agents/skills/sdd-feature-development/references/doc-contract.md',
    '.agents/skills/sdd-feature-development/assets/feature-doc-template.md',
  ];

  for (const relativePath of expectedFiles) {
    assert.ok(fs.existsSync(path.join(root, relativePath)), `Missing required workflow artifact: ${relativePath}`);
  }
});

test('global development rules document defines the reusable rule layer', () => {
  const content = read('docs/development-rules.md');

  assert.match(content, /^# Development Rules/m);
  assert.match(content, /^## Purpose/m);
  assert.match(content, /^## Hard Constraints/m);
  assert.match(content, /^## Documentation Flow/m);
  assert.match(content, /^## Insight Promotion/m);
  assert.match(content, /docs\/features\/<feature>\.md/);
});

test('feature-doc index explains the living-doc workflow', () => {
  const content = read('docs/features/README.md');

  assert.match(content, /^# Feature Docs/m);
  assert.match(content, /living doc/i);
  assert.match(content, /docs-first/i);
  assert.match(content, /docs\/features\//);
});

test('dogfood feature doc contains the required metadata and sections', () => {
  const content = read('docs/features/sdd-feature-development.md');

  assert.match(content, /^---\n[\s\S]*status:/m);
  assert.match(content, /^---\n[\s\S]*entrypoints:/m);
  assert.match(content, /^---\n[\s\S]*hard_constraints:/m);
  assert.match(content, /^---\n[\s\S]*design_notes:/m);
  assert.match(content, /^---\n[\s\S]*last_updated:/m);

  assert.match(content, /^## Goal/m);
  assert.match(content, /^## Scope/m);
  assert.match(content, /^## File Structure/m);
  assert.match(content, /^## Current Design/m);
  assert.match(content, /^## Change Notes/m);
});

test('repo-local skill enforces docs-before-code and rule promotion', () => {
  const content = read('.agents/skills/sdd-feature-development/SKILL.md');

  assert.match(content, /^---\nname: sdd-feature-development/m);
  assert.match(content, /docs-first/i);
  assert.match(content, /No code before doc/i);
  assert.match(content, /docs\/features\/<feature>\.md/);
  assert.match(content, /docs\/development-rules\.md/);
  assert.match(content, /promote reusable insight/i);
});

test('doc contract and template capture the required feature-doc shape', () => {
  const contract = read('.agents/skills/sdd-feature-development/references/doc-contract.md');
  const template = read('.agents/skills/sdd-feature-development/assets/feature-doc-template.md');

  assert.match(contract, /status/);
  assert.match(contract, /entrypoints/);
  assert.match(contract, /hard_constraints/);
  assert.match(contract, /design_notes/);
  assert.match(contract, /last_updated/);
  assert.match(contract, /Goal/);
  assert.match(contract, /Scope/);
  assert.match(contract, /File Structure/);
  assert.match(contract, /Current Design/);
  assert.match(contract, /Change Notes/);

  assert.match(template, /^---\nstatus:/m);
  assert.match(template, /entrypoints:/);
  assert.match(template, /hard_constraints:/);
  assert.match(template, /design_notes:/);
  assert.match(template, /last_updated:/);
  assert.match(template, /^## Goal/m);
  assert.match(template, /^## Scope/m);
  assert.match(template, /^## File Structure/m);
  assert.match(template, /^## Current Design/m);
  assert.match(template, /^## Change Notes/m);
});

test('AGENTS entry instructions point sessions to the workflow', () => {
  const content = read('AGENTS.md');

  assert.match(content, /sdd-feature-development/);
  assert.match(content, /docs\/development-rules\.md/);
  assert.match(content, /docs\/features\/README\.md/);
  assert.match(content, /before feature implementation/i);
});
