import { Link, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { PageContainer } from '@/components/layout/PageContainer'
import { MarketplaceCard } from '@/features/skill-marketplace/components/MarketplaceCard'
import { MarketplaceSignalList } from '@/features/skill-marketplace/components/MarketplaceSignalList'
import { getMarketplaceEntry, getRelatedEntries, isOwnerType } from '@/features/skill-marketplace/lib/lookup'
import {
  artifactTypeLabels,
  compatibilityLabels,
  maturityLabels,
  reuseFrequencyLabels,
  trustLevelLabels,
} from '@/features/skill-marketplace/model/marketplace'
import { siteRoutes } from '@/core/site/routes'

export function SkillMarketplaceDetailPage() {
  const { ownerType, slug } = useParams()

  if (!isOwnerType(ownerType) || !slug) {
    return (
      <PageContainer className="space-y-6">
        <div className="rounded-[2rem] border border-stone-200 bg-white px-6 py-8 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
            Marketplace entry not found.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
            This detail route does not match a known personal or community entry yet.
          </p>
          <Link
            to={siteRoutes.skillMarketplace}
            className={buttonVariants({
              variant: 'outline',
              className: 'mt-5 border-stone-200 bg-white text-stone-800 hover:bg-stone-100',
            })}
          >
            Back to Skill Marketplace
          </Link>
        </div>
      </PageContainer>
    )
  }

  const entry = getMarketplaceEntry(ownerType, slug)

  if (!entry) {
    return (
      <PageContainer className="space-y-6">
        <div className="rounded-[2rem] border border-stone-200 bg-white px-6 py-8 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
            Marketplace entry not found.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
            The catalog has no entry for this slug yet, or it may have moved to a different shelf.
          </p>
          <Link
            to={siteRoutes.skillMarketplace}
            className={buttonVariants({
              variant: 'outline',
              className: 'mt-5 border-stone-200 bg-white text-stone-800 hover:bg-stone-100',
            })}
          >
            Back to Skill Marketplace
          </Link>
        </div>
      </PageContainer>
    )
  }

  const relatedEntries = getRelatedEntries(entry)

  return (
    <PageContainer className="space-y-8 md:space-y-10">
      <section className="rounded-[2rem] border border-stone-200 bg-white px-6 py-8 shadow-sm md:px-8">
        <Link
          to={siteRoutes.skillMarketplace}
          className={buttonVariants({
            variant: 'outline',
            className: 'mb-5 border-stone-200 bg-white text-stone-800 hover:bg-stone-100',
          })}
        >
          Back to Skill Marketplace
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-stone-200 bg-stone-50 text-stone-700"
          >
            {artifactTypeLabels[entry.artifactType]}
          </Badge>
          {entry.compatibility.map((item) => (
            <Badge
              key={item}
              variant="outline"
              className="border-sky-200 bg-sky-50 text-sky-800"
            >
              {compatibilityLabels[item]}
            </Badge>
          ))}
        </div>

        <div className="mt-5 max-w-4xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900">{entry.name}</h1>
          <p className="text-lg leading-8 text-stone-700">{entry.summary}</p>
          <p className="max-w-3xl text-sm leading-7 text-stone-600 sm:text-base">
            {entry.whyItMatters}
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="rounded-[1.5rem] border border-stone-200 bg-white px-5 py-5 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900">Overview</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">{entry.detail.overview}</p>
          </section>

          <section className="rounded-[1.5rem] border border-stone-200 bg-white px-5 py-5 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900">Why It Matters</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">{entry.whyItMatters}</p>
          </section>

          <MarketplaceSignalList
            title="Usage Context"
            items={entry.detail.usageContext}
          />

          <section className="rounded-[1.5rem] border border-stone-200 bg-white px-5 py-5 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900">Links</h2>
            {entry.detail.links.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-3">
                {entry.detail.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({
                      variant: 'outline',
                      className: 'border-stone-200 bg-white text-stone-800 hover:bg-stone-100',
                    })}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-stone-600">
                Source material is currently kept locally rather than linked from the public UI.
              </p>
            )}
          </section>
        </div>

        <div className="space-y-6">
          {entry.ownerType === 'personal' ? (
            <>
              <section className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-5 py-5 shadow-sm">
                <h2 className="text-lg font-semibold text-stone-900">Signals</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                      Maturity
                    </p>
                    <p className="mt-2 text-base font-semibold text-stone-900">
                      {maturityLabels[entry.signals.maturity]}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                      Reuse Frequency
                    </p>
                    <p className="mt-2 text-base font-semibold text-stone-900">
                      {reuseFrequencyLabels[entry.signals.reuseFrequency]}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-stone-600">
                  {entry.signals.workflowWeakness}
                </p>
              </section>

              <MarketplaceSignalList
                title="Key Constraints"
                items={entry.signals.keyConstraints}
              />
              <MarketplaceSignalList
                title="Key Insights"
                items={entry.signals.keyInsights}
              />
              <MarketplaceSignalList
                title="Used In"
                items={entry.signals.usedIn}
              />
            </>
          ) : (
            <>
              <section className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-5 py-5 shadow-sm">
                <h2 className="text-lg font-semibold text-stone-900">Why Curated</h2>
                <p className="mt-3 text-sm leading-7 text-stone-600">{entry.signals.curationReason}</p>
              </section>

              <section className="rounded-[1.5rem] border border-stone-200 bg-white px-5 py-5 shadow-sm">
                <h2 className="text-lg font-semibold text-stone-900">Trust Level</h2>
                <p className="mt-3 text-sm font-semibold text-stone-900">
                  {trustLevelLabels[entry.signals.trustLevel]}
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Last reviewed {entry.signals.lastReviewed}
                </p>
              </section>

              <section className="rounded-[1.5rem] border border-stone-200 bg-white px-5 py-5 shadow-sm">
                <h2 className="text-lg font-semibold text-stone-900">Source Reputation</h2>
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  {entry.signals.sourceReputation}
                </p>
              </section>

              <section className="rounded-[1.5rem] border border-stone-200 bg-white px-5 py-5 shadow-sm">
                <h2 className="text-lg font-semibold text-stone-900">What Makes It Different</h2>
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  {entry.signals.differentiation}
                </p>
              </section>
            </>
          )}
        </div>
      </div>

      <section className="space-y-4">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">Related Entries</h2>
          <p className="text-sm leading-7 text-stone-600 sm:text-base">
            Nearby entries from the same shelf that share a workflow neighborhood.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {relatedEntries.map((relatedEntry) => (
            <MarketplaceCard
              key={relatedEntry.id}
              entry={relatedEntry}
              compact
            />
          ))}
        </div>
      </section>
    </PageContainer>
  )
}

export default SkillMarketplaceDetailPage
