import type { IdeasMeta, ProjectIdea } from '@/types/idea'
import { apiRequest, apiStreamRequest } from './apiClient'
import { getAdminToken } from './adminSession'

const IDEAS_SNAPSHOT_PATH = '/data/ideas/latest.json'

interface IdeasSnapshotPayload {
  updated_at: string
  ideas: ProjectIdea[]
}

function isIdea(value: unknown): value is ProjectIdea {
  return typeof value === 'object' && value !== null && 'id' in value && 'title' in value
}

function isIdeasMetaPayload(
  value: unknown,
): value is { updated_at: string; count: number } {
  return (
    typeof value === 'object'
    && value !== null
    && 'updated_at' in value
    && 'count' in value
  )
}

function ensureIdeaResponse(
  value: unknown,
  action: 'create' | 'update',
): ProjectIdea {
  if (!isIdea(value)) {
    throw new Error(`Ideas ${action} requires a live backend API.`)
  }

  return value
}

function filterIdeas(
  ideas: ProjectIdea[],
  params?: {
    status?: string
    category?: string
  },
) {
  return ideas.filter((idea) => {
    if (params?.status && idea.status !== params.status) {
      return false
    }

    if (params?.category && idea.category !== params.category) {
      return false
    }

    return true
  })
}

async function loadIdeasSnapshot(): Promise<IdeasSnapshotPayload> {
  const response = await fetch(IDEAS_SNAPSHOT_PATH)
  if (!response.ok) {
    throw new Error(`Ideas snapshot unavailable (${response.status})`)
  }

  const data = await response.json() as Partial<IdeasSnapshotPayload>
  if (!Array.isArray(data.ideas)) {
    throw new Error('Ideas snapshot is invalid.')
  }

  return {
    updated_at: typeof data.updated_at === 'string' ? data.updated_at : '',
    ideas: data.ideas,
  }
}

export async function fetchIdeas(params?: {
  status?: string
  category?: string
}): Promise<ProjectIdea[]> {
  const query = new URLSearchParams()
  if (params?.status) query.set('status', params.status)
  if (params?.category) query.set('category', params.category)
  const qs = query.toString()

  try {
    const data = await apiRequest<ProjectIdea[] | undefined>(`/api/ideas${qs ? `?${qs}` : ''}`)
    if (Array.isArray(data)) {
      return data
    }
  } catch {
    // Fall through to the shipped static snapshot.
  }

  const snapshot = await loadIdeasSnapshot()
  return filterIdeas(snapshot.ideas, params)
}

export async function fetchIdea(id: string): Promise<ProjectIdea> {
  try {
    const data = await apiRequest<ProjectIdea | undefined>(`/api/ideas/${encodeURIComponent(id)}`)
    if (isIdea(data)) {
      return data
    }
  } catch {
    // Fall through to the shipped static snapshot.
  }

  const snapshot = await loadIdeasSnapshot()
  const idea = snapshot.ideas.find((item) => item.id === id)
  if (!idea) {
    throw new Error(`Idea not found: ${id}`)
  }

  return idea
}

export async function fetchIdeasMeta(): Promise<IdeasMeta> {
  try {
    const data = await apiRequest<{ updated_at: string; count: number } | undefined>('/api/ideas/meta')
    if (isIdeasMetaPayload(data)) {
      return {
        updatedAt: data.updated_at || null,
        count: data.count,
      }
    }
  } catch {
    // Fall through to the shipped static snapshot.
  }

  const snapshot = await loadIdeasSnapshot()
  return {
    updatedAt: snapshot.updated_at || null,
    count: snapshot.ideas.length,
  }
}

export async function createIdea(
  idea: Omit<ProjectIdea, 'id' | 'meta'>,
): Promise<ProjectIdea> {
  const created = await apiRequest<ProjectIdea>('/api/ideas', {
    method: 'POST',
    token: getAdminToken(),
    body: JSON.stringify(idea),
  })

  return ensureIdeaResponse(created, 'create')
}

export async function updateIdea(
  id: string,
  updates: Partial<ProjectIdea>,
): Promise<ProjectIdea> {
  const updated = await apiRequest<ProjectIdea>(`/api/ideas/${encodeURIComponent(id)}`, {
    method: 'PUT',
    token: getAdminToken(),
    body: JSON.stringify(updates),
  })

  return ensureIdeaResponse(updated, 'update')
}

export async function deleteIdea(id: string): Promise<void> {
  await apiRequest(`/api/ideas/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    token: getAdminToken(),
  })
}

export function triggerWorkflow(
  direction: string,
  token: string,
): Promise<Response> {
  return apiStreamRequest('/api/ideas/workflow', {
    method: 'POST',
    token,
    body: JSON.stringify({ direction }),
  })
}
