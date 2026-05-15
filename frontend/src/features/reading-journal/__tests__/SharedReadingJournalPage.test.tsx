import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithRouter, screen, userEvent, waitFor } from '@/test/utils'
import { SharedReadingJournalPage } from '@/features/reading-journal/page/SharedReadingJournalPage'
import type { SharedReadingJournalEntry } from '@/features/reading-journal/model/readingJournal'

const apiMocks = vi.hoisted(() => ({
  fetchSharedReadingJournalEntry: vi.fn(),
  createSharedReadingJournalComment: vi.fn(),
}))

const sharedEntry: SharedReadingJournalEntry = {
  id: 'entry-1',
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
  short_impression: 'A quiet study of distance and guilt.',
  public_impression: 'This one lingers after the final letter.',
  comments: [
    {
      id: 'comment-1',
      display_name: 'Mina',
      body: 'I felt the same after reading it.',
      status: 'approved',
      created_at: '2026-05-13T01:00:00Z',
      moderated_at: '2026-05-13T02:00:00Z',
    },
  ],
}

vi.mock('@/features/reading-journal/api/readingJournalApi', () => ({
  fetchSharedReadingJournalEntry: apiMocks.fetchSharedReadingJournalEntry,
  createSharedReadingJournalComment: apiMocks.createSharedReadingJournalComment,
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useParams: () => ({ shareToken: 'share-token-1' }),
  }
})

describe('SharedReadingJournalPage', () => {
  beforeEach(() => {
    apiMocks.fetchSharedReadingJournalEntry.mockReset().mockResolvedValue(sharedEntry)
    apiMocks.createSharedReadingJournalComment.mockReset().mockResolvedValue({
      id: 'comment-2',
      display_name: 'Aki',
      body: 'Thank you for sharing this.',
      status: 'pending',
      created_at: '2026-05-13T03:00:00Z',
      moderated_at: null,
    })
  })

  it('renders only the token-scoped shared reading view', async () => {
    renderWithRouter(<SharedReadingJournalPage />)

    expect(await screen.findByRole('heading', { name: 'Kokoro' })).toBeInTheDocument()
    expect(screen.getByText('This one lingers after the final letter.')).toBeInTheDocument()
    expect(screen.getByText('I felt the same after reading it.')).toBeInTheDocument()
    expect(screen.queryByText(/private reading notes/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/share-token/i)).not.toBeInTheDocument()
  })

  it('lets a visitor submit a comment that waits for owner review', async () => {
    const user = userEvent.setup()

    renderWithRouter(<SharedReadingJournalPage />)

    await screen.findByRole('heading', { name: 'Kokoro' })
    await user.type(screen.getByLabelText('Display name'), 'Aki')
    await user.type(screen.getByLabelText('Comment'), 'Thank you for sharing this.')
    await user.click(screen.getByRole('button', { name: 'Submit Comment' }))

    await waitFor(() => {
      expect(apiMocks.createSharedReadingJournalComment).toHaveBeenCalledWith('share-token-1', {
        display_name: 'Aki',
        body: 'Thank you for sharing this.',
      })
    })
    expect(screen.getByText(/waiting for review/i)).toBeInTheDocument()
  })
})
