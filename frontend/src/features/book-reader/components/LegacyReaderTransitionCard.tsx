import { getLegacyReaderHref, isLegacyReaderExternalApp } from '@/core/site/legacyReader'

export function LegacyReaderTransitionCard() {
  const legacyHref = getLegacyReaderHref()

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-xl font-semibold text-stone-900">Legacy reader</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 md:text-base">
        Book Reader now resolves to the legacy surface because it remains the higher-quality reading
        experience. Use it for uploads, PDFs, EPUBs, and uninterrupted reading.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a
          href={legacyHref}
          data-app-boundary={isLegacyReaderExternalApp() ? 'external' : 'internal'}
          className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800"
        >
          Continue to legacy reader
        </a>
        <p className="text-xs text-stone-500 md:text-sm">
          This is the canonical reader entry for now.
        </p>
      </div>
    </section>
  )
}
