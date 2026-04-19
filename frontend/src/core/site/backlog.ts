export type BacklogStatus = 'pending' | 'in_progress'

export interface HomepageBacklogItem {
  id: string
  title: string
  summary: string
  status: BacklogStatus
}

export const homepageBacklogItems: HomepageBacklogItem[] = [
  {
    id: 'BL-01',
    title: 'Daily Update Actions',
    summary: 'Add an explicit trigger so ideas and nuance can refresh as deliberate daily actions.',
    status: 'pending',
  },
  {
    id: 'BL-03',
    title: 'Harness Operator Slice',
    summary: 'Keep the site agent stable, then expand approvals and controlled operator actions beyond the current read-focused web surface.',
    status: 'in_progress',
  },
  {
    id: 'BL-04',
    title: 'Book Reader Deep Migration',
    summary: 'Decide which deeper reader capabilities should move from the legacy app into the unified site next.',
    status: 'in_progress',
  },
]
