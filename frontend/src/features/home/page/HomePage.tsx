import { HomeHero } from '@/features/home/components/HomeHero'
import { FeatureGrid } from '@/features/home/components/FeatureGrid'
import { RoadmapSection } from '@/features/home/components/RoadmapSection'
import { PageContainer } from '@/components/layout/PageContainer'

export function HomePage() {
  return (
    <PageContainer className="space-y-8 py-6 md:space-y-10 md:py-8">
      <HomeHero />
      <FeatureGrid />
      <RoadmapSection />
    </PageContainer>
  )
}

export default HomePage
