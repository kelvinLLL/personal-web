import { HomeHero } from '@/features/home/components/HomeHero'
import { FeatureGrid } from '@/features/home/components/FeatureGrid'
import { IdeasPreview } from '@/features/home/components/IdeasPreview'
import { NuancePreview } from '@/features/home/components/NuancePreview'
import { RoadmapSection } from '@/features/home/components/RoadmapSection'
import { PageContainer } from '@/components/layout/PageContainer'

export function HomePage() {
  return (
    <PageContainer className="space-y-8 py-6 md:space-y-10 md:py-8">
      <HomeHero />
      <FeatureGrid />
      <RoadmapSection />

      <section className="space-y-5">
        <div className="grid gap-4 border-b border-zinc-200 pb-5 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Live Evidence
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
              Recent material, ready to inspect.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-zinc-600 md:justify-self-end">
            These previews show the site has real material behind the entrypoints without asking
            the homepage to become a full workspace.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <IdeasPreview />
          <NuancePreview />
        </div>
      </section>
    </PageContainer>
  )
}

export default HomePage
