import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { DailyNuancePage } from '@/features/daily-nuance/page/DailyNuancePage'
import type { DailyNuanceSnapshot } from '@/features/daily-nuance/model/nuance'

const mockSnapshot: DailyNuanceSnapshot = {
  snapshot_date: '2026-04-12',
  overview: {
    new_fancy: [
      {
        entity_id: 'item-1',
        slug: 'new-agent-toolkit',
        title: 'New Agent Toolkit',
        summary: 'A fresh toolkit for code agents.',
        canonical_url: 'https://example.com/new-agent-toolkit',
        kind: 'article',
        source_names: ['hacker-news'],
        domains: ['ai'],
        first_seen_on: '2026-04-12',
        last_seen_on: '2026-04-12',
        scores: {
          new_fancy: 91.2,
          proven_rising: 62.8,
          freshness: 98.1,
          momentum: 90.0,
          authority: 77.3,
        },
      },
    ],
    proven_rising: [
      {
        entity_id: 'item-2',
        slug: 'runtime-observability-patterns',
        title: 'Runtime Observability Patterns',
        summary: 'Battle-tested runtime debugging playbooks.',
        canonical_url: 'https://example.com/runtime-observability-patterns',
        kind: 'repository',
        source_names: ['github'],
        domains: ['programming'],
        first_seen_on: '2026-04-01',
        last_seen_on: '2026-04-12',
        scores: {
          new_fancy: 65.2,
          proven_rising: 88.4,
          freshness: 71.0,
          momentum: 84.5,
          authority: 90.2,
        },
      },
    ],
  },
  domains: {
    ai: {
      new_fancy: [],
      proven_rising: [],
    },
    programming: {
      new_fancy: [],
      proven_rising: [],
    },
    psychology: {
      new_fancy: [],
      proven_rising: [],
    },
  },
}

const loadDailyNuanceSnapshot = vi.fn(async () => mockSnapshot)

vi.mock('@/features/daily-nuance/api/dailyNuanceApi', () => ({
  loadDailyNuanceSnapshot: () => loadDailyNuanceSnapshot(),
}))

describe('DailyNuancePage', () => {
  it('renders snapshot summary plus New & Fancy and Proven & Rising sections from snapshot data', async () => {
    render(<DailyNuancePage />)

    await waitFor(() => {
      expect(loadDailyNuanceSnapshot).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByRole('heading', { level: 1, name: 'Daily Nuance' })).toBeInTheDocument()
    expect(screen.getByText('Snapshot date: 2026-04-12')).toHaveClass('bg-stone-100')
    expect(screen.getByText('Snapshot date: 2026-04-12')).toHaveClass('text-stone-700')
    expect(screen.getByText('2 items in this snapshot')).toHaveClass('bg-stone-900')
    expect(screen.getByText('2 items in this snapshot')).toHaveClass('text-white')
    expect(screen.getByRole('heading', { level: 2, name: 'New & Fancy' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Proven & Rising' })).toBeInTheDocument()
    expect(screen.getByText('New Agent Toolkit')).toBeInTheDocument()
    expect(screen.getByText('Runtime Observability Patterns')).toBeInTheDocument()
  })
})
