export type ReadingStatus = 'planned' | 'reading' | 'finished' | 'paused' | 'abandoned'

export type CommentStatus = 'pending' | 'approved' | 'rejected'

export interface BookNote {
  title: string
  author: string
  original_title: string
  translator: string
  publisher: string
  language: string
  tags: string[]
}

export interface QuotePayload {
  id?: string | null
  text: string
  chapter: string
  page: string
  location: string
  note: string
  tags: string[]
  is_spoiler: boolean
  created_at?: string | null
}

export interface Quote extends QuotePayload {
  id: string
  created_at: string
}

export interface JournalComment {
  id: string
  display_name: string
  body: string
  status: CommentStatus
  created_at: string
  moderated_at: string | null
}

export interface VisitorCommentCreate {
  display_name: string
  body: string
}

export interface ReadingJournalEntryCreate {
  book: BookNote
  status: ReadingStatus
  rating: number | null
  started_on: string
  finished_on: string
  short_impression: string
  public_impression: string
  reflection: string
  quotes: QuotePayload[]
}

export interface ReadingJournalEntryUpdate {
  book?: BookNote
  status?: ReadingStatus
  rating?: number | null
  started_on?: string
  finished_on?: string
  short_impression?: string
  public_impression?: string
  reflection?: string
  quotes?: QuotePayload[]
  comments_enabled?: boolean
}

export interface ReadingJournalEntry extends Omit<ReadingJournalEntryCreate, 'quotes'> {
  id: string
  quotes: Quote[]
  comments_enabled: boolean
  share_token: string | null
  comments: JournalComment[]
  created_at: string
  updated_at: string
}

export interface SharedReadingJournalEntry {
  id: string
  book: BookNote
  status: ReadingStatus
  rating: number | null
  short_impression: string
  public_impression: string
  comments: JournalComment[]
}

export interface ShareTokenResponse {
  share_token: string
}
