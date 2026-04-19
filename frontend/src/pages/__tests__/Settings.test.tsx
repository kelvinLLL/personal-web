import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import Settings from '@/pages/Settings'
import { useAIConfigStore } from '@/store/aiConfigStore'

describe('Settings page', () => {
  beforeEach(() => {
    useAIConfigStore.setState({
      visitorConfig: { baseURL: '', apiKey: '', model: 'gpt-4o' },
      adminSession: null,
    })

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          models: [
            {
              key: 'gemma-4',
              name: 'Gemma 4 26B (free)',
              model_id: 'google/gemma-4-26b-a4b-it:free',
              provider: 'openrouter',
            },
          ],
          active: 'gemma-4',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('clearly separates shared server models from browser-local provider settings', async () => {
    render(<Settings />)

    await screen.findByText('Gemma 4 26B (free)')

    expect(
      screen.getByText(/Shared models configured in backend\/models\.yaml/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Switching here changes the shared server proxy only/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Stored locally in this browser only/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Does not add your provider to the shared server model list/i),
    ).toBeInTheDocument()
  })
})
