import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { getMarketplaceDetailPath } from '@/features/skill-marketplace/lib/lookup'
import type { MarketplaceEntry } from '@/features/skill-marketplace/model/marketplace'
import {
  artifactTypeLabels,
  maturityLabels,
  reuseFrequencyLabels,
  trustLevelLabels,
} from '@/features/skill-marketplace/model/marketplace'

interface MarketplaceFeaturedRowProps {
  entries: MarketplaceEntry[]
  tone: 'personal' | 'community'
}

function getFeaturedSignal(entry: MarketplaceEntry) {
  if (entry.ownerType === 'personal') {
    return `${maturityLabels[entry.signals.maturity]} · ${reuseFrequencyLabels[entry.signals.reuseFrequency]}`
  }

  return `${trustLevelLabels[entry.signals.trustLevel]} · ${entry.signals.sourceReputation}`
}

export function MarketplaceFeaturedRow({ entries, tone }: MarketplaceFeaturedRowProps) {
  if (entries.length === 0) {
    return null
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {entries.map((entry) => (
        <Link
          key={entry.id}
          to={getMarketplaceDetailPath(entry.ownerType, entry.slug)}
          className={cn(
            'group rounded-[1.75rem] border px-5 py-5 transition hover:-translate-y-0.5 hover:shadow-md',
            tone === 'personal'
              ? 'border-stone-200 bg-stone-950 text-white hover:border-stone-700'
              : 'border-stone-200 bg-stone-100/80 text-stone-900 hover:border-stone-300',
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <Badge
              variant="outline"
              className={cn(
                tone === 'personal'
                  ? 'border-white/15 bg-white/10 text-white'
                  : 'border-stone-300 bg-white text-stone-700',
              )}
            >
              Featured {artifactTypeLabels[entry.artifactType]}
            </Badge>
            <span
              className={cn(
                'text-xs font-semibold uppercase tracking-[0.14em]',
                tone === 'personal' ? 'text-stone-300' : 'text-stone-500',
              )}
            >
              {getFeaturedSignal(entry)}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            <h3 className="text-xl font-semibold">{entry.name}</h3>
            <p className={cn('text-sm leading-6', tone === 'personal' ? 'text-stone-200' : 'text-stone-600')}>
              {entry.summary}
            </p>
            <p className={cn('text-sm leading-6', tone === 'personal' ? 'text-stone-300' : 'text-stone-500')}>
              {entry.whyItMatters}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
