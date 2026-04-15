interface NuanceHeroProps {
  subtitle: string
}

export function NuanceHero({ subtitle }: NuanceHeroProps) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-stone-900">Daily Nuance</h1>
      <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
    </header>
  )
}
