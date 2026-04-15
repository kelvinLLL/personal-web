import { describe, expect, it } from 'vitest'
import { renderWithRouter, screen, userEvent } from '@/test/utils'
import { SkillMarketplacePage } from '@/features/skill-marketplace/page/SkillMarketplacePage'

describe('SkillMarketplacePage', () => {
  it('renders the split marketplace directory with quick browse controls', () => {
    renderWithRouter(<SkillMarketplacePage />)

    expect(screen.getByRole('heading', { name: 'Skill Marketplace' })).toBeInTheDocument()
    expect(
      screen.getByText(/browse your own skills and a clearly separated curated shelf/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'My Skills' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Curated Community' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Workflow' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Plugin' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Codex' })).toBeInTheDocument()
    expect(screen.getByText('SDD Feature Development')).toBeInTheDocument()
    expect(screen.getByText('Vercel Platform Toolkit')).toBeInTheDocument()
  })

  it('filters the catalogs through quick browse chips', async () => {
    const user = userEvent.setup()

    renderWithRouter(<SkillMarketplacePage />)

    expect(screen.getByText('Curating Interesting Trends')).toBeInTheDocument()
    expect(screen.getByText('Playwright MCP Toolkit')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Testing' }))

    expect(screen.getByText('Test-Driven Development')).toBeInTheDocument()
    expect(screen.getByText('Playwright MCP Toolkit')).toBeInTheDocument()
    expect(screen.queryByText('Curating Interesting Trends')).not.toBeInTheDocument()
  })
})
