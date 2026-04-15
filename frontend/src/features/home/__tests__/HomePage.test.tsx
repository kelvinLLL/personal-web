import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, renderWithRouter } from '@/test/utils'
import { HomePage } from '@/features/home/page/HomePage'

const fetchIdeas = vi.fn()

const ideasStoreState = {
  ideas: [
    {
      id: 'idea-1',
      title: 'Signal-first Project Finder',
      tagline: 'Turn interesting signals into concrete build candidates.',
      category: 'tool' as const,
      status: 'pending' as const,
      scores: {
        value: 9,
        learnability: 7,
        fun: 8,
        feasibility: 7,
        overall: 9,
      },
      detail: {
        why_interesting: 'Interesting',
        why_worth_doing: 'Worth doing',
        references: [],
        tech_hints: ['react'],
        effort: 'M' as const,
      },
      meta: {
        discovered_at: '2026-04-13T00:00:00.000Z',
        source: 'manual' as const,
      },
    },
  ],
  fetchIdeas,
}

vi.mock('@/features/ideas/store/useIdeasStore', () => ({
  useIdeasStore: (selector: (state: typeof ideasStoreState) => unknown) => selector(ideasStoreState),
}))

vi.mock('@/features/daily-nuance/api/dailyNuanceApi', () => ({
  loadDailyNuanceSnapshot: vi.fn().mockResolvedValue({
    snapshot_date: '2026-04-13',
    overview: {
      new_fancy: [
        {
          entity_id: 'nuance-1',
          slug: 'fresh-signal',
          title: 'Fresh Signal',
          summary: 'Interesting',
          canonical_url: 'https://example.com',
          kind: 'article',
          source_names: ['hn'],
          domains: ['ai'],
          first_seen_on: '2026-04-13',
          last_seen_on: '2026-04-13',
          scores: {
            new_fancy: 80,
            proven_rising: 60,
            freshness: 100,
            momentum: 90,
            authority: 70,
          },
        },
      ],
      proven_rising: [],
    },
    domains: {
      ai: {
        new_fancy: [],
        proven_rising: [],
      },
    },
  }),
}))

describe('HomePage', () => {
  beforeEach(() => {
    fetchIdeas.mockReset()
  })

  it('shows the unified public-surface entry cards and top idea preview', async () => {
    renderWithRouter(<HomePage />)

    expect(screen.getByRole('link', { name: 'Explore Ideas' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Check Daily Nuance' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /skill marketplace/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /book reader/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /legacy reader/i })).not.toBeInTheDocument()
    expect(screen.getByText('One public front door, four clear surfaces.')).toBeInTheDocument()
    expect(screen.getByText('Start with the surface that matches your intent.')).toBeInTheDocument()
    expect(screen.getByText('Signal-first Project Finder')).toBeInTheDocument()
    expect(screen.getByText('Current Backlog')).toBeInTheDocument()
    expect(screen.getByText('Daily Update Actions')).toBeInTheDocument()
    expect(screen.getAllByText('Skill Marketplace')).toHaveLength(2)
    expect(screen.queryByText('Book Reader Rebuild')).not.toBeInTheDocument()
    expect(await screen.findByText('Fresh Signal')).toBeInTheDocument()
  })
})
