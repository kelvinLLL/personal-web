import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@/test/utils'
import { SkillMarketplaceDetailPage } from '@/features/skill-marketplace/page/SkillMarketplaceDetailPage'

function renderDetail(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route
          path="/skill-marketplace/:ownerType/:slug"
          element={<SkillMarketplaceDetailPage />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SkillMarketplaceDetailPage', () => {
  it('renders personal detail pages with constraints and insights', () => {
    renderDetail('/skill-marketplace/personal/sdd-feature-development')

    expect(screen.getByRole('heading', { name: 'SDD Feature Development' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Skill Marketplace' })).toBeInTheDocument()
    expect(screen.getByText('Key Constraints')).toBeInTheDocument()
    expect(screen.getByText('Key Insights')).toBeInTheDocument()
    expect(screen.getByText('Used In')).toBeInTheDocument()
    expect(screen.getByText('Related Entries')).toBeInTheDocument()
  })

  it('renders community detail pages with curation signals', () => {
    renderDetail('/skill-marketplace/community/vercel-platform-toolkit')

    expect(screen.getByRole('heading', { name: 'Vercel Platform Toolkit' })).toBeInTheDocument()
    expect(screen.getByText('Why Curated')).toBeInTheDocument()
    expect(screen.getByText('Trust Level')).toBeInTheDocument()
    expect(screen.getByText('Source Reputation')).toBeInTheDocument()
    expect(screen.getByText('What Makes It Different')).toBeInTheDocument()
  })

  it('shows a readable empty state when a slug is missing', () => {
    renderDetail('/skill-marketplace/community/missing-entry')

    expect(screen.getByText('Marketplace entry not found.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Skill Marketplace' })).toBeInTheDocument()
  })
})
