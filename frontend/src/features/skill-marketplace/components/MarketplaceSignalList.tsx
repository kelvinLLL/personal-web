interface MarketplaceSignalListProps {
  title: string
  items: string[]
}

export function MarketplaceSignalList({ title, items }: MarketplaceSignalListProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <section className="rounded-[1.5rem] border border-stone-200 bg-white px-5 py-5 shadow-sm">
      <h3 className="text-base font-semibold text-stone-900">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-600">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-2xl border border-stone-100 bg-stone-50/80 px-3 py-2"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}
