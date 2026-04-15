import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import type {
  BookCatalogItem,
  BookProgress,
  ReaderFontFamily,
  ReaderSettings,
  ReaderTheme,
  TocItem,
} from '@/features/book-reader/model/book'

const themeOptions: Array<{ value: ReaderTheme; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'sepia', label: 'Sepia' },
  { value: 'dark', label: 'Dark' },
]

const fontOptions: Array<{ value: ReaderFontFamily; label: string }> = [
  { value: 'serif', label: 'Serif' },
  { value: 'sans', label: 'Sans' },
  { value: 'humanist', label: 'Humanist' },
  { value: 'mono', label: 'Mono' },
]

interface ReaderWorkspaceProps {
  activeBook: BookCatalogItem | null
  progress: BookProgress | null
  settings: ReaderSettings
  toc: TocItem[]
  onThemeChange: (theme: ReaderTheme) => void
  onFontFamilyChange: (fontFamily: ReaderFontFamily) => void
  onFontSizeChange: (fontSize: number) => void
  onLineHeightChange: (lineHeight: number) => void
  onNavigateToToc: (href: string) => void
  onPreviousPage: () => void
  onNextPage: () => void
  children?: ReactNode
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function ReaderWorkspace({
  activeBook,
  progress,
  settings,
  toc,
  onThemeChange,
  onFontFamilyChange,
  onFontSizeChange,
  onLineHeightChange,
  onNavigateToToc,
  onPreviousPage,
  onNextPage,
  children,
}: ReaderWorkspaceProps) {
  const progressLabel =
    typeof progress?.progress === 'number' ? `${Math.round(progress.progress * 100)}% read` : 'New'

  return (
    <section className="rounded-[2rem] border border-stone-900 bg-stone-950 px-5 py-5 text-stone-50 shadow-[0_30px_100px_-40px_rgba(12,10,9,0.85)] md:px-7 md:py-7">
      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="w-full xl:max-w-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300/80">
            Reader Workspace
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            {activeBook ? activeBook.title : 'Choose a book to start reading'}
          </h2>
          <p className="mt-3 text-sm leading-7 text-stone-300">
            {activeBook
              ? 'The in-site reader is tuned for focused long-form reading. Keep the legacy route for heavier library operations.'
              : 'Pick a title from the shelf to mount the new in-site EPUB surface here.'}
          </p>

          {activeBook ? (
            <>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-300">
                <span className="rounded-full border border-stone-700 bg-stone-900 px-3 py-1">
                  {activeBook.author}
                </span>
                <span className="rounded-full border border-stone-700 bg-stone-900 px-3 py-1">
                  {progressLabel}
                </span>
              </div>

              <div className="mt-6 space-y-5 rounded-[1.5rem] border border-stone-800 bg-stone-900/70 p-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                    Theme
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {themeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          settings.theme === option.value
                            ? 'bg-amber-200 text-stone-900'
                            : 'border border-stone-700 bg-stone-950 text-stone-300 hover:border-stone-500'
                        }`}
                        onClick={() => onThemeChange(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                    Typeface
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {fontOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          settings.fontFamily === option.value
                            ? 'bg-stone-100 text-stone-900'
                            : 'border border-stone-700 bg-stone-950 text-stone-300 hover:border-stone-500'
                        }`}
                        onClick={() => onFontFamilyChange(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                      Font Size
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="rounded-xl border-stone-700 bg-stone-950 text-stone-100 hover:bg-stone-800"
                        onClick={() => onFontSizeChange(clamp(settings.fontSize - 1, 14, 26))}
                      >
                        A-
                      </Button>
                      <span className="text-sm text-stone-300">{settings.fontSize}px</span>
                      <Button
                        variant="outline"
                        className="rounded-xl border-stone-700 bg-stone-950 text-stone-100 hover:bg-stone-800"
                        onClick={() => onFontSizeChange(clamp(settings.fontSize + 1, 14, 26))}
                      >
                        A+
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                      Line Height
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="rounded-xl border-stone-700 bg-stone-950 text-stone-100 hover:bg-stone-800"
                        onClick={() =>
                          onLineHeightChange(Number(clamp(settings.lineHeight - 0.1, 1.3, 2.2).toFixed(1)))
                        }
                      >
                        Tighten
                      </Button>
                      <span className="text-sm text-stone-300">{settings.lineHeight.toFixed(1)}</span>
                      <Button
                        variant="outline"
                        className="rounded-xl border-stone-700 bg-stone-950 text-stone-100 hover:bg-stone-800"
                        onClick={() =>
                          onLineHeightChange(Number(clamp(settings.lineHeight + 0.1, 1.3, 2.2).toFixed(1)))
                        }
                      >
                        Relax
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-stone-800 bg-stone-900/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-300">
                    Table of Contents
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="rounded-xl border-stone-700 bg-stone-950 text-stone-100 hover:bg-stone-800"
                      onClick={onPreviousPage}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl border-stone-700 bg-stone-950 text-stone-100 hover:bg-stone-800"
                      onClick={onNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>

                <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
                  {toc.length > 0 ? (
                    toc.map((item) => (
                      <button
                        key={`${item.href}-${item.label}`}
                        type="button"
                        className="block w-full rounded-xl px-3 py-2 text-left text-sm text-stone-300 transition hover:bg-stone-800 hover:text-white"
                        style={{ paddingLeft: `${0.75 + item.depth * 0.8}rem` }}
                        onClick={() => onNavigateToToc(item.href)}
                      >
                        {item.label}
                      </button>
                    ))
                  ) : (
                    <p className="rounded-xl border border-dashed border-stone-700 px-3 py-4 text-sm text-stone-400">
                      TOC entries will appear once the EPUB has mounted.
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="min-h-[28rem] flex-1">
          {activeBook ? (
            children
          ) : (
            <div className="flex h-full min-h-[28rem] items-center justify-center rounded-[1.75rem] border border-dashed border-stone-700 bg-stone-900/60 px-6 text-center">
              <div className="max-w-lg space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Workspace Ready
                </p>
                <h3 className="text-2xl font-semibold tracking-tight text-stone-100">
                  The new in-site surface is ready for a book.
                </h3>
                <p className="text-sm leading-7 text-stone-400 sm:text-base">
                  Open a title from the shelf above and this panel will switch into the live EPUB
                  reader without leaving the unified frontend.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
