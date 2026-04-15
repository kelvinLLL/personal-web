import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '@/test/utils'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import type { ProjectIdea } from '@/types/idea'

const mockIdea: ProjectIdea = {
  id: 'test-1',
  title: 'Cool Project',
  tagline: 'A very cool project to build',
  category: 'tool',
  status: 'pending',
  scores: { value: 8, learnability: 7, fun: 9, feasibility: 6, overall: 8 },
  detail: {
    why_interesting: 'interesting',
    why_worth_doing: 'worth it',
    references: [],
    tech_hints: ['React'],
    effort: 'M',
  },
  meta: {
    discovered_at: '2025-01-01T00:00:00Z',
    source: 'manual',
  },
}

describe('IdeaCard', () => {
  it('renders idea title and tagline', () => {
    renderWithRouter(<IdeaCard idea={mockIdea} />)
    expect(screen.getByText('Cool Project')).toBeInTheDocument()
    expect(screen.getByText('A very cool project to build')).toBeInTheDocument()
    expect(screen.getByText('Why it matters')).toBeInTheDocument()
    expect(screen.getByText('worth it')).toBeInTheDocument()
  })

  it('renders category badge', () => {
    renderWithRouter(<IdeaCard idea={mockIdea} />)
    expect(screen.getByText('tool')).toBeInTheDocument()
  })

  it('renders overall score', () => {
    renderWithRouter(<IdeaCard idea={mockIdea} />)
    expect(screen.getByText('Overall')).toBeInTheDocument()
    expect(screen.getAllByText('8').length).toBeGreaterThanOrEqual(1)
  })

  it('renders effort badge', () => {
    renderWithRouter(<IdeaCard idea={mockIdea} />)
    expect(screen.getByText('M')).toBeInTheDocument()
  })

  it('shows status change buttons when handler provided and status is pending', () => {
    const handler = () => {}
    renderWithRouter(<IdeaCard idea={mockIdea} onStatusChange={handler} />)
    expect(screen.getByText('Start')).toBeInTheDocument()
    expect(screen.getByText('Skip')).toBeInTheDocument()
  })

  it('hides status buttons when no handler', () => {
    renderWithRouter(<IdeaCard idea={mockIdea} />)
    expect(screen.queryByText('Start')).not.toBeInTheDocument()
  })
})
