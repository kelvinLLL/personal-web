import { NuanceItemCard } from '@/features/daily-nuance/components/NuanceItemCard'
import type { NuanceBucket, NuanceItem } from '@/features/daily-nuance/model/nuance'

interface NuanceSectionProps {
  title: string
  bucket: NuanceBucket
  items: NuanceItem[]
}

export function NuanceSection({ title, bucket, items }: NuanceSectionProps) {
  return (
    <section className="mb-10" aria-label={title}>
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl font-semibold text-stone-900">{title}</h2>
        <p className="text-sm text-stone-500">{items.length} items</p>
      </div>
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-500">
          No items in this section for the selected snapshot.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <NuanceItemCard key={item.entity_id} item={item} bucket={bucket} />
          ))}
        </div>
      )}
    </section>
  )
}
