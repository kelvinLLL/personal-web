import type { BookProgress, ReaderSettings } from '@/features/book-reader/model/book'

const SETTINGS_KEY = 'personal-web:book-reader:settings'
const PROGRESS_KEY = 'personal-web:book-reader:progress'
const LAST_OPENED_BOOK_KEY = 'personal-web:book-reader:last-opened-book'

const defaultReaderSettings: ReaderSettings = {
  theme: 'light',
  fontFamily: 'serif',
  fontSize: 18,
  lineHeight: 1.8,
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readJson<T>(key: string): T | null {
  if (!canUseStorage()) {
    return null
  }

  try {
    const rawValue = window.localStorage.getItem(key)
    return rawValue ? (JSON.parse(rawValue) as T) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

export function loadReaderSettings(): ReaderSettings {
  const persisted = readJson<Partial<ReaderSettings>>(SETTINGS_KEY)
  if (!persisted) {
    return defaultReaderSettings
  }

  return {
    theme: persisted.theme ?? defaultReaderSettings.theme,
    fontFamily: persisted.fontFamily ?? defaultReaderSettings.fontFamily,
    fontSize:
      typeof persisted.fontSize === 'number' ? persisted.fontSize : defaultReaderSettings.fontSize,
    lineHeight:
      typeof persisted.lineHeight === 'number'
        ? persisted.lineHeight
        : defaultReaderSettings.lineHeight,
  }
}

export function saveReaderSettings(settings: ReaderSettings) {
  writeJson(SETTINGS_KEY, settings)
}

export function loadReaderProgressMap(): Record<string, BookProgress> {
  return readJson<Record<string, BookProgress>>(PROGRESS_KEY) ?? {}
}

export function saveReaderProgress(progress: BookProgress) {
  const nextMap = {
    ...loadReaderProgressMap(),
    [progress.bookId]: progress,
  }

  writeJson(PROGRESS_KEY, nextMap)
}

export function loadLastOpenedBookId() {
  if (!canUseStorage()) {
    return null
  }

  return window.localStorage.getItem(LAST_OPENED_BOOK_KEY)
}

export function saveLastOpenedBookId(bookId: string) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(LAST_OPENED_BOOK_KEY, bookId)
}
