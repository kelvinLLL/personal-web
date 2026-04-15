import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { communityCatalog } from '@/features/skill-marketplace/data/communityCatalog'
import { personalCatalog } from '@/features/skill-marketplace/data/personalCatalog'
import { MarketplaceFilters } from '@/features/skill-marketplace/components/MarketplaceFilters'
import { MarketplaceGlossary } from '@/features/skill-marketplace/components/MarketplaceGlossary'
import { MarketplaceHero } from '@/features/skill-marketplace/components/MarketplaceHero'
import { MarketplaceSection } from '@/features/skill-marketplace/components/MarketplaceSection'
import { defaultMarketplaceFilters, filterMarketplaceEntries, splitMarketplaceEntries } from '@/features/skill-marketplace/lib/filters'
import type {
  ArtifactType,
  MarketplaceCategory,
  MarketplaceCompatibility,
} from '@/features/skill-marketplace/model/marketplace'

export function SkillMarketplacePage() {
  const [category, setCategory] = useState<MarketplaceCategory | null>(defaultMarketplaceFilters.category)
  const [artifactType, setArtifactType] = useState<ArtifactType | null>(
    defaultMarketplaceFilters.artifactType,
  )
  const [compatibility, setCompatibility] = useState<MarketplaceCompatibility | null>(
    defaultMarketplaceFilters.compatibility,
  )

  const filters = {
    category,
    artifactType,
    compatibility,
  }

  const filteredPersonalEntries = filterMarketplaceEntries(personalCatalog, filters)
  const filteredCommunityEntries = filterMarketplaceEntries(communityCatalog, filters)
  const personalDisplay = splitMarketplaceEntries(filteredPersonalEntries)
  const communityDisplay = splitMarketplaceEntries(filteredCommunityEntries)

  const artifactTypeCount = new Set(
    [...personalCatalog, ...communityCatalog].map((entry) => entry.artifactType),
  ).size

  return (
    <PageContainer className="space-y-8 md:space-y-10">
      <MarketplaceHero
        personalCount={personalCatalog.length}
        communityCount={communityCatalog.length}
        artifactTypeCount={artifactTypeCount}
      />

      <MarketplaceFilters
        category={category}
        artifactType={artifactType}
        compatibility={compatibility}
        onToggleCategory={(value) => setCategory((current) => (current === value ? null : value))}
        onToggleArtifactType={(value) =>
          setArtifactType((current) => (current === value ? null : value))
        }
        onToggleCompatibility={(value) =>
          setCompatibility((current) => (current === value ? null : value))
        }
      />

      <MarketplaceSection
        id="my-skills"
        eyebrow="Primary Shelf"
        title="My Skills"
        description="The main shelf: tools I have built, reused, and learned from enough to keep close at hand."
        tone="personal"
        featuredEntries={personalDisplay.featuredEntries}
        gridEntries={personalDisplay.gridEntries}
      />

      <MarketplaceSection
        id="curated-community"
        eyebrow="Curated Community"
        title="Curated Community"
        description="A lighter research shelf for external tools worth knowing, with enough context to understand why they made the cut."
        tone="community"
        featuredEntries={communityDisplay.featuredEntries}
        gridEntries={communityDisplay.gridEntries}
      />

      <MarketplaceGlossary />
    </PageContainer>
  )
}

export default SkillMarketplacePage
