import { CircleDot, ListChecks } from 'lucide-react'
import { homepageBacklogItems } from '@/core/site/backlog'

const statusLabel = {
  in_progress: 'In Progress',
  pending: 'Pending',
} as const

const statusStyles = {
  in_progress: 'border-amber-200 bg-amber-50 text-amber-900',
  pending: 'border-zinc-200 bg-zinc-50 text-zinc-700',
} as const

export function RoadmapSection() {
  return (
    <section className="grid gap-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm md:grid-cols-[0.78fr_1.22fr] md:p-6">
      <div className="space-y-4">
        <span className="inline-flex size-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
          <ListChecks className="size-5" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Operating Queue
          </p>
          <h2 className="text-2xl font-semibold text-zinc-950">
            Active bets stay visible without becoming the page.
          </h2>
          <p className="text-sm leading-7 text-zinc-600">
            A compact backlog keeps direction legible while the main navigation stays focused on
            useful surfaces.
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {homepageBacklogItems.map((item) => (
          <article
            key={item.id}
            className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  {item.id}
                </p>
                <h3 className="text-lg font-semibold text-zinc-950">{item.title}</h3>
              </div>
              <span
                className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold ${statusStyles[item.status]}`}
              >
                <CircleDot className="size-3.5" aria-hidden="true" />
                {statusLabel[item.status]}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-600">{item.summary}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
