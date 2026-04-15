import { HomeHero } from '@/features/home/components/HomeHero'
import { FeatureGrid } from '@/features/home/components/FeatureGrid'
import { IdeasPreview } from '@/features/home/components/IdeasPreview'
import { NuancePreview } from '@/features/home/components/NuancePreview'
import { RoadmapSection } from '@/features/home/components/RoadmapSection'
import { PageContainer } from '@/components/layout/PageContainer'

export function HomePage() {
  return (
    <PageContainer className="space-y-10 py-8 md:space-y-12 md:py-10">
      <HomeHero />
      <FeatureGrid />
      <RoadmapSection />

      <section className="space-y-4">
        <div className="max-w-3xl space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
            Editorial Previews
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
            What already feels alive.
          </h2>
          <p className="text-sm leading-7 text-stone-600 sm:text-base">
            Use the previews to judge what deserves attention next. Navigation lives above; proof
            of value lives here.
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
