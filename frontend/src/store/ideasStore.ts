import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { IdeasMeta, ProjectIdea, IdeaCategory, IdeaStatus } from '@/types/idea'
import * as ideasApi from '@/lib/ideasApi'

interface IdeasState {
  ideas: ProjectIdea[]
  meta: IdeasMeta
  loading: boolean
  refreshing: boolean
  error: string | null
  filter: {
    category: IdeaCategory | 'all'
    status: IdeaStatus | 'all'
    sortBy: 'overall' | 'value' | 'fun' | 'newest'
  }

  setFilter: (filter: Partial<IdeasState['filter']>) => void
  fetchIdeas: () => Promise<void>
  refreshIdeas: () => Promise<void>
  createIdea: (idea: Omit<ProjectIdea, 'id' | 'meta'>) => Promise<ProjectIdea>
  updateIdea: (id: string, updates: Partial<ProjectIdea>) => Promise<void>
  deleteIdea: (id: string) => Promise<void>
  addIdeas: (ideas: ProjectIdea[]) => void
}

function sortIdeas(ideas: ProjectIdea[], sortBy: IdeasState['filter']['sortBy']): ProjectIdea[] {
  return [...ideas].sort((a, b) => {
    switch (sortBy) {
      case 'overall':
        return b.scores.overall - a.scores.overall
      case 'value':
        return b.scores.value - a.scores.value
      case 'fun':
        return b.scores.fun - a.scores.fun
      case 'newest':
        return new Date(b.meta.discovered_at).getTime() - new Date(a.meta.discovered_at).getTime()
    }
  })
}

async function loadIdeas(
  set: (partial: Partial<IdeasState>) => void,
  get: () => IdeasState,
  options: { background?: boolean } = {},
) {
  if (options.background) {
    set({ refreshing: true, error: null })
  } else {
    set({ loading: true, error: null })
  }

  try {
    const { filter } = get()
    const params: Record<string, string> = {}
    if (filter.category !== 'all') params.category = filter.category
    if (filter.status !== 'all') params.status = filter.status

    const [ideas, meta] = await Promise.all([
      ideasApi.fetchIdeas(params),
      ideasApi.fetchIdeasMeta(),
    ])

    set({
      ideas: sortIdeas(ideas, filter.sortBy),
      meta,
      loading: false,
      refreshing: false,
    })
  } catch (e) {
    const msg = (e as Error).message
    const friendly = msg.includes('Failed to fetch') || msg.includes('ERR_CONNECTION_REFUSED')
      ? 'Backend is offline. Start the backend server or check your connection.'
      : msg

    set({
      error: friendly,
      loading: false,
      refreshing: false,
    })
  }
}

export const useIdeasStore = create<IdeasState>()(
  devtools(
    (set, get) => ({
      ideas: [],
      meta: {
        updatedAt: null,
        count: 0,
      },
      loading: false,
      refreshing: false,
      error: null,
      filter: {
        category: 'all',
        status: 'all',
        sortBy: 'overall',
      },

      setFilter: (filter) =>
        set((state) => ({
          filter: { ...state.filter, ...filter },
          ideas: sortIdeas(state.ideas, ({ ...state.filter, ...filter }).sortBy),
        })),

      fetchIdeas: async () => loadIdeas(set, get),

      refreshIdeas: async () => loadIdeas(set, get, { background: true }),

      createIdea: async (idea) => {
        const created = await ideasApi.createIdea(idea)
        set((state) => ({
          ideas: sortIdeas([created, ...state.ideas], state.filter.sortBy),
          meta: {
            updatedAt: new Date().toISOString(),
            count: state.meta.count + 1,
          },
        }))
        return created
      },

      updateIdea: async (id, updates) => {
        const updated = await ideasApi.updateIdea(id, updates)
        set((state) => ({
          ideas: sortIdeas(
            state.ideas.map((i) => (i.id === id ? updated : i)),
            state.filter.sortBy,
          ),
        }))
      },

      deleteIdea: async (id) => {
        await ideasApi.deleteIdea(id)
        set((state) => ({
          ideas: state.ideas.filter((i) => i.id !== id),
          meta: {
            updatedAt: new Date().toISOString(),
            count: Math.max(0, state.meta.count - 1),
          },
        }))
      },

      addIdeas: (newIdeas) =>
        set((state) => ({
          ideas: sortIdeas([...newIdeas, ...state.ideas], state.filter.sortBy),
          meta: {
            updatedAt: new Date().toISOString(),
            count: state.meta.count + newIdeas.length,
          },
        })),
    }),
  ),
)

export function useFilteredIdeas(): ProjectIdea[] {
  return useIdeasStore((s) => s.ideas)
}
