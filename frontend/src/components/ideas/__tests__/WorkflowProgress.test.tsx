import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, userEvent } from '@/test/utils'
import { WorkflowProgress } from '@/components/ideas/WorkflowProgress'
import type { ProjectIdea } from '@/types/idea'

const { triggerWorkflow } = vi.hoisted(() => ({
  triggerWorkflow: vi.fn(),
}))

vi.mock('@/lib/ideasApi', () => ({
  triggerWorkflow,
}))

vi.mock('@/lib/adminSession', () => ({
  getAdminToken: () => 'admin-token',
}))

function buildIdea(): ProjectIdea {
  return {
    id: 'idea-1',
    title: 'Idea One',
    tagline: 'Useful tool',
    category: 'tool',
    status: 'pending',
    scores: {
      value: 8,
      learnability: 7,
      fun: 6,
      feasibility: 9,
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
  }
}

function buildStreamResponse(events: unknown[]): Response {
  const payload = events
    .map((event) => `data: ${JSON.stringify(event)}\n\n`)
    .join('')

  let consumed = false
  return {
    ok: true,
    status: 200,
    body: {
      getReader() {
        return {
          async read() {
            if (consumed) {
              return { done: true, value: undefined }
            }
            consumed = true
            return { done: false, value: new TextEncoder().encode(payload) }
          },
        }
      },
    } as ReadableStream<Uint8Array>,
  } as Response
}

describe('WorkflowProgress', () => {
  beforeEach(() => {
    triggerWorkflow.mockReset()
  })

  it('shows a completed summary with truthful counts', async () => {
    const onComplete = vi.fn()
    const user = userEvent.setup()
    const idea = buildIdea()

    triggerWorkflow.mockResolvedValue(
      buildStreamResponse([
        { type: 'phase:1', message: 'Starting discovery search...' },
        { type: 'done', message: 'Completed! Selected 1 ideas from 4 analyses.', ideas: [idea], searched: 12, shortlisted: 8, analyzed: 4, persisted: 1, failed: 0, run_id: 'run-1', model_key: 'minimax-m2.7' },
      ]),
    )

    render(<WorkflowProgress onComplete={onComplete} />)

    await user.click(screen.getByRole('button', { name: 'Discover' }))

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith([idea])
    })

    expect(screen.getByText('Discovery complete')).toBeInTheDocument()
    expect(screen.getByText(/Searched 12/i)).toBeInTheDocument()
    expect(screen.getByText(/Shortlisted 8/i)).toBeInTheDocument()
    expect(screen.getByText(/Analyzed 4/i)).toBeInTheDocument()
    expect(screen.getByText(/Persisted 1/i)).toBeInTheDocument()
    expect(screen.getByText(/Failed 0/i)).toBeInTheDocument()
  })

  it('shows a warning summary when some candidates fail', async () => {
    const onComplete = vi.fn()
    const user = userEvent.setup()

    triggerWorkflow.mockResolvedValue(
      buildStreamResponse([
        { type: 'phase:1', message: 'Starting discovery search...' },
        { type: 'done_with_warnings', message: 'Completed! Selected 2 ideas from 5 analyses.', ideas: [buildIdea()], searched: 30, shortlisted: 15, analyzed: 5, persisted: 2, failed: 3, run_id: 'run-2', model_key: 'minimax-m2.7' },
      ]),
    )

    render(<WorkflowProgress onComplete={onComplete} />)

    await user.click(screen.getByRole('button', { name: 'Discover' }))

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByText('Completed with warnings')).toBeInTheDocument()
    expect(screen.getByText(/Failed 3/i)).toBeInTheDocument()
    expect(screen.getByText(/Selected 2 ideas from 5 analyses/i)).toBeInTheDocument()
  })
})
