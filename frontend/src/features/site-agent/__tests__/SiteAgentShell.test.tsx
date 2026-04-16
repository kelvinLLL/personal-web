import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from '@testing-library/react'
import { RouterProvider } from 'react-router-dom'
import { useAIConfigStore } from '@/store/aiConfigStore'
import { useSiteAgentStore } from '@/features/site-agent/store/useSiteAgentStore'
import { render, screen, userEvent, waitFor } from '@/test/utils'

const { streamSiteAgentQueryMock } = vi.hoisted(() => ({
  streamSiteAgentQueryMock: vi.fn(),
}))

vi.mock('@/features/site-agent/api/siteAgentApi', () => ({
  streamSiteAgentQuery: streamSiteAgentQueryMock,
}))

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

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    writable: true,
    value: height,
  })
}

describe('SiteAgent shell', () => {
  beforeEach(() => {
    setViewport(1024, 768)
    localStorage.clear()
    streamSiteAgentQueryMock.mockReset()
    useSiteAgentStore.getState().resetState()
    useAIConfigStore.getState().logout()
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

  it('keeps a visible error state after a server-side runtime failure', async () => {
    const user = userEvent.setup()
    streamSiteAgentQueryMock.mockImplementationOnce(
      async (_payload, options?: { onEvent?: (event: { type: string; message?: string; errorType?: string }) => void }) => {
        options?.onEvent?.({
          type: 'runtime_error',
          errorType: 'RuntimeError',
          message: 'agent exploded before emitting events',
        })
        options?.onEvent?.({ type: 'request_complete' })
      },
    )

    renderRoute('/')
    await user.click(await screen.findByRole('button', { name: 'Open site agent' }))
    await user.type(screen.getByRole('textbox', { name: 'Ask the site agent' }), 'hello')
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByText('Request error')).toBeInTheDocument()
    expect(screen.getAllByText('agent exploded before emitting events').length).toBeGreaterThan(0)
  })

  it('uses fresh auth state after an admin session changes on the same page', async () => {
    const user = userEvent.setup()
    streamSiteAgentQueryMock.mockResolvedValue(undefined)

    renderRoute('/')
    act(() => {
      useAIConfigStore.getState().setAdminSession({
        token: 'fresh-admin-token',
        expiresAt: Date.now() + 60_000,
      })
    })

    await user.click(await screen.findByRole('button', { name: 'Open site agent' }))
    await user.type(screen.getByRole('textbox', { name: 'Ask the site agent' }), 'auth check')
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() => {
      expect(streamSiteAgentQueryMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'auth check', route: '/' }),
        expect.objectContaining({ token: 'fresh-admin-token' }),
      )
    })
  })

  it('re-clamps the floating launcher position on viewport resize', async () => {
    renderRoute('/')
    const launcher = await screen.findByRole('button', { name: 'Open site agent' })

    act(() => {
      useSiteAgentStore.getState().setFloatingPosition({ x: 980, y: 760 })
      setViewport(360, 280)
      window.dispatchEvent(new Event('resize'))
    })

    await waitFor(() => {
      expect(launcher.parentElement).toHaveStyle({
        left: '280px',
        top: '200px',
      })
    })
  })
})
