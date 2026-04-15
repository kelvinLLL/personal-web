import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/test/utils'

const { redirectToLegacyReader } = vi.hoisted(() => ({
  redirectToLegacyReader: vi.fn(),
}))

vi.mock('@/core/site/legacyReader', () => ({
  getLegacyReaderHref: () => 'http://127.0.0.1:4322/book-reader-legacy/',
  isLegacyReaderExternalApp: () => true,
  redirectToLegacyReader,
}))

import { BookReaderPage } from '@/features/book-reader/page/BookReaderPage'

describe('BookReaderPage', () => {
  const legacyHref = 'http://127.0.0.1:4322/book-reader-legacy/'

  it('forwards /book-reader into the canonical legacy reader and keeps a manual fallback visible', async () => {
    redirectToLegacyReader.mockReset()
    render(<BookReaderPage />)

    expect(
      screen.getByRole('heading', { name: /opening the legacy reader/i }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/book reader now uses the higher-quality legacy experience/i),
    ).toBeInTheDocument()

    const legacyLink = screen.getByRole('link', { name: /continue to legacy reader/i })
    expect(legacyLink).toBeInTheDocument()
    expect(legacyLink).toHaveAttribute('href', legacyHref)
    expect(legacyLink).toHaveAttribute('data-app-boundary', 'external')
    expect(screen.queryByText(/read inside the main site/i)).not.toBeInTheDocument()
    expect(redirectToLegacyReader).toHaveBeenCalledTimes(1)
  })
})
