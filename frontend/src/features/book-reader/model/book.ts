export type BookFormat = 'epub' | 'pdf'

export interface BookCatalogItem {
  id: string
  filename: string
  title: string
  author: string
  format: BookFormat
  assetPath: string
}

export type ReaderTheme = 'light' | 'dark' | 'sepia'

export type ReaderFontFamily = 'serif' | 'sans' | 'humanist' | 'mono'

export interface ReaderSettings {
  theme: ReaderTheme
  fontFamily: ReaderFontFamily
  fontSize: number
  lineHeight: number
}

export interface BookProgress {
  bookId: string
  location: string | null
  progress: number | null
  lastOpenedAt: string
}

export interface TocItem {
  label: string
  href: string
  depth: number
}

export interface ReaderLocationUpdate {
  location: string | null
  href: string | null
  progress: number | null
}
