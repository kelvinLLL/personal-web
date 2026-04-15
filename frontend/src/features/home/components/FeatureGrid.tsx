import { Link } from 'react-router-dom'
import { homepageFeatureCards } from '@/core/site/navigation'

export function FeatureGrid() {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-stone-50/70 p-6 shadow-sm md:p-8">
      <div className="max-w-3xl space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
          Tool Entrypoints
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
          One public front door, four clear surfaces.
        </h2>
        <p className="text-sm leading-7 text-stone-600 sm:text-base">
          Start with the surface that matches your intent.
        </p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {homepageFeatureCards.map((item) => {
          const cardClassName =
            'group rounded-[1.5rem] border border-stone-200 bg-white px-5 py-4 transition hover:border-stone-300 hover:bg-stone-100/60'
          const content = (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-stone-900 transition-colors group-hover:text-sky-700">
                  {item.label}
                </h3>
                <p className="mt-1 text-sm leading-6 text-stone-600">{item.summary}</p>
              </div>
              <span className="text-lg text-stone-300 transition-colors group-hover:text-sky-700">
                →
              </span>
            </div>
          )

          if (item.appBoundary === 'external' && item.href) {
            return (
              <a
                key={item.href}
                href={item.href}
                data-app-boundary="external"
                className={cardClassName}
              >
                {content}
              </a>
            )
          }

          return (
            <Link
              key={item.to}
              to={item.to!}
              className={cardClassName}
            >
              {content}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
