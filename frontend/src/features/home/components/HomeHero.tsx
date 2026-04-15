import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { siteRoutes } from '@/core/site/routes'

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-950 px-8 py-14 text-white shadow-xl sm:px-12 sm:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.2),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.14),_transparent_28%)]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="relative z-10 max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-200">
          Unified Frontend
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Kelvin&apos;s Creative Lab
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-200 sm:text-xl">
            A quieter front door for experiments worth building, signals worth watching, and a
            reading space worth keeping calm.
          </p>
          <p className="max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            The hero sets tone. The sections below make the tools easy to grasp without turning the
            homepage into a dashboard.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to={siteRoutes.ideas}
            className={buttonVariants({
              variant: 'default',
              className: 'bg-white text-stone-950 hover:bg-zinc-200',
            })}
          >
            Explore Ideas
          </Link>
          <Link
            to={siteRoutes.dailyNuance}
            className={buttonVariants({
              variant: 'outline',
              className:
                'border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white',
            })}
          >
            Check Daily Nuance
          </Link>
        </div>
      </div>
    </section>
  )
}
