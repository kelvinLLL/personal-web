import { Badge } from '@/components/ui/badge'

interface NuanceSnapshotMetaProps {
  snapshotDate: string
  itemCount: number
  domainCount: number
}

export function NuanceSnapshotMeta({ snapshotDate, itemCount, domainCount }: NuanceSnapshotMetaProps) {
  const itemLabel = itemCount === 1 ? 'item' : 'items'
  const domainLabel = domainCount === 1 ? 'domain' : 'domains'

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
      <Badge className="border-stone-200 bg-stone-100 text-stone-700">
        Snapshot date: {snapshotDate}
      </Badge>
      <Badge className="bg-stone-900 text-white">
        {itemCount} {itemLabel} in this snapshot
      </Badge>
      <Badge className="border-amber-200 bg-amber-100/80 text-amber-900">
        {domainCount} {domainLabel} tracked
      </Badge>
    </div>
  )
}
