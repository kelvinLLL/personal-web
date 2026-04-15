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
    id: 'BL-02',
    title: 'Skill Marketplace',
    summary: 'Create a market-style browsing surface for personal skills and high-quality community tools.',
    status: 'in_progress',
  },
  {
    id: 'BL-03',
    title: 'Harness + Web Chatbot',
    summary: 'Integrate the harness workflow surface and expose it through a web-native chat entry.',
    status: 'pending',
  },
]
