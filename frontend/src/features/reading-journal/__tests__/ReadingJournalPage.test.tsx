import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithRouter, screen, userEvent, waitFor } from '@/test/utils'
import { ReadingJournalPage } from '@/features/reading-journal/page/ReadingJournalPage'
import type { ReadingJournalEntry } from '@/features/reading-journal/model/readingJournal'

const apiMocks = vi.hoisted(() => ({
  fetchReadingJournalEntries: vi.fn(),
  createReadingJournalEntry: vi.fn(),
  updateReadingJournalEntry: vi.fn(),
  deleteReadingJournalEntry: vi.fn(),
  generateReadingJournalShareToken: vi.fn(),
  updateReadingJournalCommentStatus: vi.fn(),
}))

let isAdminState = true

const journalEntry: ReadingJournalEntry = {
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
  started_on: '',
  finished_on: '',
  short_impression: 'A quiet study of distance and guilt.',
  public_impression: 'This one lingers after the final letter.',
  reflection: 'Private reading notes stay here.',
  quotes: [
    {
      id: 'quote-1',
      text: 'A sentence worth keeping.',
      chapter: 'Sensei and I',
      page: '42',
      location: '',
      note: 'A margin thought.',
      tags: ['loneliness'],
      is_spoiler: false,
      created_at: '2026-05-13T00:00:00Z',
    },
  ],
  comments_enabled: true,
  share_token: 'share-token-1',
  comments: [
    {
      id: 'comment-1',
      display_name: 'Mina',
      body: 'I felt the same after reading it.',
      status: 'pending',
      created_at: '2026-05-13T01:00:00Z',
      moderated_at: null,
    },
  ],
  created_at: '2026-05-13T00:00:00Z',
  updated_at: '2026-05-13T00:00:00Z',
}

vi.mock('@/features/reading-journal/api/readingJournalApi', () => ({
  fetchReadingJournalEntries: apiMocks.fetchReadingJournalEntries,
  createReadingJournalEntry: apiMocks.createReadingJournalEntry,
  updateReadingJournalEntry: apiMocks.updateReadingJournalEntry,
  deleteReadingJournalEntry: apiMocks.deleteReadingJournalEntry,
  generateReadingJournalShareToken: apiMocks.generateReadingJournalShareToken,
  updateReadingJournalCommentStatus: apiMocks.updateReadingJournalCommentStatus,
}))

vi.mock('@/store/aiConfigStore', () => ({
  useAIConfigStore: (selector: (state: { isAdmin: () => boolean }) => unknown) =>
    selector({ isAdmin: () => isAdminState }),
}))

describe('ReadingJournalPage', () => {
  beforeEach(() => {
    isAdminState = true
    apiMocks.fetchReadingJournalEntries.mockReset().mockResolvedValue([journalEntry])
    apiMocks.createReadingJournalEntry.mockReset()
    apiMocks.updateReadingJournalEntry.mockReset()
    apiMocks.deleteReadingJournalEntry.mockReset().mockResolvedValue(undefined)
    apiMocks.generateReadingJournalShareToken.mockReset().mockResolvedValue({
      share_token: 'new-share-token',
    })
    apiMocks.updateReadingJournalCommentStatus.mockReset().mockResolvedValue({
      ...journalEntry.comments[0],
      status: 'approved',
    })
  })

  it('shows an auth-gated private journal entry point when admin access is missing', () => {
    isAdminState = false

    renderWithRouter(<ReadingJournalPage />)

    expect(screen.getByRole('heading', { name: '私人读书手帐' })).toBeInTheDocument()
    expect(screen.getByText(/翻开自己的书页/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '去设置登录' })).toBeInTheDocument()
    expect(apiMocks.fetchReadingJournalEntries).not.toHaveBeenCalled()
  })

  it('renders entries as a quiet hand-journal surface with quotes and pending comments', async () => {
    renderWithRouter(<ReadingJournalPage />)

    expect(await screen.findByRole('heading', { name: 'Kokoro' })).toBeInTheDocument()
    expect(screen.getAllByText('Natsume Soseki').length).toBeGreaterThan(0)
    expect(screen.getByText('Private reading notes stay here.')).toBeInTheDocument()
    expect(screen.getByText('A sentence worth keeping.')).toBeInTheDocument()
    expect(screen.getByText('边注留言')).toBeInTheDocument()
    expect(screen.getByText('I felt the same after reading it.')).toBeInTheDocument()
    expect(screen.getByText(/静かな書斎/i)).toBeInTheDocument()
    expect(screen.getByText('书目索引')).toBeInTheDocument()
  })

  it('creates a simple reading journal entry from the owner form', async () => {
    const user = userEvent.setup()
    apiMocks.createReadingJournalEntry.mockResolvedValue({
      ...journalEntry,
      id: 'entry-2',
      book: { ...journalEntry.book, title: 'Snow Country', author: 'Yasunari Kawabata' },
    })

    renderWithRouter(<ReadingJournalPage />)

    await screen.findByRole('heading', { name: 'Kokoro' })
    await user.click(screen.getByRole('button', { name: '添一页' }))
    await user.type(screen.getByLabelText('书名'), 'Snow Country')
    await user.type(screen.getByLabelText('作者'), 'Yasunari Kawabata')
    await user.type(screen.getByLabelText('一句感想'), 'A cold, beautiful distance.')
    await user.type(screen.getByLabelText('私密札记'), 'A private note.')
    await user.click(screen.getByRole('button', { name: '存下这一页' }))

    await waitFor(() => {
      expect(apiMocks.createReadingJournalEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          book: expect.objectContaining({
            title: 'Snow Country',
            author: 'Yasunari Kawabata',
          }),
          short_impression: 'A cold, beautiful distance.',
          reflection: 'A private note.',
        }),
      )
    })
  })

  it('generates a share token and approves a pending comment', async () => {
    const user = userEvent.setup()

    renderWithRouter(<ReadingJournalPage />)

    await screen.findByRole('heading', { name: 'Kokoro' })
    await user.click(screen.getByRole('button', { name: '重写分享笺' }))

    await waitFor(() => {
      expect(apiMocks.generateReadingJournalShareToken).toHaveBeenCalledWith('entry-1')
    })

    await user.click(screen.getByRole('button', { name: '收下 Mina 的留言' }))

    await waitFor(() => {
      expect(apiMocks.updateReadingJournalCommentStatus).toHaveBeenCalledWith(
        'entry-1',
        'comment-1',
        'approved',
      )
    })
  })

  it('updates and deletes an owner entry from the selected notebook page', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    apiMocks.updateReadingJournalEntry.mockResolvedValue({
      ...journalEntry,
      book: { ...journalEntry.book, title: 'Kokoro Revised' },
      reflection: 'A revised private note.',
    })

    renderWithRouter(<ReadingJournalPage />)

    await screen.findByRole('heading', { name: 'Kokoro' })
    await user.click(screen.getByRole('button', { name: '编辑' }))
    await user.clear(screen.getByLabelText('书名'))
    await user.type(screen.getByLabelText('书名'), 'Kokoro Revised')
    await user.clear(screen.getByLabelText('私密札记'))
    await user.type(screen.getByLabelText('私密札记'), 'A revised private note.')
    await user.click(screen.getByRole('button', { name: '更新这一页' }))

    await waitFor(() => {
      expect(apiMocks.updateReadingJournalEntry).toHaveBeenCalledWith(
        'entry-1',
        expect.objectContaining({
          book: expect.objectContaining({ title: 'Kokoro Revised' }),
          reflection: 'A revised private note.',
        }),
      )
    })
    expect(await screen.findByRole('heading', { name: 'Kokoro Revised' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '删除' }))

    await waitFor(() => {
      expect(apiMocks.deleteReadingJournalEntry).toHaveBeenCalledWith('entry-1')
    })
    expect(confirmSpy).toHaveBeenCalledWith('要删除这一页读书手帐吗？')
  })
})
