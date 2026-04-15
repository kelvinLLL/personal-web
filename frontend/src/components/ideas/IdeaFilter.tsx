import type { IdeaCategory, IdeaStatus } from '@/types/idea'
import type { IdeasState } from './types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ideasControlBandButtonClassName } from './controlBandButtonStyles'

type SortBy = IdeasState['filter']['sortBy']

interface IdeaFilterProps {
  filter: IdeasState['filter']
  onChange: (filter: Partial<IdeasState['filter']>) => void
}

const categories: Array<{ value: IdeaCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'toy', label: 'Toy' },
  { value: 'tool', label: 'Tool' },
  { value: 'feature', label: 'Feature' },
  { value: 'learning', label: 'Learning' },
]

const statuses: Array<{ value: IdeaStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'skipped', label: 'Skipped' },
]

const sortOptions: Array<{ value: SortBy; label: string }> = [
  { value: 'overall', label: 'Score' },
  { value: 'value', label: 'Value' },
  { value: 'fun', label: 'Fun' },
  { value: 'newest', label: 'Newest' },
]

function FilterGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div role="group" className="flex gap-1">
      {options.map((opt) => (
        <Button
          key={opt.value}
          type="button"
          size="sm"
          variant={value === opt.value ? 'default' : 'outline'}
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-full',
            value !== opt.value && ideasControlBandButtonClassName,
          )}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  )
}

export function IdeaFilter({ filter, onChange }: IdeaFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <fieldset className="border-0 p-0 m-0">
        <legend className="text-xs text-stone-400 mb-1">Category</legend>
        <FilterGroup
          options={categories}
          value={filter.category}
          onChange={(v) => onChange({ category: v })}
        />
      </fieldset>
      <fieldset className="border-0 p-0 m-0">
        <legend className="text-xs text-stone-400 mb-1">Status</legend>
        <FilterGroup
          options={statuses}
          value={filter.status}
          onChange={(v) => onChange({ status: v })}
        />
      </fieldset>
      <fieldset className="border-0 p-0 m-0">
        <legend className="text-xs text-stone-400 mb-1">Sort</legend>
        <FilterGroup
          options={sortOptions}
          value={filter.sortBy}
          onChange={(v) => onChange({ sortBy: v })}
        />
      </fieldset>
    </div>
  )
}
