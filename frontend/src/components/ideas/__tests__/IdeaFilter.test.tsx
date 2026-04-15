import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { IdeaFilter } from '@/components/ideas/IdeaFilter'

const defaultFilter = { category: 'all' as const, status: 'all' as const, sortBy: 'overall' as const }

describe('IdeaFilter accessibility', () => {
  it('wraps each filter section in a fieldset with a legend', () => {
    render(<IdeaFilter filter={defaultFilter} onChange={vi.fn()} />)

    const legends = screen.getAllByRole('group')
    expect(legends.length).toBeGreaterThanOrEqual(3)

    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Sort')).toBeInTheDocument()
  })

  it('marks the active filter button as aria-pressed', () => {
    render(
      <IdeaFilter
        filter={{ ...defaultFilter, category: 'tool' }}
        onChange={vi.fn()}
      />,
    )

    const toolButton = screen.getByRole('button', { name: 'Tool' })
    expect(toolButton).toHaveAttribute('aria-pressed', 'true')

    const allButton = screen.getAllByRole('button', { name: 'All' })[0]
    expect(allButton).toHaveAttribute('aria-pressed', 'false')
  })
})
