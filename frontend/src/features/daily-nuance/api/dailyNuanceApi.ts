import type { DailyNuanceSnapshot } from '@/features/daily-nuance/model/nuance'

const DAILY_NUANCE_SNAPSHOT_PATH = '/data/daily-nuance/latest.json'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isDailyNuanceSnapshot(value: unknown): value is DailyNuanceSnapshot {
  if (!isObject(value)) return false
  if (typeof value.snapshot_date !== 'string') return false
  if (!isObject(value.overview)) return false
  if (!Array.isArray(value.overview.new_fancy)) return false
  if (!Array.isArray(value.overview.proven_rising)) return false
  if (!isObject(value.domains)) return false
  return true
}

export async function loadDailyNuanceSnapshot(): Promise<DailyNuanceSnapshot> {
  const response = await fetch(DAILY_NUANCE_SNAPSHOT_PATH, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Failed to load Daily Nuance snapshot (${response.status})`)
  }

  const payload: unknown = await response.json()
  if (!isDailyNuanceSnapshot(payload)) {
    throw new Error('Invalid Daily Nuance snapshot format')
  }

  return payload
}
