# Repo SDD Docs Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a repo-local skill and supporting docs that enforce docs-first feature development for `personal-web`.

**Architecture:** Keep the workflow simple and repo-native. Store the durable contract in repo docs, keep the skill concise and reference those docs, and validate the setup with root-level contract tests so regressions are easy to catch.

**Tech Stack:** Markdown docs, repo-local Codex skill files, Node test runner

---

### Task 1: Lock The Contract With Failing Tests

**Files:**
- Create: `tests/repoSddDocsSkill.test.mjs`

- [ ] **Step 1: Write failing tests for the expected artifact set**

Cover:
- repo-level `AGENTS.md`
- `docs/development-rules.md`
- `docs/features/README.md`
- `docs/features/sdd-feature-development.md`
- `.agents/skills/sdd-feature-development/SKILL.md`
- `.agents/skills/sdd-feature-development/references/doc-contract.md`
- `.agents/skills/sdd-feature-development/assets/feature-doc-template.md`

- [ ] **Step 2: Write failing tests for required content**

Assert:
- the global rules doc exists and contains durable-rule sections
- the feature-doc index explains naming and maintenance
- the dogfood feature doc contains the required metadata fields and required sections
- the skill enforces docs-before-code and insight promotion

- [ ] **Step 3: Run the targeted test and confirm failure**

Run: `node --test tests/repoSddDocsSkill.test.mjs`
Expected: FAIL because the files do not exist yet

### Task 2: Dogfood The Workflow With A Feature Living Doc

**Files:**
- Create: `docs/features/README.md`
- Create: `docs/features/sdd-feature-development.md`

- [ ] **Step 1: Create the feature-doc index**

Explain:
- feature docs live under `docs/features/`
- they are living docs
- every feature change starts by updating the relevant doc

- [ ] **Step 2: Create the first feature living doc for this work**

Include metadata:
- `status`
- `entrypoints`
- `hard_constraints`
- `design_notes`
- `last_updated`

- [ ] **Step 3: Add the required body sections**

Include:
- `Goal`
- `Scope`
- `File Structure`
- `Current Design`
- `Change Notes`

### Task 3: Create The Global Development Rules Document

**Files:**
- Create: `docs/development-rules.md`

- [ ] **Step 1: Write the compact purpose and usage framing**

Clarify:
- this doc stores reusable project-level rules
- feature-local context stays in feature docs

- [ ] **Step 2: Add the initial durable rule set**

Cover:
- docs-first feature development
- feature-doc update expectations
- file-size and abstraction guardrails
- when to promote an insight from a feature doc to this document

- [ ] **Step 3: Keep the document lean**

Do not turn it into:
- a changelog
- duplicated feature-level notes
- generic slogans

### Task 4: Implement The Repo-Local Skill

**Files:**
- Create: `.agents/skills/sdd-feature-development/SKILL.md`
- Create: `.agents/skills/sdd-feature-development/references/doc-contract.md`
- Create: `.agents/skills/sdd-feature-development/assets/feature-doc-template.md`

- [ ] **Step 1: Write the skill metadata and trigger conditions**

Make the skill repo-specific and clearly scoped to:
- feature development in this repo
- docs-first workflow enforcement

- [ ] **Step 2: Write the skill body**

Enforce:
- identify the feature first
- open or create the feature doc first
- update metadata and required sections before implementation
- update the doc again after implementation
- promote reusable insights into `docs/development-rules.md`

- [ ] **Step 3: Move the detailed contract into the reference file**

Document:
- required metadata fields
- required body sections
- index and rules-doc relationship

- [ ] **Step 4: Add the reusable feature-doc template**

Include:
- metadata scaffold
- required sections
- brief usage hints

### Task 5: Connect Repo-Level Instructions And Refresh The Dogfood Doc

**Files:**
- Create: `AGENTS.md`
- Modify: `docs/features/sdd-feature-development.md`

- [ ] **Step 1: Add a concise repo entry instruction file**

Tell future sessions:
- this repo uses docs-first feature development
- the repo-local skill must be used before feature implementation
- durable rules live in `docs/development-rules.md`

- [ ] **Step 2: Update the dogfood feature doc to reflect shipped reality**

Refresh:
- `status`
- `entrypoints`
- `File Structure`
- `Current Design`
- `Change Notes`

### Task 6: Verify The Contract End To End

**Files:**
- Modify as needed based on verification output

- [ ] **Step 1: Run the targeted contract test**

Run: `node --test tests/repoSddDocsSkill.test.mjs`
Expected: PASS

- [ ] **Step 2: Run the root test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Inspect the changed files for drift against the spec**

Verify:
- the skill stays concise
- docs hold the durable contract
- the feature doc reflects the final file layout
