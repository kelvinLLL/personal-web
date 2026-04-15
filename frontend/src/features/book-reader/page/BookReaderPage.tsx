import { useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { redirectToLegacyReader } from '@/core/site/legacyReader'
import { LegacyReaderTransitionCard } from '@/features/book-reader/components/LegacyReaderTransitionCard'

export function BookReaderPage() {
  useEffect(() => {
    redirectToLegacyReader()
  }, [])

  return (
    <PageContainer>
      <div className="space-y-6 py-10 md:space-y-8 md:py-14">
        <section className="rounded-3xl border border-stone-200 bg-gradient-to-br from-stone-50 via-amber-50/40 to-white p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
            Reading Surface
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
            Opening the legacy reader.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-600 md:text-base">
            Book Reader now uses the higher-quality legacy experience. This route forwards there
            directly so reading stays on the more complete surface.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
              Canonical reader
            </span>
            <span className="rounded-full border border-amber-200 bg-amber-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-900">
              Auto-forwarding
            </span>
          </div>
        </section>

        <LegacyReaderTransitionCard />
      </div>
    </PageContainer>
  )
}

export default BookReaderPage
