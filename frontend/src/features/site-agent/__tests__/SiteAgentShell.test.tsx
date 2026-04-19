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

vi.mock('@/pages/SuperHaojun', () => ({
  default: () => <div>SuperHaojun Route</div>,
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

  it('keeps the floating launcher available on the dedicated SuperHaojun page', async () => {
    renderRoute('/superhaojun')

    expect(await screen.findByText('SuperHaojun Route')).toBeInTheDocument()
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

  it('renders inline replies with current-page explanation plus read-only idea and content results', async () => {
    const user = userEvent.setup()
    streamSiteAgentQueryMock.mockImplementationOnce(
      async (_payload, options?: { onEvent?: (event: Record<string, unknown>) => void }) => {
        options?.onEvent?.({
          type: 'text_delta',
          text: 'Here is a quick inline summary for this page.',
        })
        options?.onEvent?.({
          type: 'page_explanation',
          explanation: {
            route: '/ideas',
            pageLabel: 'Ideas',
            summary: 'This page is best for reviewing ideas and deciding whether a larger workflow jump is worth it.',
            inlineCapabilityGroups: ['using-personal-web', 'ideas-read', 'ideas-workflow'],
          },
        })
        options?.onEvent?.({
          type: 'inline_result',
          result: {
            id: 'ideas.list',
            kind: 'ideas',
            title: 'Idea matches',
            summary: '2 read-only ideas surfaced inline.',
            items: [
              {
                id: 'idea-1',
                title: 'Signal-first Project Finder',
                summary: 'Turn interesting signals into concrete build candidates.',
                metadata: ['pending', 'tool'],
              },
              {
                id: 'idea-2',
                title: 'Workflow Radar',
                summary: 'Track workflow runs without leaving the panel.',
                metadata: ['active', 'research'],
              },
            ],
          },
        })
        options?.onEvent?.({
          type: 'inline_result',
          result: {
            id: 'content.skill_marketplace.catalog',
            kind: 'content',
            title: 'Marketplace snapshot',
            summary: 'Featured content stays read-only inside the shell.',
            snapshotDate: '2026-04-17',
            items: [
              {
                id: 'skill-1',
                title: 'SDD Feature Development',
                summary: 'Docs-first workflow guidance.',
                metadata: ['workflow', 'skill'],
              },
            ],
          },
        })
      },
    )

    renderRoute('/ideas')
    await user.click(await screen.findByRole('button', { name: 'Open site agent' }))
    await user.type(screen.getByRole('textbox', { name: 'Ask the site agent' }), 'What can you show inline?')
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByText('Here is a quick inline summary for this page.')).toBeInTheDocument()
    expect(screen.getByText('On Ideas')).toBeInTheDocument()
    expect(
      screen.getByText(
        'This page is best for reviewing ideas and deciding whether a larger workflow jump is worth it.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('ideas-read')).toBeInTheDocument()
    expect(screen.getByText('Idea matches')).toBeInTheDocument()
    expect(screen.getByText('Signal-first Project Finder')).toBeInTheDocument()
    expect(screen.getByText('Workflow Radar')).toBeInTheDocument()
    expect(screen.getByText('Marketplace snapshot')).toBeInTheDocument()
    expect(screen.getByText('SDD Feature Development')).toBeInTheDocument()
    expect(screen.queryByText('Suggested next pages')).not.toBeInTheDocument()
  })

  it('keeps transition recommendations visible and navigates with the router when clicked', async () => {
    const user = userEvent.setup()
    streamSiteAgentQueryMock.mockImplementationOnce(
      async (_payload, options?: { onEvent?: (event: Record<string, unknown>) => void }) => {
        options?.onEvent?.({
          type: 'text_delta',
          text: 'This request is better on the Ideas page.',
        })
        options?.onEvent?.({
          type: 'navigation_suggestion',
          suggestion: {
            id: 'ideas.workflow.start',
            route: '/ideas',
            title: 'Ideas',
            reason: 'Use the full Ideas surface for workflow entry and review.',
          },
        })
      },
    )

    renderRoute('/')
    await user.click(await screen.findByRole('button', { name: 'Open site agent' }))
    await user.type(screen.getByRole('textbox', { name: 'Ask the site agent' }), 'Start the workflow')
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByText('Suggested next pages')).toBeInTheDocument()
    expect(
      screen.getAllByText('Use the full Ideas surface for workflow entry and review.').length,
    ).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Open Ideas' }))

    expect(await screen.findByText('Ideas Route')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Agent for Ideas' })).toBeInTheDocument()
    expect(screen.getAllByText('/ideas').length).toBeGreaterThan(0)
  })

  it('renders workflow runs as structured cards with visible progress counts', async () => {
    const user = userEvent.setup()
    streamSiteAgentQueryMock.mockImplementationOnce(
      async (_payload, options?: { onEvent?: (event: Record<string, unknown>) => void }) => {
        options?.onEvent?.({
          type: 'workflow_run',
          run: {
            id: 'run-42',
            title: 'Ideas workflow run',
            status: 'completed',
            summary: 'Completed with persisted ideas and a few failed analyses.',
            searched: 12,
            analyzed: 7,
            persisted: 4,
            failed: 2,
          },
        })
      },
    )

    renderRoute('/ideas')
    await user.click(await screen.findByRole('button', { name: 'Open site agent' }))
    await user.type(screen.getByRole('textbox', { name: 'Ask the site agent' }), 'Show the workflow run')
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByText('Workflow runs')).toBeInTheDocument()
    expect(screen.getAllByText('Ideas workflow run').length).toBeGreaterThan(0)
    expect(screen.getAllByText('completed').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Searched').length).toBeGreaterThan(0)
    expect(screen.getAllByText('12').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Analyzed').length).toBeGreaterThan(0)
    expect(screen.getAllByText('7').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Persisted').length).toBeGreaterThan(0)
    expect(screen.getAllByText('4').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Failed').length).toBeGreaterThan(0)
    expect(screen.getAllByText('2').length).toBeGreaterThan(0)
  })

  it('aborts an in-flight request and ignores late events after the panel closes', async () => {
    const pendingStreams: Array<{
      signal?: AbortSignal
      onEvent?: (event: { type: string; text?: string }) => void
    }> = []
    const user = userEvent.setup()

    streamSiteAgentQueryMock.mockImplementation(
      (_payload, options?: { signal?: AbortSignal; onEvent?: (event: { type: string; text?: string }) => void }) =>
        new Promise<void>((_resolve, reject) => {
          pendingStreams.push({
            signal: options?.signal,
            onEvent: options?.onEvent,
          })

          if (!options?.signal) {
            return
          }

          const abortWithError = () => {
            reject(new DOMException('The operation was aborted.', 'AbortError'))
          }

          if (options.signal.aborted) {
            abortWithError()
            return
          }

          options.signal.addEventListener('abort', abortWithError, { once: true })
        }),
    )

    renderRoute('/')
    await user.click(await screen.findByRole('button', { name: 'Open site agent' }))
    await user.type(screen.getByRole('textbox', { name: 'Ask the site agent' }), 'cancel me')
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(useSiteAgentStore.getState().requestState).toBe('streaming')
    expect(pendingStreams).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Close site agent' }))

    await waitFor(() => {
      expect(pendingStreams[0]?.signal?.aborted).toBe(true)
      expect(useSiteAgentStore.getState().requestState).toBe('idle')
      expect(useSiteAgentStore.getState().pendingRequest).toBeNull()
    })

    act(() => {
      pendingStreams[0]?.onEvent?.({
        type: 'text_delta',
        text: 'stale assistant reply',
      })
      pendingStreams[0]?.onEvent?.({
        type: 'request_complete',
      })
    })

    expect(
      useSiteAgentStore
        .getState()
        .messages.some(
          (message) =>
            message.parts.some(
              (part) => part.type === 'text' && part.text.includes('stale assistant reply'),
            ),
        ),
    ).toBe(false)
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

  it('keeps the panel on-screen inside a very small viewport', async () => {
    const user = userEvent.setup()
    setViewport(280, 220)
    renderRoute('/')

    act(() => {
      useSiteAgentStore.getState().setFloatingPosition({ x: 264, y: 212 })
    })

    await user.click(await screen.findByRole('button', { name: 'Open site agent' }))

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Site agent' })).toHaveStyle({
        left: '16px',
        top: '16px',
      })
    })
  })
})
