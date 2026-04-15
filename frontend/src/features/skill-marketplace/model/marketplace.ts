export type ArtifactType = 'skill' | 'plugin'

export type OwnerType = 'personal' | 'community'

export type MarketplaceCategory =
  | 'workflow'
  | 'documentation'
  | 'research'
  | 'testing'
  | 'frontend'
  | 'design'
  | 'automation'
  | 'agent-building'

export type MarketplaceCompatibility =
  | 'claude-code'
  | 'opencode'
  | 'codex'
  | 'cross-compatible'

export type MarketplaceStatus = 'active' | 'experimental' | 'watching'

export type PersonalMaturity = 'stable' | 'growing' | 'experimental'

export type ReuseFrequency = 'high' | 'medium' | 'low'

export type TrustLevel = 'high' | 'medium' | 'watching'

export interface MarketplaceDetailContent {
  overview: string
  usageContext: string[]
  links: Array<{
    label: string
    url: string
  }>
}

interface MarketplaceEntryBase {
  id: string
  slug: string
  name: string
  artifactType: ArtifactType
  ownerType: OwnerType
  summary: string
  whyItMatters: string
  categories: MarketplaceCategory[]
  compatibility: MarketplaceCompatibility[]
  status: MarketplaceStatus
  sourceName: string
  sourceUrl: string | null
  docsUrl: string | null
  detail: MarketplaceDetailContent
  featured: boolean
}

export interface PersonalMarketplaceEntry extends MarketplaceEntryBase {
  ownerType: 'personal'
  signals: {
    maturity: PersonalMaturity
    reuseFrequency: ReuseFrequency
    lastUpdated: string
    usedIn: string[]
    keyConstraints: string[]
    keyInsights: string[]
    workflowWeakness: string
  }
}

export interface CommunityMarketplaceEntry extends MarketplaceEntryBase {
  ownerType: 'community'
  signals: {
    curationReason: string
    sourceReputation: string
    ecosystemSignal: string
    lastReviewed: string
    trustLevel: TrustLevel
    differentiation: string
  }
}

export type MarketplaceEntry = PersonalMarketplaceEntry | CommunityMarketplaceEntry

export const artifactTypeLabels: Record<ArtifactType, string> = {
  skill: 'Skill',
  plugin: 'Plugin',
}

export const compatibilityLabels: Record<MarketplaceCompatibility, string> = {
  'claude-code': 'Claude Code',
  opencode: 'OpenCode',
  codex: 'Codex',
  'cross-compatible': 'Cross-compatible',
}

export const categoryLabels: Record<MarketplaceCategory, string> = {
  workflow: 'Workflow',
  documentation: 'Documentation',
  research: 'Research',
  testing: 'Testing',
  frontend: 'Frontend',
  design: 'Design',
  automation: 'Automation',
  'agent-building': 'Agent Building',
}

export const statusLabels: Record<MarketplaceStatus, string> = {
  active: 'Active',
  experimental: 'Experimental',
  watching: 'Watching',
}

export const maturityLabels: Record<PersonalMaturity, string> = {
  stable: 'Stable',
  growing: 'Growing',
  experimental: 'Experimental',
}

export const reuseFrequencyLabels: Record<ReuseFrequency, string> = {
  high: 'High reuse',
  medium: 'Medium reuse',
  low: 'Low reuse',
}

export const trustLevelLabels: Record<TrustLevel, string> = {
  high: 'High trust',
  medium: 'Medium trust',
  watching: 'Watching',
}
