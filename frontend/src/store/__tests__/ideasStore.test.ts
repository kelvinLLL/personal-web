import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useIdeasStore } from '@/store/ideasStore'
import type { ProjectIdea } from '@/types/idea'

const mockIdea: ProjectIdea = {
  id: 'test-1',
  title: 'Test Idea',
  tagline: 'A test idea',
  category: 'tool',
  status: 'pending',
  scores: { value: 7, learnability: 6, fun: 8, feasibility: 9, overall: 8 },
  detail: {
    why_interesting: 'interesting',
    why_worth_doing: 'worth it',
    references: [],
    tech_hints: ['React'],
    effort: 'S',
  },
  meta: {
    discovered_at: '2025-01-01T00:00:00Z',
    source: 'manual',
  },
}

const mockIdea2: ProjectIdea = {
  ...mockIdea,
  id: 'test-2',
  title: 'Another Idea',
  scores: { ...mockIdea.scores, overall: 5 },
  meta: { ...mockIdea.meta, discovered_at: '2025-01-02T00:00:00Z' },
}

vi.mock('@/lib/ideasApi', () => ({
  fetchIdeas: vi.fn().mockResolvedValue([]),
  createIdea: vi.fn().mockImplementation(async (data) => ({ ...data, id: 'new-1', meta: { discovered_at: new Date().toISOString(), source: 'manual' } })),
  updateIdea: vi.fn().mockImplementation(async (id, updates) => ({ ...mockIdea, ...updates, id })),
  deleteIdea: vi.fn().mockResolvedValue(undefined),
}))

describe('ideasStore', () => {
  beforeEach(() => {
    useIdeasStore.setState({
      ideas: [],
      loading: false,
      error: null,
      filter: { category: 'all', status: 'all', sortBy: 'overall' },
    })
  })

  it('starts with empty ideas', () => {
    expect(useIdeasStore.getState().ideas).toEqual([])
  })

  it('sets filter', () => {
    useIdeasStore.getState().setFilter({ category: 'tool' })
    expect(useIdeasStore.getState().filter.category).toBe('tool')
    expect(useIdeasStore.getState().filter.sortBy).toBe('overall')
  })

  it('adds ideas and sorts by overall score', () => {
    useIdeasStore.getState().addIdeas([mockIdea2, mockIdea])
    const ideas = useIdeasStore.getState().ideas
    expect(ideas[0].scores.overall).toBeGreaterThanOrEqual(ideas[1].scores.overall)
  })

  it('adds ideas and sorts by newest when sortBy is newest', () => {
    useIdeasStore.getState().setFilter({ sortBy: 'newest' })
    useIdeasStore.getState().addIdeas([mockIdea, mockIdea2])
    const ideas = useIdeasStore.getState().ideas
    expect(ideas[0].id).toBe('test-2')
  })

  it('re-sorts existing ideas immediately when sortBy changes', () => {
    useIdeasStore.setState({
      ideas: [mockIdea, mockIdea2],
      loading: false,
      error: null,
      filter: { category: 'all', status: 'all', sortBy: 'overall' },
    })

    useIdeasStore.getState().setFilter({ sortBy: 'newest' })

    const ideas = useIdeasStore.getState().ideas
    expect(ideas[0].id).toBe('test-2')
  })

  it('deletes idea from store', async () => {
    useIdeasStore.setState({ ideas: [mockIdea, mockIdea2] })
    await useIdeasStore.getState().deleteIdea('test-1')
    expect(useIdeasStore.getState().ideas).toHaveLength(1)
    expect(useIdeasStore.getState().ideas[0].id).toBe('test-2')
  })
})
