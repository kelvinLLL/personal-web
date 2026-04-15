import { Button } from '@/components/ui/button'
import type { BookCatalogItem, BookProgress } from '@/features/book-reader/model/book'

interface BookShelfProps {
  books: BookCatalogItem[]
  activeBookId: string | null
  progressById: Record<string, BookProgress>
  onOpenBook: (bookId: string) => void
}

function formatProgress(progress: number | null) {
  if (typeof progress !== 'number') {
    return 'New'
  }

  return `${Math.max(1, Math.round(progress * 100))}% read`
}

export function BookShelf({ books, activeBookId, progressById, onOpenBook }: BookShelfProps) {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-stone-50/80 p-6 shadow-sm md:p-8">
      <div className="max-w-3xl space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
          Current Shelf
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
          Preset books ready for the new reader.
        </h2>
        <p className="text-sm leading-7 text-stone-600 sm:text-base">
          This first slice ships one calm EPUB flow inside the main site. Uploads, PDF tooling, and
          wider library management stay in the legacy reader for now.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {books.map((book) => {
          const isActive = book.id === activeBookId
          const progress = progressById[book.id]

          return (
            <article
              key={book.id}
              className="rounded-[1.5rem] border border-stone-200 bg-white px-5 py-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                  {book.format}
                </span>
                <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-600">
                  {formatProgress(progress?.progress ?? null)}
                </span>
              </div>

              <h3 className="mt-4 text-xl font-semibold text-stone-900">{book.title}</h3>
              <p className="mt-1 text-sm text-stone-500">{book.author}</p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  className="h-10 rounded-xl bg-stone-900 px-4 text-sm font-medium text-white hover:bg-stone-800"
                  onClick={() => onOpenBook(book.id)}
                >
                  {isActive ? 'Continue in new reader' : 'Open in new reader'}
                </Button>
                <span className="text-xs text-stone-500 md:text-sm">
                  {isActive
                    ? 'This title is active in the workspace below.'
                    : 'Open it below without leaving the site.'}
                </span>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
