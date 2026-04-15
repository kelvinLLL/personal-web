import { buttonVariants } from '@/components/ui/button'

interface MarketplaceHeroProps {
  personalCount: number
  communityCount: number
  artifactTypeCount: number
}

export function MarketplaceHero({
  personalCount,
  communityCount,
  artifactTypeCount,
}: MarketplaceHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-950 px-8 py-14 text-white shadow-xl sm:px-12 sm:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.24),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.18),_transparent_28%)]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-200">
            Directory-first release
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Skill Marketplace</h1>
            <p className="max-w-2xl text-lg leading-8 text-zinc-200 sm:text-xl">
              Browse your own skills and a clearly separated curated shelf of community tools.
            </p>
            <p className="max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
              This first release is about discovery, comparison, and remembering why an entry
              matters. It is not trying to be an installer or a dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="#my-skills"
              className={buttonVariants({
                variant: 'default',
                className: 'bg-white text-stone-950 hover:bg-zinc-200',
              })}
            >
              Browse My Skills
            </a>
            <a
              href="#curated-community"
              className={buttonVariants({
                variant: 'outline',
                className:
                  'border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white',
              })}
            >
              Jump To Curated Community
            </a>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300">
              My Skills
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">{personalCount}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300">
              Curated Picks
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">{communityCount}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300">
              Artifact Types
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">{artifactTypeCount}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
