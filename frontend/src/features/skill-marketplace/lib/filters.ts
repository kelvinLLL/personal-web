import type {
  MarketplaceEntry,
  ArtifactType,
  MarketplaceCategory,
  MarketplaceCompatibility,
} from '@/features/skill-marketplace/model/marketplace'

export interface MarketplaceFilters {
  category: MarketplaceCategory | null
  artifactType: ArtifactType | null
  compatibility: MarketplaceCompatibility | null
}

export const defaultMarketplaceFilters: MarketplaceFilters = {
  category: null,
  artifactType: null,
  compatibility: null,
}

export function filterMarketplaceEntries(
  entries: MarketplaceEntry[],
  filters: MarketplaceFilters,
) {
  return entries.filter((entry) => {
    const matchesCategory = !filters.category || entry.categories.includes(filters.category)
    const matchesArtifactType =
      !filters.artifactType || entry.artifactType === filters.artifactType
    const matchesCompatibility =
      !filters.compatibility || entry.compatibility.includes(filters.compatibility)

    return matchesCategory && matchesArtifactType && matchesCompatibility
  })
}

export function splitMarketplaceEntries(entries: MarketplaceEntry[]) {
  return {
    featuredEntries: entries.filter((entry) => entry.featured),
    gridEntries: entries.filter((entry) => !entry.featured),
  }
}
