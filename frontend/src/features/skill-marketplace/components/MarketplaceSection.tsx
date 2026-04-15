import { MarketplaceCard } from '@/features/skill-marketplace/components/MarketplaceCard'
import { MarketplaceEmptyState } from '@/features/skill-marketplace/components/MarketplaceEmptyState'
import { MarketplaceFeaturedRow } from '@/features/skill-marketplace/components/MarketplaceFeaturedRow'
import type { MarketplaceEntry } from '@/features/skill-marketplace/model/marketplace'

interface MarketplaceSectionProps {
  id: string
  eyebrow: string
  title: string
  description: string
  tone: 'personal' | 'community'
  featuredEntries: MarketplaceEntry[]
  gridEntries: MarketplaceEntry[]
}

export function MarketplaceSection({
  id,
  eyebrow,
  title,
  description,
  tone,
  featuredEntries,
  gridEntries,
}: MarketplaceSectionProps) {
  const hasEntries = featuredEntries.length > 0 || gridEntries.length > 0

  return (
    <section
      id={id}
      className={
        tone === 'personal'
          ? 'rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm md:p-8'
          : 'rounded-[2rem] border border-stone-200 bg-stone-50/70 p-6 shadow-sm md:p-8'
      }
    >
      <div className="max-w-3xl space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">{title}</h2>
        <p className="text-sm leading-7 text-stone-600 sm:text-base">{description}</p>
      </div>

      {!hasEntries ? (
        <div className="mt-6">
          <MarketplaceEmptyState
            title="No entries match these filters."
            description="Try a different chip combination to widen the shelf again."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <MarketplaceFeaturedRow
            entries={featuredEntries}
            tone={tone}
          />

          {gridEntries.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {gridEntries.map((entry) => (
                <MarketplaceCard
                  key={entry.id}
                  entry={entry}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
