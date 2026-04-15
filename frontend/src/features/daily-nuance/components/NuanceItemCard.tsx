import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { NuanceBucket, NuanceItem } from '@/features/daily-nuance/model/nuance'

interface NuanceItemCardProps {
  item: NuanceItem
  bucket: NuanceBucket
}

function formatScore(value: number): string {
  return value.toFixed(1)
}

export function NuanceItemCard({ item, bucket }: NuanceItemCardProps) {
  const primaryScore = bucket === 'new_fancy' ? item.scores.new_fancy : item.scores.proven_rising
  const scoreLabel = bucket === 'new_fancy' ? 'New & Fancy' : 'Proven & Rising'

  return (
    <Card className="h-full border border-stone-200 bg-white shadow-sm transition-colors hover:border-stone-300">
      <CardHeader className="pb-1">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Badge variant="outline">{item.kind}</Badge>
          <Badge variant="secondary">{scoreLabel}: {formatScore(primaryScore)}</Badge>
        </div>
        <CardTitle className="text-base">
          <a
            href={item.canonical_url}
            target="_blank"
            rel="noreferrer"
            className="hover:text-sky-700"
          >
            {item.title}
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {item.summary ? (
          <p className="text-sm leading-relaxed text-stone-600">{item.summary}</p>
        ) : (
          <p className="text-sm italic text-stone-400">No summary available yet.</p>
        )}
        <div className="flex flex-wrap items-center gap-1.5">
          {item.source_names.map((source) => (
            <Badge key={source} variant="outline">{source}</Badge>
          ))}
          {item.domains.map((domain) => (
            <Badge key={`${item.entity_id}-${domain}`} variant="secondary">{domain}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
