import { apiRequest } from '@/lib/apiClient'
import { getAdminToken } from '@/lib/adminSession'
import type {
  CommentStatus,
  JournalComment,
  ReadingJournalEntry,
  ReadingJournalEntryCreate,
  ReadingJournalEntryUpdate,
  ShareTokenResponse,
  SharedReadingJournalEntry,
  VisitorCommentCreate,
} from '@/features/reading-journal/model/readingJournal'

const BASE_PATH = '/api/reading-journal'

function ownerToken() {
  return getAdminToken()
}

export async function fetchReadingJournalEntries(): Promise<ReadingJournalEntry[]> {
  return apiRequest<ReadingJournalEntry[]>(BASE_PATH, {
    token: ownerToken(),
  })
}

export async function createReadingJournalEntry(
  entry: ReadingJournalEntryCreate,
): Promise<ReadingJournalEntry> {
  return apiRequest<ReadingJournalEntry>(BASE_PATH, {
    method: 'POST',
    token: ownerToken(),
    body: JSON.stringify(entry),
  })
}

export async function updateReadingJournalEntry(
  entryId: string,
  updates: ReadingJournalEntryUpdate,
): Promise<ReadingJournalEntry> {
  return apiRequest<ReadingJournalEntry>(`${BASE_PATH}/${encodeURIComponent(entryId)}`, {
    method: 'PUT',
    token: ownerToken(),
    body: JSON.stringify(updates),
  })
}

export async function deleteReadingJournalEntry(entryId: string): Promise<void> {
  await apiRequest(`${BASE_PATH}/${encodeURIComponent(entryId)}`, {
    method: 'DELETE',
    token: ownerToken(),
  })
}

export async function generateReadingJournalShareToken(
  entryId: string,
): Promise<ShareTokenResponse> {
  return apiRequest<ShareTokenResponse>(
    `${BASE_PATH}/${encodeURIComponent(entryId)}/share-token`,
    {
      method: 'POST',
      token: ownerToken(),
    },
  )
}

export async function updateReadingJournalCommentStatus(
  entryId: string,
  commentId: string,
  status: CommentStatus,
): Promise<JournalComment> {
  return apiRequest<JournalComment>(
    `${BASE_PATH}/${encodeURIComponent(entryId)}/comments/${encodeURIComponent(commentId)}`,
    {
      method: 'PUT',
      token: ownerToken(),
      body: JSON.stringify({ status }),
    },
  )
}

export async function fetchSharedReadingJournalEntry(
  shareToken: string,
): Promise<SharedReadingJournalEntry> {
  return apiRequest<SharedReadingJournalEntry>(
    `${BASE_PATH}/shared/${encodeURIComponent(shareToken)}`,
  )
}

export async function createSharedReadingJournalComment(
  shareToken: string,
  comment: VisitorCommentCreate,
): Promise<JournalComment> {
  return apiRequest<JournalComment>(
    `${BASE_PATH}/shared/${encodeURIComponent(shareToken)}/comments`,
    {
      method: 'POST',
      body: JSON.stringify(comment),
    },
  )
}
