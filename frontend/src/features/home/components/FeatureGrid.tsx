import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowUpRight,
  Blocks,
  BookOpenText,
  Bot,
  ChevronRight,
  Compass,
  Lightbulb,
  TextCursorInput,
  type LucideIcon,
} from 'lucide-react'
import { homepageFeatureCards } from '@/core/site/navigation'

interface FeatureVisual {
  Icon: LucideIcon
  meta: string
  accent: string
}

const featureVisuals: Record<string, FeatureVisual> = {
  Ideas: {
    Icon: Lightbulb,
    meta: 'Collection',
    accent: 'bg-blue-50 text-blue-700 ring-blue-100',
  },
  'Daily Nuance': {
    Icon: Activity,
    meta: 'Signals',
    accent: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  },
  'Skill Marketplace': {
    Icon: Blocks,
    meta: 'Tools',
    accent: 'bg-violet-50 text-violet-700 ring-violet-100',
  },
  'Book Reader': {
    Icon: BookOpenText,
    meta: 'Reading',
    accent: 'bg-amber-50 text-amber-800 ring-amber-100',
  },
  'String Viewer': {
    Icon: TextCursorInput,
    meta: 'Formatter',
    accent: 'bg-teal-50 text-teal-700 ring-teal-100',
  },
  SuperHaojun: {
    Icon: Bot,
    meta: 'Agent',
    accent: 'bg-zinc-100 text-zinc-800 ring-zinc-200',
  },
}

const fallbackVisual: FeatureVisual = {
  Icon: Compass,
  meta: 'Surface',
  accent: 'bg-zinc-100 text-zinc-800 ring-zinc-200',
}

export function FeatureGrid() {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 border-b border-zinc-200 pb-5 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Tool Entrypoints
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
            Six surfaces, one clean launch point.
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-zinc-600 md:justify-self-end">
          The homepage should not make you decode the site. Each entry below names the job, shows
          the surface type, and keeps the full hit area comfortable on touch devices.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {homepageFeatureCards.map((item) => {
          const visual = featureVisuals[item.label] ?? fallbackVisual
          const Icon = visual.Icon
          const Indicator = item.appBoundary === 'external' ? ArrowUpRight : ChevronRight
          const cardClassName =
            'group flex min-h-40 flex-col justify-between rounded-lg border border-zinc-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-200'
          const content = (
            <>
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`inline-flex size-10 items-center justify-center rounded-lg ring-1 ${visual.accent}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                  {visual.meta}
                </span>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-zinc-950 transition-colors group-hover:text-blue-700">
                    {item.label}
                  </h3>
                  <Indicator
                    className="size-4 text-zinc-400 transition-colors group-hover:text-blue-700"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-sm leading-6 text-zinc-600">{item.summary}</p>
              </div>
            </>
          )

          if (item.appBoundary === 'external' && item.href) {
            return (
              <a
                key={item.href}
                href={item.href}
                data-app-boundary="external"
                className={cardClassName}
                aria-label={`${item.label}: ${item.summary}`}
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
              aria-label={`${item.label}: ${item.summary}`}
            >
              {content}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
