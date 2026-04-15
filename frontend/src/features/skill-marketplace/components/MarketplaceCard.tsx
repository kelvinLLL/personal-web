import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getMarketplaceDetailPath } from '@/features/skill-marketplace/lib/lookup'
import type { MarketplaceEntry } from '@/features/skill-marketplace/model/marketplace'
import {
  artifactTypeLabels,
  compatibilityLabels,
  maturityLabels,
  reuseFrequencyLabels,
  trustLevelLabels,
} from '@/features/skill-marketplace/model/marketplace'

interface MarketplaceCardProps {
  entry: MarketplaceEntry
  compact?: boolean
}

function getSignalSummary(entry: MarketplaceEntry) {
  if (entry.ownerType === 'personal') {
    return `${maturityLabels[entry.signals.maturity]} · ${reuseFrequencyLabels[entry.signals.reuseFrequency]}`
  }

  return `${trustLevelLabels[entry.signals.trustLevel]} · Reviewed ${entry.signals.lastReviewed}`
}

export function MarketplaceCard({ entry, compact = false }: MarketplaceCardProps) {
  return (
    <Link
      to={getMarketplaceDetailPath(entry.ownerType, entry.slug)}
      className={cn(
        'group block rounded-[1.5rem] border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md',
        compact ? 'px-4 py-4' : 'px-5 py-5',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className="border-stone-200 bg-stone-50 text-stone-700"
        >
          {artifactTypeLabels[entry.artifactType]}
        </Badge>
        {entry.compatibility.slice(0, 2).map((compatibility) => (
          <Badge
            key={compatibility}
            variant="outline"
            className="border-sky-200 bg-sky-50 text-sky-800"
          >
            {compatibilityLabels[compatibility]}
          </Badge>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <h3 className="text-lg font-semibold text-stone-900 transition-colors group-hover:text-sky-700">
          {entry.name}
        </h3>
        <p className="text-sm leading-6 text-stone-600">{entry.summary}</p>
        <p className="text-sm leading-6 text-stone-500">{entry.whyItMatters}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
          {getSignalSummary(entry)}
        </p>
        <span className="text-sm font-medium text-sky-700 transition-colors group-hover:text-sky-800">
          View details
        </span>
      </div>
    </Link>
  )
}
