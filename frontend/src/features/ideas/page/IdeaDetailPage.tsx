import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { IdeaForm } from '@/components/ideas/IdeaForm'
import { ScoreRadar } from '@/components/ideas/ScoreRadar'
import * as ideasApi from '@/features/ideas/api/ideasApi'
import { useIdeasStore } from '@/features/ideas/store/useIdeasStore'
import type { ProjectIdea } from '@/features/ideas/model/idea'

const statusActions: Record<string, Array<{ label: string; status: ProjectIdea['status'] }>> = {
  pending: [
    { label: 'Start Building', status: 'in_progress' },
    { label: 'Skip', status: 'skipped' },
  ],
  in_progress: [
    { label: 'Mark Done', status: 'done' },
    { label: 'Back to Pending', status: 'pending' },
  ],
  done: [{ label: 'Reopen', status: 'pending' }],
  skipped: [{ label: 'Reconsider', status: 'pending' }],
}

const categoryColors: Record<string, string> = {
  toy: 'bg-purple-100 text-purple-700',
  tool: 'bg-blue-100 text-blue-700',
  feature: 'bg-green-100 text-green-700',
  learning: 'bg-orange-100 text-orange-700',
}

export default function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const updateIdea = useIdeasStore((s) => s.updateIdea)
  const deleteIdea = useIdeasStore((s) => s.deleteIdea)

  const [idea, setIdea] = useState<ProjectIdea | null>(null)
  const [loadedId, setLoadedId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    let cancelled = false
    void ideasApi
      .fetchIdea(id)
      .then((nextIdea) => {
        if (cancelled) return
        setIdea(nextIdea)
        setError('')
        setLoadedId(id)
      })
      .catch((cause) => {
        if (cancelled) return
        setIdea(null)
        setError(cause.message)
        setLoadedId(id)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const loading = Boolean(id) && loadedId !== id

  async function handleStatusChange(status: ProjectIdea['status']) {
    if (!id || !idea) return
    await updateIdea(id, { status })
    setIdea({ ...idea, status })
  }

  async function handleDelete() {
    if (!id) return
    await deleteIdea(id)
    navigate('/ideas')
  }

  async function handleEdit(data: Omit<ProjectIdea, 'id' | 'meta'>) {
    if (!id || !idea) return
    await updateIdea(id, data)
    setIdea({ ...idea, ...data })
    setEditing(false)
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="py-12 text-center text-stone-400">Loading...</div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <div className="py-12 text-center text-red-600">{error}</div>
      </PageContainer>
    )
  }

  if (!idea) {
    return (
      <PageContainer>
        <div className="py-12 text-center text-stone-400">Idea not found</div>
      </PageContainer>
    )
  }

  if (editing) {
    return (
      <PageContainer>
        <Link to="/ideas" className="mb-4 inline-block text-sm text-stone-500 hover:text-stone-700">
          ← Back to Ideas
        </Link>
        <h1 className="mb-6 text-2xl font-bold text-stone-900">Edit: {idea.title}</h1>
        <IdeaForm onSubmit={handleEdit} onCancel={() => setEditing(false)} initial={idea} />
      </PageContainer>
    )
  }

  const actions = statusActions[idea.status] || []

  return (
    <PageContainer>
      <Link to="/ideas" className="mb-4 inline-block text-sm text-stone-500 hover:text-stone-700">
        ← Back to Ideas
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs ${categoryColors[idea.category]}`}>
                {idea.category}
              </span>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                {idea.status.replace('_', ' ')}
              </span>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">
                Effort: {idea.detail.effort}
              </span>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-stone-900">{idea.title}</h1>
            <p className="text-lg text-stone-500">{idea.tagline}</p>
          </div>

          {idea.detail.why_interesting && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-stone-400">
                Why Interesting
              </h2>
              <p className="text-stone-700">{idea.detail.why_interesting}</p>
            </section>
          )}

          {idea.detail.why_worth_doing && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-stone-400">
                Why Worth Doing
              </h2>
              <p className="text-stone-700">{idea.detail.why_worth_doing}</p>
            </section>
          )}

          {idea.detail.references.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-stone-400">
                References
              </h2>
              <ul className="space-y-2">
                {idea.detail.references.map((ref, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-500">
                      {ref.type}
                    </span>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-sky-600 hover:underline"
                    >
                      {ref.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {idea.detail.tech_hints.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-stone-400">
                Tech Hints
              </h2>
              <div className="flex flex-wrap gap-2">
                {idea.detail.tech_hints.map((hint) => (
                  <span
                    key={hint}
                    className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600"
                  >
                    {hint}
                  </span>
                ))}
              </div>
            </section>
          )}

          <div className="text-xs text-stone-400">
            Discovered: {new Date(idea.meta.discovered_at).toLocaleDateString()} · Source:{' '}
            {idea.meta.source}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-4 text-center">
              <div className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-4xl font-bold text-transparent">
                {idea.scores.overall}
              </div>
              <div className="text-sm text-stone-400">Overall Score</div>
            </div>
            <ScoreRadar scores={idea.scores} size={180} />
          </div>

          <div className="space-y-2 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            {actions.map((action) => (
              <button
                key={action.status}
                onClick={() => void handleStatusChange(action.status)}
                className="w-full rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
              >
                {action.label}
              </button>
            ))}
            <button
              onClick={() => setEditing(true)}
              className="w-full rounded-lg bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-800"
            >
              Edit
            </button>
            <button
              onClick={() => void handleDelete()}
              className="w-full rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
