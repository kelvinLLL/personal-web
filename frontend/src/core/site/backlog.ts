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
    title: 'Reading Journal Capture',
    summary: 'Keep recent Japanese literature entries synced privately, with reflections and quotes ready for owner notes.',
    status: 'in_progress',
  },
  {
    id: 'BL-03',
    title: 'Harness Operator Slice',
    summary: 'Keep the site agent stable, then expand approvals and controlled operator actions beyond the current read-focused web surface.',
    status: 'in_progress',
  },
  {
    id: 'BL-04',
    title: 'Book Resource Shelf',
    summary: 'Track legal Chinese and Japanese source links for books that should be uploaded after purchase or library access.',
    status: 'in_progress',
  },
]
