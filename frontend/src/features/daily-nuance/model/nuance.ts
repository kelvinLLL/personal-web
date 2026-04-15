export type NuanceBucket = 'new_fancy' | 'proven_rising'

export interface NuanceScores {
  new_fancy: number
  proven_rising: number
  freshness: number
  momentum: number
  authority: number
}

export interface NuanceItem {
  entity_id: string
  slug: string
  title: string
  summary: string
  canonical_url: string
  kind: string
  source_names: string[]
  domains: string[]
  first_seen_on: string
  last_seen_on: string
  scores: NuanceScores
}

export interface NuanceBucketGroup {
  new_fancy: NuanceItem[]
  proven_rising: NuanceItem[]
}

export type NuanceDomains = Record<string, NuanceBucketGroup>

export interface DailyNuanceSnapshot {
  snapshot_date: string
  overview: NuanceBucketGroup
  domains: NuanceDomains
}

export function getSnapshotItemCount(snapshot: DailyNuanceSnapshot): number {
  return snapshot.overview.new_fancy.length + snapshot.overview.proven_rising.length
}

export function getSnapshotDomainCount(snapshot: DailyNuanceSnapshot): number {
  return Object.keys(snapshot.domains).length
}
