import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '@/test/utils'
import { Navbar } from '@/components/layout/Navbar'

describe('Navbar', () => {
  it('renders navigation links', () => {
    renderWithRouter(<Navbar />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.queryByText('Ideas')).not.toBeInTheDocument()
    expect(screen.queryByText('Daily Nuance')).not.toBeInTheDocument()
    expect(screen.getByText('Skill Marketplace')).toBeInTheDocument()
    expect(screen.getByText('Reading Journal')).toBeInTheDocument()
    expect(screen.getByText('Book Reader')).toBeInTheDocument()
    const stringViewerLink = screen.getByRole('link', { name: 'String Viewer' })
    expect(stringViewerLink).toHaveAttribute('href', '/str-viewer/')
    expect(stringViewerLink).toHaveAttribute('data-app-boundary', 'external')
    expect(screen.queryByText('Reader')).not.toBeInTheDocument()
    expect(screen.queryByText('Settings')).not.toBeInTheDocument()
  })

  it('renders brand name', () => {
    renderWithRouter(<Navbar />)
    expect(screen.getByText('kelvin.dev')).toBeInTheDocument()
  })
})
