import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createReadingJournalEntry,
  createSharedReadingJournalComment,
  deleteReadingJournalEntry,
  fetchReadingJournalEntries,
  generateReadingJournalShareToken,
  updateReadingJournalEntry,
  updateReadingJournalCommentStatus,
} from '@/features/reading-journal/api/readingJournalApi'
import type { ReadingJournalEntryCreate } from '@/features/reading-journal/model/readingJournal'

vi.mock('@/lib/adminSession', () => ({
  getAdminToken: () => 'admin-token',
}))

const createPayload: ReadingJournalEntryCreate = {
  book: {
    title: 'Kokoro',
    author: 'Natsume Soseki',
    original_title: 'こころ',
    translator: '',
    publisher: '',
    language: 'ja',
    tags: ['japanese-literature'],
  },
  status: 'reading',
  rating: 4.5,
  started_on: '',
  finished_on: '',
  short_impression: 'A quiet study of distance and guilt.',
  public_impression: 'This one lingers after the final letter.',
  reflection: 'Private notes.',
  quotes: [],
}

afterEach(() => {
  vi.restoreAllMocks()
})

function expectPath(value: unknown, path: string) {
  expect(String(value)).toMatch(new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`))
}

describe('readingJournalApi', () => {
  it('uses admin auth for owner journal reads and writes', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await fetchReadingJournalEntries()

    expectPath(fetchSpy.mock.calls[0]?.[0], '/api/reading-journal')
    expect(fetchSpy.mock.calls[0]?.[1]).toEqual({
      headers: { Authorization: 'Bearer admin-token' },
    })

    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 'entry-1', ...createPayload, quotes: [], comments: [] }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await createReadingJournalEntry(createPayload)

    const [, init] = fetchSpy.mock.calls[1]
    expect(init?.method).toBe('POST')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer admin-token')

    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 'entry-1', ...createPayload, quotes: [], comments: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    await updateReadingJournalEntry('entry-1', { reflection: 'Updated private note.' })

    expectPath(fetchSpy.mock.calls[2]?.[0], '/api/reading-journal/entry-1')
    expect(fetchSpy.mock.calls[2]?.[1]?.method).toBe('PUT')
    expect((fetchSpy.mock.calls[2]?.[1]?.headers as Record<string, string>).Authorization).toBe(
      'Bearer admin-token',
    )

    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 204 }))
    await deleteReadingJournalEntry('entry-1')

    expectPath(fetchSpy.mock.calls[3]?.[0], '/api/reading-journal/entry-1')
    expect(fetchSpy.mock.calls[3]?.[1]?.method).toBe('DELETE')
  })

  it('generates share tokens and moderates comments with admin auth', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ share_token: 'share-token-1' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'comment-1', status: 'approved' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

    await generateReadingJournalShareToken('entry-1')
    await updateReadingJournalCommentStatus('entry-1', 'comment-1', 'approved')

    expectPath(fetchSpy.mock.calls[0]?.[0], '/api/reading-journal/entry-1/share-token')
    expectPath(fetchSpy.mock.calls[1]?.[0], '/api/reading-journal/entry-1/comments/comment-1')
    expect((fetchSpy.mock.calls[1]?.[1]?.headers as Record<string, string>).Authorization).toBe(
      'Bearer admin-token',
    )
  })

  it('posts shared comments without admin auth', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'comment-1', status: 'pending' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await createSharedReadingJournalComment('share-token-1', {
      display_name: 'Aki',
      body: 'Thank you for sharing this.',
    })

    const [, init] = fetchSpy.mock.calls[0]
    const headers = init?.headers as Record<string, string>
    expectPath(fetchSpy.mock.calls[0]?.[0], '/api/reading-journal/shared/share-token-1/comments')
    expect(headers.Authorization).toBeUndefined()
  })
})
