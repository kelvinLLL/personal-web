import type { PersonalMarketplaceEntry } from '@/features/skill-marketplace/model/marketplace'

export const personalCatalog: PersonalMarketplaceEntry[] = [
  {
    id: 'personal-sdd-feature-development',
    slug: 'sdd-feature-development',
    name: 'SDD Feature Development',
    artifactType: 'skill',
    ownerType: 'personal',
    summary: 'A docs-first repo skill that keeps feature work anchored in living docs.',
    whyItMatters: 'It prevents feature work from jumping straight into code before boundaries are written down.',
    categories: ['workflow', 'documentation'],
    compatibility: ['claude-code', 'codex'],
    status: 'active',
    sourceName: 'Repo-local skill',
    sourceUrl: null,
    docsUrl: null,
    detail: {
      overview:
        'This skill turns feature delivery into a docs-first loop: identify the feature, update its living doc, then implement and sync the doc again.',
      usageContext: [
        'Starting a new feature in personal-web.',
        'Revisiting a partially-designed feature after the shape drifted.',
        'Keeping repo-level rules separate from feature-local decisions.',
      ],
      links: [],
    },
    featured: true,
    signals: {
      maturity: 'stable',
      reuseFrequency: 'high',
      lastUpdated: '2026-04-13',
      usedIn: ['personal-web feature delivery', 'repo-local agent setup'],
      keyConstraints: [
        'No code before the feature doc is updated.',
        'Feature docs must reflect current code reality, not speculative architecture.',
      ],
      keyInsights: [
        'Durable rules belong in docs/development-rules.md, not scattered across features.',
        'A small living doc is enough if it captures scope, file ownership, and current design.',
      ],
      workflowWeakness:
        'It fixes the tendency to improvise structure in code first and explain it later.',
    },
  },
  {
    id: 'personal-curating-interesting-trends',
    slug: 'curating-interesting-trends',
    name: 'Curating Interesting Trends',
    artifactType: 'skill',
    ownerType: 'personal',
    summary: 'A research curation workflow for turning scattered signals into ranked editorial output.',
    whyItMatters: 'It keeps research work consistent across discovery, ranking, and publishing passes.',
    categories: ['research', 'documentation'],
    compatibility: ['codex', 'cross-compatible'],
    status: 'active',
    sourceName: 'Daily Nuance skill set',
    sourceUrl: null,
    docsUrl: null,
    detail: {
      overview:
        'This skill packages the discovery-to-publication flow for interesting AI, programming, and psychology signals so the output stays editorial rather than noisy.',
      usageContext: [
        'Refreshing Daily Nuance snapshots.',
        'Ranking candidate signals by heat and staying power.',
        'Keeping source quality signals visible during curation.',
      ],
      links: [],
    },
    featured: true,
    signals: {
      maturity: 'growing',
      reuseFrequency: 'medium',
      lastUpdated: '2026-04-14',
      usedIn: ['Daily Nuance refresh runs', 'editorial trend research'],
      keyConstraints: [
        'Preserve source quality and novelty signals instead of collapsing everything into one score.',
        'Keep incremental history so ranking changes stay explainable.',
      ],
      keyInsights: [
        'Editorial value improves when the taxonomy is explicit before ranking starts.',
        'Typed mirrors beat runtime markdown parsing when UI state needs to stay predictable.',
      ],
      workflowWeakness:
        'It fixes research drift where interesting finds accumulate without a reusable ranking frame.',
    },
  },
  {
    id: 'personal-test-driven-development',
    slug: 'test-driven-development',
    name: 'Test-Driven Development',
    artifactType: 'skill',
    ownerType: 'personal',
    summary: 'A strict red-green-refactor loop that keeps feature work honest.',
    whyItMatters: 'It proves new behavior is actually covered instead of being asserted after the fact.',
    categories: ['testing', 'workflow'],
    compatibility: ['claude-code', 'codex', 'cross-compatible'],
    status: 'active',
    sourceName: 'Superpowers workflow',
    sourceUrl: null,
    docsUrl: null,
    detail: {
      overview:
        'This skill insists on writing the failing test first, verifying the failure, and then implementing the smallest change that gets back to green.',
      usageContext: [
        'Adding a new route or component contract.',
        'Changing behavior in shared utilities.',
        'Protecting refactors from accidental regressions.',
      ],
      links: [],
    },
    featured: false,
    signals: {
      maturity: 'stable',
      reuseFrequency: 'high',
      lastUpdated: '2026-04-14',
      usedIn: ['frontend feature work', 'bugfix passes'],
      keyConstraints: [
        'No production code without a failing test first.',
        'A passing test written after the implementation does not prove coverage.',
      ],
      keyInsights: [
        'The red step is as important as the green step.',
        'Minimal tests are easier to trust and easier to maintain.',
      ],
      workflowWeakness:
        'It fixes the habit of relying on manual spot-checks when behavior changes.',
    },
  },
]
