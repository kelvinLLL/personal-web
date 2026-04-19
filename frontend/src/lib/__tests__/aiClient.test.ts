import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAIConfigStore } from '@/store/aiConfigStore'
import { apiStreamRequest } from '@/lib/apiClient'
import { chatCompletion, testConnection } from '@/lib/aiClient'

vi.mock('@/lib/apiClient', async () => {
  const actual = await vi.importActual<typeof import('@/lib/apiClient')>('@/lib/apiClient')
  return {
    ...actual,
    apiStreamRequest: vi.fn(),
  }
})

describe('aiClient', () => {
  beforeEach(() => {
    useAIConfigStore.setState({
      visitorConfig: { baseURL: '', apiKey: '', model: 'gpt-4o' },
      adminSession: null,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses the server proxy when admin access is active', async () => {
    const response = new Response('{}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
    vi.mocked(apiStreamRequest).mockResolvedValue(response)

    useAIConfigStore.setState({
      adminSession: {
        token: 'admin-token',
        expiresAt: Date.now() + 60_000,
      },
    })

    const result = await chatCompletion(
      [{ role: 'user', content: 'hello' }],
      { stream: true, temperature: 0.2 },
    )

    expect(result).toBe(response)
    expect(apiStreamRequest).toHaveBeenCalledWith('/api/proxy/chat', {
      method: 'POST',
      token: 'admin-token',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'hello' }],
        stream: true,
        temperature: 0.2,
      }),
    })
  })

  it('throws when local provider config is missing for visitor mode', async () => {
    await expect(
      chatCompletion([{ role: 'user', content: 'hello' }]),
    ).rejects.toThrow('AI configuration not set. Please configure in Settings.')
  })

  it('uses the browser-local provider config when admin mode is not active', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    useAIConfigStore.setState({
      visitorConfig: {
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: 'sk-test',
        model: 'openai/gpt-oss-20b:free',
      },
    })

    await chatCompletion(
      [{ role: 'user', content: 'hello' }],
      { max_tokens: 32 },
    )

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-test',
        }),
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b:free',
          messages: [{ role: 'user', content: 'hello' }],
          max_tokens: 32,
        }),
      }),
    )
  })

  it('tests a visitor connection against the configured provider endpoint', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const ok = await testConnection({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: 'sk-test',
      model: 'google/gemma-4-31b-it:free',
    })

    expect(ok).toBe(true)
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-test',
        }),
        body: JSON.stringify({
          model: 'google/gemma-4-31b-it:free',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        }),
      }),
    )
  })
})
