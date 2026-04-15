import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor, render, renderWithRouter, userEvent } from '@/test/utils'
import Ideas from '@/pages/Ideas'
import type { ProjectIdea } from '@/types/idea'

const fetchIdeas = vi.fn()
const refreshIdeas = vi.fn()
const setFilter = vi.fn()
const createIdea = vi.fn()
const updateIdea = vi.fn()
const addIdeas = vi.fn()
let isAdminState = true

const workflowIdeas: ProjectIdea[] = [
  {
    id: 'workflow-idea-1',
    title: 'Workflow Idea',
    tagline: 'Freshly discovered',
    category: 'tool',
    status: 'pending',
    scores: {
      value: 8,
      learnability: 7,
      fun: 7,
      feasibility: 8,
      overall: 8,
    },
    detail: {
      why_interesting: 'Interesting',
      why_worth_doing: 'Worth doing',
      references: [],
      tech_hints: ['react'],
      effort: 'M',
    },
    meta: {
      discovered_at: '2026-04-11T00:00:00.000Z',
      source: 'workflow_selected',
      workflow_run_id: 'run-1',
    },
  },
]

const ideasStoreState = {
  ideas: [],
  loading: false,
  refreshing: false,
  error: null,
  meta: { updatedAt: null, count: 0 },
  filter: { category: 'all', status: 'all', sortBy: 'overall' as const },
  setFilter,
  fetchIdeas,
  refreshIdeas,
  createIdea,
  updateIdea,
  addIdeas,
}

vi.mock('@/features/ideas/store/useIdeasStore', () => ({
  useIdeasStore: (selector: (state: typeof ideasStoreState) => unknown) => selector(ideasStoreState),
}))

vi.mock('@/store/aiConfigStore', () => ({
  useAIConfigStore: (selector: (state: { isAdmin: () => boolean }) => unknown) =>
    selector({ isAdmin: () => isAdminState }),
}))

vi.mock('@/components/ideas/IdeaCard', () => ({
  IdeaCard: () => <div>Idea Card</div>,
}))

vi.mock('@/components/ideas/WorkflowProgress', () => ({
  WorkflowProgress: ({ onComplete }: { onComplete: (ideas: ProjectIdea[]) => void }) => (
    <button type="button" onClick={() => onComplete(workflowIdeas)}>
      Finish workflow
    </button>
  ),
}))

describe('Ideas page', () => {
  beforeEach(() => {
    isAdminState = true
    fetchIdeas.mockReset()
    refreshIdeas.mockReset()
    setFilter.mockReset()
    createIdea.mockReset()
    updateIdea.mockReset()
    addIdeas.mockReset()
  })

  it('shows a refresh action and re-fetches the list when clicked', async () => {
    const user = userEvent.setup()
    render(<Ideas />)
    const refreshButton = screen.getByRole('button', { name: 'Refresh List' })

    expect(screen.getByText('Curated Collection')).toBeInTheDocument()
    expect(
      screen.getByText('Projects worth revisiting, ranking, and moving forward.'),
    ).toBeInTheDocument()
    expect(refreshButton).toHaveClass('bg-stone-100')
    expect(refreshButton).toHaveClass('text-stone-700')
    expect(screen.getByRole('button', { name: 'Toy' })).toHaveClass('bg-stone-100')
    expect(screen.getByRole('button', { name: 'Toy' })).toHaveClass('text-stone-700')

    await waitFor(() => {
      expect(fetchIdeas).toHaveBeenCalledTimes(1)
    })

    await user.click(refreshButton)

    expect(refreshIdeas).toHaveBeenCalledTimes(1)
  })

  it('keeps the workflow panel visible after completion so the summary can stay on screen', async () => {
    const user = userEvent.setup()
    render(<Ideas />)

    await waitFor(() => {
      expect(fetchIdeas).toHaveBeenCalledTimes(1)
    })

    await user.click(screen.getByRole('button', { name: 'Run Daily Update' }))
    await user.click(screen.getByRole('button', { name: 'Finish workflow' }))

    await waitFor(() => {
      expect(addIdeas).toHaveBeenCalledWith(workflowIdeas)
    })

    expect(refreshIdeas).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Finish workflow' })).toBeInTheDocument()
    expect(screen.getByText('Manage the collection')).toBeInTheDocument()
  })

  it('keeps the workflow trigger visible when admin auth is missing and shows guidance instead of hiding it', async () => {
    isAdminState = false
    const user = userEvent.setup()
    renderWithRouter(<Ideas />)

    await waitFor(() => {
      expect(fetchIdeas).toHaveBeenCalledTimes(1)
    })

    await user.click(screen.getByRole('button', { name: 'Run Daily Update' }))

    expect(screen.getByText(/admin access is required to run discovery/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /open settings/i })).toBeInTheDocument()
  })
})
