import { siteRoutes } from '@/core/site/routes'
import { communityCatalog } from '@/features/skill-marketplace/data/communityCatalog'
import { personalCatalog } from '@/features/skill-marketplace/data/personalCatalog'
import type {
  MarketplaceEntry,
  OwnerType,
} from '@/features/skill-marketplace/model/marketplace'

export function isOwnerType(value: string | undefined): value is OwnerType {
  return value === 'personal' || value === 'community'
}

export function getCatalogByOwner(ownerType: OwnerType) {
  return ownerType === 'personal' ? personalCatalog : communityCatalog
}

export function getAllMarketplaceEntries() {
  return [...personalCatalog, ...communityCatalog]
}

export function getMarketplaceEntry(ownerType: OwnerType, slug: string) {
  return getCatalogByOwner(ownerType).find((entry) => entry.slug === slug) ?? null
}

export function getRelatedEntries(entry: MarketplaceEntry, limit = 2) {
  const sameCatalog = getCatalogByOwner(entry.ownerType).filter((item) => item.id !== entry.id)
  const related = sameCatalog.filter((item) =>
    item.categories.some((category) => entry.categories.includes(category)),
  )

  if (related.length >= limit) {
    return related.slice(0, limit)
  }

  return [...related, ...sameCatalog.filter((item) => !related.includes(item))].slice(0, limit)
}

export function getMarketplaceDetailPath(ownerType: OwnerType, slug: string) {
  return `${siteRoutes.skillMarketplace}/${ownerType}/${slug}`
}
