import type { CommunityMarketplaceEntry } from '@/features/skill-marketplace/model/marketplace'

export const communityCatalog: CommunityMarketplaceEntry[] = [
  {
    id: 'community-vercel-platform-toolkit',
    slug: 'vercel-platform-toolkit',
    name: 'Vercel Platform Toolkit',
    artifactType: 'plugin',
    ownerType: 'community',
    summary: 'A plugin-backed bundle for deployments, docs, and browser verification inside one workflow.',
    whyItMatters: 'It keeps shipping and verification tasks close to the coding loop instead of scattering them across tabs and CLIs.',
    categories: ['automation', 'frontend'],
    compatibility: ['codex'],
    status: 'active',
    sourceName: 'Vercel',
    sourceUrl: 'https://vercel.com',
    docsUrl: 'https://vercel.com/docs',
    detail: {
      overview:
        'This is the kind of external toolkit worth shelving because it compresses deploy, inspect, and browser-check flows into one place.',
      usageContext: [
        'Verifying a frontend after a dev server starts.',
        'Looking up deployment or runtime context without leaving the editor.',
        'Keeping release verification close to the implementation loop.',
      ],
      links: [
        {
          label: 'Vercel Docs',
          url: 'https://vercel.com/docs',
        },
      ],
    },
    featured: true,
    signals: {
      curationReason:
        'It is a strong example of a plugin that changes daily developer flow instead of only adding surface area.',
      sourceReputation: 'Official Vercel platform tooling.',
      ecosystemSignal: 'Frequently referenced in modern web-app shipping workflows.',
      lastReviewed: '2026-04-15',
      trustLevel: 'high',
      differentiation:
        'It combines platform knowledge, deployment inspection, and browser verification in one stack.',
    },
  },
  {
    id: 'community-openai-docs-skill',
    slug: 'openai-docs-skill',
    name: 'OpenAI Docs Skill',
    artifactType: 'skill',
    ownerType: 'community',
    summary: 'A documentation-focused skill that biases toward official, current OpenAI sources.',
    whyItMatters: 'It is useful whenever the answer depends on stable primary docs rather than memory or blog posts.',
    categories: ['documentation', 'research'],
    compatibility: ['codex', 'cross-compatible'],
    status: 'active',
    sourceName: 'OpenAI',
    sourceUrl: 'https://platform.openai.com/docs',
    docsUrl: 'https://platform.openai.com/docs',
    detail: {
      overview:
        'This skill is valuable because it encodes a source discipline: prefer official docs, cite them, and avoid guessing on fast-moving API details.',
      usageContext: [
        'Choosing current models and endpoints.',
        'Answering implementation questions that need citations.',
        'Reducing drift when product behavior changes quickly.',
      ],
      links: [
        {
          label: 'OpenAI Docs',
          url: 'https://platform.openai.com/docs',
        },
      ],
    },
    featured: true,
    signals: {
      curationReason:
        'It is a strong reference shelf item because it improves both answer quality and source hygiene.',
      sourceReputation: 'Official product documentation.',
      ecosystemSignal: 'Useful across agent workflows that need current OpenAI guidance.',
      lastReviewed: '2026-04-15',
      trustLevel: 'high',
      differentiation:
        'The value is not generic prompting advice; it is the insistence on current primary documentation.',
    },
  },
  {
    id: 'community-playwright-mcp-toolkit',
    slug: 'playwright-mcp-toolkit',
    name: 'Playwright MCP Toolkit',
    artifactType: 'plugin',
    ownerType: 'community',
    summary: 'A browser-automation pick for verifying end-to-end UI behavior instead of guessing from code alone.',
    whyItMatters: 'It gives testing and verification work a visible browser loop when UI details matter.',
    categories: ['testing', 'automation', 'frontend'],
    compatibility: ['codex', 'cross-compatible'],
    status: 'watching',
    sourceName: 'Playwright ecosystem',
    sourceUrl: 'https://playwright.dev',
    docsUrl: 'https://playwright.dev',
    detail: {
      overview:
        'This belongs in the curated shelf because visual verification catches classes of issues that unit tests and static inspection miss.',
      usageContext: [
        'Checking whether a page actually renders after a route change.',
        'Verifying browser behavior for forms, filters, and responsive layouts.',
        'Collecting screenshots or snapshots for UI sanity checks.',
      ],
      links: [
        {
          label: 'Playwright',
          url: 'https://playwright.dev',
        },
      ],
    },
    featured: false,
    signals: {
      curationReason:
        'It is worth watching because it turns browser verification into a first-class development action.',
      sourceReputation: 'Well-known browser automation ecosystem.',
      ecosystemSignal: 'Commonly used where UI verification needs to go beyond DOM assertions.',
      lastReviewed: '2026-04-15',
      trustLevel: 'medium',
      differentiation:
        'Its strength is real browser feedback, not another abstraction layer over static rendering tests.',
    },
  },
]
