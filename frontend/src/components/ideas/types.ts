import type { IdeaCategory, IdeaStatus } from '@/types/idea'

export interface IdeasState {
  filter: {
    category: IdeaCategory | 'all'
    status: IdeaStatus | 'all'
    sortBy: 'overall' | 'value' | 'fun' | 'newest'
  }
}
