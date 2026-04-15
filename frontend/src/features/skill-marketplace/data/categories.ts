import type {
  ArtifactType,
  MarketplaceCategory,
  MarketplaceCompatibility,
} from '@/features/skill-marketplace/model/marketplace'
import {
  artifactTypeLabels,
  categoryLabels,
  compatibilityLabels,
} from '@/features/skill-marketplace/model/marketplace'

interface MarketplaceFilterOption<T extends string> {
  value: T
  label: string
}

const categoryValues: MarketplaceCategory[] = [
  'workflow',
  'documentation',
  'research',
  'testing',
  'frontend',
  'design',
  'automation',
  'agent-building',
]

export const marketplaceCategoryOptions: MarketplaceFilterOption<MarketplaceCategory>[] = [
  ...categoryValues,
].map((value) => ({
  value,
  label: categoryLabels[value],
}))

const artifactTypeValues: ArtifactType[] = ['skill', 'plugin']

export const marketplaceArtifactTypeOptions: MarketplaceFilterOption<ArtifactType>[] = [
  ...artifactTypeValues,
].map((value) => ({
  value,
  label: artifactTypeLabels[value],
}))

const compatibilityValues: MarketplaceCompatibility[] = [
  'claude-code',
  'opencode',
  'codex',
  'cross-compatible',
]

export const marketplaceCompatibilityOptions: MarketplaceFilterOption<MarketplaceCompatibility>[] = [
  ...compatibilityValues,
].map((value) => ({
  value,
  label: compatibilityLabels[value],
}))
