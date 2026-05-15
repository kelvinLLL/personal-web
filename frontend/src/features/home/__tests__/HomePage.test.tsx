import { describe, expect, it } from 'vitest'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { RootLayout } from '@/app/layout/RootLayout'
import { screen, render } from '@/test/utils'
import { HomePage } from '@/features/home/page/HomePage'

describe('HomePage', () => {
  it('shows the focused public entry cards without dormant ideas or nuance surfaces', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <RootLayout />,
          children: [{ index: true, element: <HomePage /> }],
        },
      ],
      { initialEntries: ['/'] },
    )

    render(<RouterProvider router={router} />)

    expect(await screen.findByText("Kelvin's Creative Lab")).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Open Reading Journal' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open Book Reader' })).toBeInTheDocument()
    const aliyunServiceLink = screen.getByRole('link', { name: 'Open Aliyun Service' })
    expect(aliyunServiceLink).toHaveAttribute('href', 'http://47.99.200.227')
    expect(aliyunServiceLink).toHaveAttribute('data-app-boundary', 'external')
    expect(screen.queryByRole('link', { name: 'Explore Ideas' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Check Daily Nuance' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /ideas/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /daily nuance/i })).not.toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /skill marketplace/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /reading journal/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /book reader/i }).length).toBeGreaterThan(0)
    const stringViewerLinks = screen.getAllByRole('link', { name: /string viewer/i })
    expect(stringViewerLinks.length).toBeGreaterThan(0)
    expect(stringViewerLinks.some((link) => link.getAttribute('href') === '/str-viewer/')).toBe(true)
    expect(screen.getByRole('button', { name: 'Open site agent' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /legacy reader/i })).not.toBeInTheDocument()
    expect(screen.getByText('Five useful surfaces, one calm launch point.')).toBeInTheDocument()
    expect(screen.getByText(/dormant experiments out of your way/i)).toBeInTheDocument()
    expect(screen.getByText('Operating Queue')).toBeInTheDocument()
    expect(screen.getByText('Reading Journal Capture')).toBeInTheDocument()
    expect(screen.getByText('Book Resource Shelf')).toBeInTheDocument()
    expect(screen.getAllByText('Skill Marketplace').length).toBeGreaterThanOrEqual(2)
    expect(screen.queryByText('Book Reader Rebuild')).not.toBeInTheDocument()
    expect(screen.queryByText('Daily Update Actions')).not.toBeInTheDocument()
  })
})
