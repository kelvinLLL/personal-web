import { describe, expect, it, vi, afterEach } from 'vitest'
import { apiRequest, sanitizeBackendUrl } from '@/lib/apiClient'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('apiRequest', () => {
  it('drops localhost backend origins in production-safe mode', () => {
    expect(sanitizeBackendUrl('http://localhost:8000', false)).toBe('')
    expect(sanitizeBackendUrl('http://127.0.0.1:8000', false)).toBe('')
    expect(sanitizeBackendUrl('https://api.example.com', false)).toBe('https://api.example.com')
  })

  it('returns undefined for 204 responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 204 }),
    )

    const result = await apiRequest<void>('/api/ideas/test-id', {
      method: 'DELETE',
    })

    expect(result).toBeUndefined()
  })

  it('does not set Content-Type when no body is provided', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await apiRequest('/api/ideas')

    const [, init] = fetchSpy.mock.calls[0]
    const headers = init?.headers as Record<string, string>
    expect(headers['Content-Type']).toBeUndefined()
  })

  it('sets Content-Type to application/json when body is provided', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: '1' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await apiRequest('/api/ideas', {
      method: 'POST',
      body: JSON.stringify({ title: 'test' }),
    })

    const [, init] = fetchSpy.mock.calls[0]
    const headers = init?.headers as Record<string, string>
    expect(headers['Content-Type']).toBe('application/json')
  })

  it('attaches Authorization header when token is provided', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await apiRequest('/api/ideas', { token: 'my-token' })

    const [, init] = fetchSpy.mock.calls[0]
    const headers = init?.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer my-token')
  })
})
