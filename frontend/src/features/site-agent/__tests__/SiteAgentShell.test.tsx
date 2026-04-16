import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RouterProvider } from 'react-router-dom'
import { useSiteAgentStore } from '@/features/site-agent/store/useSiteAgentStore'
import { render, screen, userEvent } from '@/test/utils'

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

describe('SiteAgent shell', () => {
  beforeEach(() => {
    useSiteAgentStore.getState().resetState()
  })

  it('renders a floating launcher from RootLayout on public routes', async () => {
    renderRoute('/')

    expect(await screen.findByRole('button', { name: 'Open site agent' })).toBeInTheDocument()
  })

  it('opens and closes the compact shell', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(await screen.findByRole('button', { name: 'Open site agent' }))
    expect(screen.getByRole('dialog', { name: 'Site agent' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close site agent' }))
    expect(screen.queryByRole('dialog', { name: 'Site agent' })).not.toBeInTheDocument()
  })

  it('shows a route-aware title for home and ideas pages', async () => {
    const user = userEvent.setup()
    const { unmount } = renderRoute('/')

    await user.click(await screen.findByRole('button', { name: 'Open site agent' }))
    expect(await screen.findByRole('heading', { name: 'Agent for Home' })).toBeInTheDocument()
    unmount()

    renderRoute('/ideas')
    await user.click(await screen.findByRole('button', { name: 'Open site agent' }))
    expect(await screen.findByRole('heading', { name: 'Agent for Ideas' })).toBeInTheDocument()
  })

  it('does not introduce a dedicated full-page /agent route in v1', async () => {
    renderRoute('/agent')

    expect(await screen.findByText('Not Found Route')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open site agent' })).toBeInTheDocument()
  })
})
