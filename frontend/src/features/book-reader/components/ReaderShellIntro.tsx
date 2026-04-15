export function ReaderShellIntro() {
  return (
    <section className="rounded-3xl border border-stone-200 bg-gradient-to-br from-stone-50 via-amber-50/40 to-white p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
        Reading Surface
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
        Read inside the main site.
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-600 md:text-base">
        The first unified EPUB reading flow is now shipping here. Preset reading, progress memory,
        and the main workspace live in-site; uploads and heavier file handling stay in the legacy
        reader during this pass.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
          EPUB first
        </span>
        <span className="rounded-full border border-amber-200 bg-amber-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-900">
          Legacy backup live
        </span>
      </div>
    </section>
  )
}
