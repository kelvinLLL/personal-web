import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/test/utils'

const { getStandaloneSuperHaojunWebUiUrl, redirectToStandaloneSuperHaojunWebUi } = vi.hoisted(
  () => ({
    getStandaloneSuperHaojunWebUiUrl: vi.fn(),
    redirectToStandaloneSuperHaojunWebUi: vi.fn(),
  }),
)

vi.mock('@/core/site/superhaojun', () => ({
  getStandaloneSuperHaojunWebUiUrl,
  redirectToStandaloneSuperHaojunWebUi,
}))

import { SuperHaojunPage } from '@/features/site-agent/page/SuperHaojunPage'

describe('SuperHaojunPage', () => {
  beforeEach(() => {
    getStandaloneSuperHaojunWebUiUrl.mockReset()
    redirectToStandaloneSuperHaojunWebUi.mockReset()
  })

  it('auto-forwards to the configured standalone WebUI while keeping a manual jump button visible', () => {
    const standaloneHref = 'http://47.99.200.227:8765'
    getStandaloneSuperHaojunWebUiUrl.mockReturnValue(standaloneHref)

    render(<SuperHaojunPage />)

    expect(screen.getByRole('heading', { name: /opening superhaojun webui/i })).toBeInTheDocument()
    expect(
      screen.getByText(/the public site now hands this route off to the polished standalone webui/i),
    ).toBeInTheDocument()

    const launchLink = screen.getByRole('link', { name: /continue to superhaojun webui/i })
    expect(launchLink).toHaveAttribute('href', standaloneHref)
    expect(launchLink).toHaveAttribute('data-app-boundary', 'external')
    expect(redirectToStandaloneSuperHaojunWebUi).toHaveBeenCalledTimes(1)
  })

  it('falls back to the floating shell when the standalone WebUI is not configured', () => {
    getStandaloneSuperHaojunWebUiUrl.mockReturnValue('')

    render(<SuperHaojunPage />)

    expect(screen.getByRole('button', { name: /open floating shell instead/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /continue to superhaojun webui/i })).not.toBeInTheDocument()
    expect(
      screen.getByText(/standalone webui is not configured here yet/i),
    ).toBeInTheDocument()
    expect(redirectToStandaloneSuperHaojunWebUi).not.toHaveBeenCalled()
  })
})
