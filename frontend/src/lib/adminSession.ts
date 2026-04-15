import { useAIConfigStore } from '@/store/aiConfigStore'
import type { AdminSession } from '@/types/ai'

const STORAGE_KEY = 'ai-config'

function parseStoredSession(): AdminSession | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null

  try {
    const parsed = JSON.parse(stored)
    return parsed.state?.adminSession ?? null
  } catch {
    return null
  }
}

export function getAdminSession(): AdminSession | null {
  const state = useAIConfigStore.getState()
  if (state.isAdmin() && state.adminSession) {
    return state.adminSession
  }

  const stored = parseStoredSession()
  if (!stored) return null
  return stored.expiresAt > Date.now() ? stored : null
}

export function getAdminToken(): string | undefined {
  return getAdminSession()?.token
}
