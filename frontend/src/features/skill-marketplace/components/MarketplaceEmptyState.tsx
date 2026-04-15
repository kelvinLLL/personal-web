interface MarketplaceEmptyStateProps {
  title: string
  description: string
}

export function MarketplaceEmptyState({ title, description }: MarketplaceEmptyStateProps) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white/70 px-5 py-6">
      <h3 className="text-base font-semibold text-stone-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
    </div>
  )
}
