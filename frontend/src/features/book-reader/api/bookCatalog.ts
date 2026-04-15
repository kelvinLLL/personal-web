import type { BookCatalogItem, BookFormat } from '@/features/book-reader/model/book'

interface CatalogResponseItem {
  id?: unknown
  filename?: unknown
  title?: unknown
  author?: unknown
  format?: unknown
}

const MANIFEST_PATH = '/books/manifest.json'

function isSupportedFormat(value: unknown): value is BookFormat {
  return value === 'epub' || value === 'pdf'
}

function toBookCatalogItem(item: CatalogResponseItem): BookCatalogItem | null {
  if (
    typeof item.id !== 'string' ||
    typeof item.filename !== 'string' ||
    typeof item.title !== 'string' ||
    typeof item.author !== 'string' ||
    !isSupportedFormat(item.format)
  ) {
    return null
  }

  return {
    id: item.id,
    filename: item.filename,
    title: item.title,
    author: item.author,
    format: item.format,
    assetPath: `/books/${encodeURIComponent(item.filename)}`,
  }
}

export async function loadBookCatalog(): Promise<BookCatalogItem[]> {
  const response = await fetch(MANIFEST_PATH)
  if (!response.ok) {
    throw new Error(`Failed to load book manifest: ${response.status}`)
  }

  const payload = (await response.json()) as CatalogResponseItem[]
  if (!Array.isArray(payload)) {
    throw new Error('Invalid book manifest payload.')
  }

  return payload.map(toBookCatalogItem).filter((item): item is BookCatalogItem => item !== null)
}
