import { afterEach, describe, expect, it, vi } from 'vitest'
import { getStandaloneSuperHaojunWebUiUrl } from '@/core/site/superhaojun'

describe('SuperHaojun route helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('does not invent a standalone runtime URL in dev', () => {
    vi.stubEnv('VITE_SUPERHAOJUN_WEBUI_URL', '')

    expect(getStandaloneSuperHaojunWebUiUrl()).toBe('')
  })

  it('uses an explicitly configured standalone runtime URL', () => {
    vi.stubEnv('VITE_SUPERHAOJUN_WEBUI_URL', 'http://127.0.0.1:8765/')

    expect(getStandaloneSuperHaojunWebUiUrl()).toBe('http://127.0.0.1:8765')
  })
})
