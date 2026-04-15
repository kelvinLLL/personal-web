import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type {
  BookCatalogItem,
  ReaderLocationUpdate,
  ReaderSettings,
  TocItem,
} from '@/features/book-reader/model/book'

export interface EpubReaderSurfaceHandle {
  next: () => void
  previous: () => void
  goTo: (target: string) => void
}

interface EpubReaderSurfaceProps {
  book: BookCatalogItem
  settings: ReaderSettings
  savedLocation: string | null
  onTocLoad: (toc: TocItem[]) => void
  onLocationChange: (update: ReaderLocationUpdate) => void
}

const FONT_FAMILIES = {
  serif: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
  sans: '"Geist Variable", "Inter", "Helvetica Neue", Arial, sans-serif',
  humanist: '"Optima", "Gill Sans", "Trebuchet MS", sans-serif',
  mono: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace',
} as const

const THEME_TOKENS = {
  light: {
    background: '#f8f7f3',
    foreground: '#1c1917',
    link: '#0f766e',
  },
  sepia: {
    background: '#f2e7d5',
    foreground: '#33251a',
    link: '#9a3412',
  },
  dark: {
    background: '#111827',
    foreground: '#f5f5f4',
    link: '#7dd3fc',
  },
} as const

function buildReaderCss(settings: ReaderSettings) {
  const theme = THEME_TOKENS[settings.theme]
  const fontFamily = FONT_FAMILIES[settings.fontFamily]

  return `
    :root {
      color-scheme: ${settings.theme === 'dark' ? 'dark' : 'light'};
    }

    html, body {
      background: ${theme.background} !important;
      color: ${theme.foreground} !important;
      font-family: ${fontFamily} !important;
      font-size: ${settings.fontSize}px !important;
      line-height: ${settings.lineHeight} !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    a {
      color: ${theme.link} !important;
    }

    img, svg, video {
      max-width: 100% !important;
      height: auto !important;
    }

    p, li, blockquote {
      margin-bottom: 0.95em !important;
    }

    h1, h2, h3, h4, h5, h6 {
      color: ${theme.foreground} !important;
      line-height: 1.25 !important;
    }
  `
}

function injectReaderStyle(doc: Document, settings: ReaderSettings) {
  let styleElement = doc.getElementById('personal-web-epub-theme')
  if (!styleElement) {
    styleElement = doc.createElement('style')
    styleElement.id = 'personal-web-epub-theme'
    doc.head?.appendChild(styleElement)
  }

  styleElement.textContent = buildReaderCss(settings)
}

function flattenToc(items: any[], depth = 0): TocItem[] {
  return items.flatMap((item) => {
    const currentItem =
      typeof item?.label === 'string' && typeof item?.href === 'string'
        ? [{ label: item.label.trim(), href: item.href, depth }]
        : []

    return currentItem.concat(flattenToc(item?.subitems ?? [], depth + 1))
  })
}

export const EpubReaderSurface = forwardRef<EpubReaderSurfaceHandle, EpubReaderSurfaceProps>(
  function EpubReaderSurface(
    { book, settings, savedLocation, onTocLoad, onLocationChange },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const bookRef = useRef<any>(null)
    const renditionRef = useRef<any>(null)
    const settingsRef = useRef(settings)
    const onTocLoadRef = useRef(onTocLoad)
    const onLocationChangeRef = useRef(onLocationChange)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
      settingsRef.current = settings
    }, [settings])

    useEffect(() => {
      onTocLoadRef.current = onTocLoad
    }, [onTocLoad])

    useEffect(() => {
      onLocationChangeRef.current = onLocationChange
    }, [onLocationChange])

    useImperativeHandle(
      ref,
      () => ({
        next: () => {
          void renditionRef.current?.next?.()
        },
        previous: () => {
          void renditionRef.current?.prev?.()
        },
        goTo: (target: string) => {
          void renditionRef.current?.display?.(target)
        },
      }),
      [],
    )

    useEffect(() => {
      if (book.format !== 'epub' || !containerRef.current) {
        return
      }

      let disposed = false
      let teardown: (() => void) | undefined

      async function mountReader() {
        setIsLoading(true)
        setError(null)
        onTocLoadRef.current([])

        try {
          const { default: ePub } = await import('epubjs')
          if (disposed || !containerRef.current) {
            return
          }

          const nextBook = ePub(book.assetPath)
          const rendition = nextBook.renderTo(containerRef.current, {
            width: '100%',
            height: '100%',
            spread: 'none',
            flow: 'paginated',
          })

          bookRef.current = nextBook
          renditionRef.current = rendition

          const handleRelocated = (location: any) => {
            const cfi = location?.start?.cfi ?? location?.start ?? null
            const href = location?.start?.href ?? null
            const progress =
              typeof cfi === 'string' && nextBook.locations?.percentageFromCfi
                ? nextBook.locations.percentageFromCfi(cfi)
                : null

            onLocationChangeRef.current({
              location: cfi,
              href,
              progress: typeof progress === 'number' ? progress : null,
            })
          }

          rendition.hooks.content.register((contents: any) => {
            const doc = contents?.document as Document | undefined
            if (doc) {
              injectReaderStyle(doc, settingsRef.current)
            }
          })

          rendition.on('relocated', handleRelocated)
          rendition.on('locationChanged', handleRelocated)

          await nextBook.ready
          await nextBook.locations.generate(1600).catch(() => undefined)

          const navigation = await nextBook.loaded.navigation.catch(() => null)
          if (!disposed) {
            onTocLoadRef.current(flattenToc(navigation?.toc ?? []))
          }

          await rendition.display(savedLocation ?? undefined)
          if (!disposed) {
            setIsLoading(false)
          }

          teardown = () => {
            try {
              rendition.off?.('relocated', handleRelocated)
              rendition.off?.('locationChanged', handleRelocated)
              nextBook.destroy?.()
            } catch {
              // Ignore EPUB teardown errors during navigation.
            }
          }
        } catch (mountError) {
          if (!disposed) {
            setError('Could not open this EPUB.')
            setIsLoading(false)
          }
          console.error(mountError)
        }
      }

      void mountReader()

      return () => {
        disposed = true
        teardown?.()
        onTocLoadRef.current([])
        bookRef.current = null
        renditionRef.current = null
      }
    }, [book.assetPath, book.format])

    useEffect(() => {
      const rendition = renditionRef.current
      if (!rendition) {
        return
      }

      const views = rendition.views?.() ?? []
      for (const view of views) {
        const doc = view?.contents?.document as Document | undefined
        if (doc) {
          injectReaderStyle(doc, settings)
        }
      }
    }, [settings])

    const surfaceBackground = THEME_TOKENS[settings.theme].background

    return (
      <div className="relative h-full min-h-[28rem] overflow-hidden rounded-[1.75rem] border border-stone-700 bg-stone-950/80">
        <div
          ref={containerRef}
          data-testid="epub-reader-surface"
          className="h-full min-h-[28rem] w-full"
          style={{ backgroundColor: surfaceBackground }}
        />

        {isLoading ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-stone-950/70">
            <div className="space-y-3 text-center">
              <div className="mx-auto size-10 animate-spin rounded-full border-2 border-stone-700 border-t-amber-300" />
              <p className="text-sm font-medium text-stone-200">Opening EPUB...</p>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-950/90 px-6">
            <div className="max-w-md space-y-3 rounded-[1.5rem] border border-stone-700 bg-stone-900/90 px-6 py-5 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
                Reader Error
              </p>
              <h3 className="text-xl font-semibold text-stone-100">{error}</h3>
              <p className="text-sm leading-7 text-stone-400">
                Use the legacy route if you need the older reader while this new slice keeps
                hardening.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    )
  },
)
