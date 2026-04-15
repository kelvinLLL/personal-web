import { Button } from '@/components/ui/button'
import { marketplaceArtifactTypeOptions, marketplaceCategoryOptions, marketplaceCompatibilityOptions } from '@/features/skill-marketplace/data/categories'
import type {
  ArtifactType,
  MarketplaceCategory,
  MarketplaceCompatibility,
} from '@/features/skill-marketplace/model/marketplace'

interface MarketplaceFiltersProps {
  category: MarketplaceCategory | null
  artifactType: ArtifactType | null
  compatibility: MarketplaceCompatibility | null
  onToggleCategory: (value: MarketplaceCategory) => void
  onToggleArtifactType: (value: ArtifactType) => void
  onToggleCompatibility: (value: MarketplaceCompatibility) => void
}

function FilterGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

export function MarketplaceFilters({
  category,
  artifactType,
  compatibility,
  onToggleCategory,
  onToggleArtifactType,
  onToggleCompatibility,
}: MarketplaceFiltersProps) {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-stone-50/80 p-6 shadow-sm">
      <div className="max-w-3xl space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
          Quick Browse
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
          Narrow the directory without turning it into a dashboard.
        </h2>
        <p className="text-sm leading-7 text-stone-600 sm:text-base">
          Use one lightweight filter per lane to compare tools quickly across the two shelves.
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <FilterGroup label="Categories">
          {marketplaceCategoryOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={category === option.value ? 'default' : 'outline'}
              aria-pressed={category === option.value}
              className={
                category === option.value
                  ? 'bg-stone-900 text-white hover:bg-stone-800'
                  : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
              }
              onClick={() => onToggleCategory(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </FilterGroup>

        <FilterGroup label="Artifact Type">
          {marketplaceArtifactTypeOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={artifactType === option.value ? 'default' : 'outline'}
              aria-pressed={artifactType === option.value}
              className={
                artifactType === option.value
                  ? 'bg-stone-900 text-white hover:bg-stone-800'
                  : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
              }
              onClick={() => onToggleArtifactType(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </FilterGroup>

        <FilterGroup label="Compatibility">
          {marketplaceCompatibilityOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={compatibility === option.value ? 'default' : 'outline'}
              aria-pressed={compatibility === option.value}
              className={
                compatibility === option.value
                  ? 'bg-stone-900 text-white hover:bg-stone-800'
                  : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
              }
              onClick={() => onToggleCompatibility(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </FilterGroup>
      </div>
    </section>
  )
}
