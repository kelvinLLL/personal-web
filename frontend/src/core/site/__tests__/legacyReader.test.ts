import { afterEach, describe, expect, it, vi } from 'vitest'
import { getLegacyReaderHref } from '@/core/site/legacyReader'
import { siteRoutes } from '@/core/site/routes'

describe('legacy reader route helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('keeps the legacy reader same-origin in dev even when a proxy target is configured', () => {
    vi.stubEnv('VITE_BOOK_READER_URL', 'http://127.0.0.1:4322')

    expect(getLegacyReaderHref()).toBe(siteRoutes.legacyReader)
  })
})
