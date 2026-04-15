import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import IdeaDetail from '@/pages/IdeaDetail'

const mockIdea = {
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
    effort: 'M',
  },
  meta: { discovered_at: '2025-01-01T00:00:00Z', source: 'manual' },
}

const fetchIdea = vi.fn()
vi.mock('@/lib/ideasApi', () => ({
  fetchIdea: (...args: unknown[]) => fetchIdea(...args),
}))

vi.mock('@/store/ideasStore', () => ({
  useIdeasStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      updateIdea: vi.fn(),
      deleteIdea: vi.fn(),
    }),
}))

function renderDetail(route = '/ideas/test-1') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/ideas/:id" element={<IdeaDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('IdeaDetail loading states', () => {
  beforeEach(() => {
    fetchIdea.mockReset()
  })

  it('shows loading state while fetching', () => {
    fetchIdea.mockReturnValue(new Promise(() => {}))
    renderDetail()

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows idea content after successful load', async () => {
    fetchIdea.mockResolvedValue(mockIdea)
    renderDetail()

    await waitFor(() => {
      expect(screen.getByText('Test Idea')).toBeInTheDocument()
    })
  })

  it('shows error message on fetch failure', async () => {
    fetchIdea.mockRejectedValue(new Error('API error 404: not found'))
    renderDetail()

    await waitFor(() => {
      expect(screen.getByText('API error 404: not found')).toBeInTheDocument()
    })
  })
})
