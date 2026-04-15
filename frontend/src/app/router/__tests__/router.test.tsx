import { describe, expect, it, vi } from 'vitest'
import { RouterProvider } from 'react-router-dom'
import { render, screen } from '@/test/utils'

vi.mock('@/pages/Home', () => ({
  default: () => <div>Home Route</div>,
}))

vi.mock('@/pages/Ideas', () => ({
  default: () => <div>Ideas Route</div>,
}))

vi.mock('@/pages/IdeaDetail', () => ({
  default: () => <div>Idea Detail Route</div>,
}))

vi.mock('@/pages/DailyNuance', () => ({
  default: () => <div>Daily Nuance Route</div>,
}))

vi.mock('@/pages/BookReader', () => ({
  default: () => <div>Book Reader Route</div>,
}))

vi.mock('@/pages/SkillMarketplace', () => ({
  default: () => <div>Skill Marketplace Route</div>,
}))

vi.mock('@/pages/SkillMarketplaceDetail', () => ({
  default: () => <div>Skill Marketplace Detail Route</div>,
}))

vi.mock('@/pages/Settings', () => ({
  default: () => <div>Settings Route</div>,
}))

vi.mock('@/pages/NotFound', () => ({
  default: () => <div>Not Found Route</div>,
}))

const { createAppMemoryRouter } = await import('@/app/router/router')

function renderRoute(route: string) {
  const router = createAppMemoryRouter([route])
  return render(<RouterProvider router={router} />)
}

describe('app router', () => {
  it('shows the approved primary navigation without settings', async () => {
    renderRoute('/')

    expect(await screen.findByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ideas' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Daily Nuance' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Skill Marketplace' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Book Reader' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Reader' })).not.toBeInTheDocument()
  })

  it('resolves /daily-nuance inside the SPA', async () => {
    renderRoute('/daily-nuance')

    expect(await screen.findByText('Daily Nuance Route')).toBeInTheDocument()
  })

  it('resolves /book-reader inside the SPA', async () => {
    renderRoute('/book-reader')

    expect(await screen.findByText('Book Reader Route')).toBeInTheDocument()
  })

  it('resolves /skill-marketplace inside the SPA', async () => {
    renderRoute('/skill-marketplace')

    expect(await screen.findByText('Skill Marketplace Route')).toBeInTheDocument()
  })

  it('resolves shareable marketplace detail routes inside the SPA', async () => {
    renderRoute('/skill-marketplace/personal/sdd-feature-development')

    expect(await screen.findByText('Skill Marketplace Detail Route')).toBeInTheDocument()
  })
})
