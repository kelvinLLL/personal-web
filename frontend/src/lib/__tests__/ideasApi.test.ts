import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchIdea, fetchIdeas, fetchIdeasMeta } from '@/lib/ideasApi'
import type { ProjectIdea } from '@/types/idea'

const snapshotIdea: ProjectIdea = {
  id: 'idea-1',
  title: 'Snapshot Idea',
  tagline: 'Static fallback data',
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
    tech_hints: ['static fallback'],
    effort: 'M',
  },
  meta: {
    discovered_at: '2026-04-15T00:00:00.000Z',
    source: 'workflow_selected',
    workflow_run_id: 'run-1',
  },
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ideasApi snapshot fallback', () => {
  it('falls back to the shipped snapshot when the public ideas endpoint returns html', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    fetchSpy
      .mockResolvedValueOnce(
        new Response('<html>spa fallback</html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          updated_at: '2026-04-15T01:23:45.000Z',
          ideas: [snapshotIdea],
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

    await expect(fetchIdeas()).resolves.toEqual([snapshotIdea])
    expect(fetchSpy.mock.calls[1]?.[0]).toBe('/data/ideas/latest.json')
  })

  it('derives public meta from the shipped snapshot when the live meta endpoint is unavailable', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response('<html>spa fallback</html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          updated_at: '2026-04-15T01:23:45.000Z',
          ideas: [snapshotIdea],
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

    await expect(fetchIdeasMeta()).resolves.toEqual({
      updatedAt: '2026-04-15T01:23:45.000Z',
      count: 1,
    })
  })

  it('finds an individual idea from the shipped snapshot when the detail endpoint is unavailable', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response('<html>spa fallback</html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          updated_at: '2026-04-15T01:23:45.000Z',
          ideas: [snapshotIdea],
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

    await expect(fetchIdea(snapshotIdea.id)).resolves.toEqual(snapshotIdea)
  })
})
