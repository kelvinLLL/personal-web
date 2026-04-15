import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('adminSession helpers', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  it('reads the admin token from the persisted ai-config store', async () => {
    localStorage.setItem(
      'ai-config',
      JSON.stringify({
        state: {
          adminSession: {
            token: 'secret-token',
            expiresAt: Date.now() + 60_000,
          },
        },
      }),
    )

    const { getAdminToken } = await import('@/lib/adminSession')
    expect(getAdminToken()).toBe('secret-token')
  })

  it('returns undefined when no admin session is stored', async () => {
    const { getAdminToken } = await import('@/lib/adminSession')
    expect(getAdminToken()).toBeUndefined()
  })
})
