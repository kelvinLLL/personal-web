import { homepageBacklogItems } from '@/core/site/backlog'

const statusLabel = {
  in_progress: 'In Progress',
  pending: 'Pending',
} as const

const statusStyles = {
  in_progress: 'border-amber-300 bg-amber-100 text-amber-900',
  pending: 'border-stone-200 bg-stone-100 text-stone-700',
} as const

export function RoadmapSection() {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm md:p-8">
      <div className="max-w-3xl space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
          Current Backlog
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
          What the next passes are actually trying to ship.
        </h2>
        <p className="text-sm leading-7 text-stone-600 sm:text-base">
          This is the short operational view, not a dashboard. It exists so the homepage keeps the
          active product bets visible while the site evolves.
        </p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {homepageBacklogItems.map((item) => (
          <article
            key={item.id}
            className="rounded-[1.5rem] border border-stone-200 bg-stone-50/70 px-5 py-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                  {item.id}
                </p>
                <h3 className="text-lg font-semibold text-stone-900">{item.title}</h3>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[item.status]}`}
              >
                {statusLabel[item.status]}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-600">{item.summary}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
