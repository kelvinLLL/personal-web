import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageContainer } from '@/components/layout/PageContainer'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { ideasControlBandButtonClassName } from '@/components/ideas/controlBandButtonStyles'
import { IdeaFilter } from '@/components/ideas/IdeaFilter'
import { IdeaForm } from '@/components/ideas/IdeaForm'
import { WorkflowProgress } from '@/components/ideas/WorkflowProgress'
import { useAIConfigStore } from '@/store/aiConfigStore'
import { useIdeasStore } from '@/features/ideas/store/useIdeasStore'
import type { ProjectIdea } from '@/features/ideas/model/idea'

export default function IdeasPage() {
  const ideas = useIdeasStore((s) => s.ideas)
  const meta = useIdeasStore((s) => s.meta)
  const loading = useIdeasStore((s) => s.loading)
  const refreshing = useIdeasStore((s) => s.refreshing)
  const error = useIdeasStore((s) => s.error)
  const filter = useIdeasStore((s) => s.filter)
  const setFilter = useIdeasStore((s) => s.setFilter)
  const fetchIdeas = useIdeasStore((s) => s.fetchIdeas)
  const refreshIdeas = useIdeasStore((s) => s.refreshIdeas)
  const createIdea = useIdeasStore((s) => s.createIdea)
  const updateIdea = useIdeasStore((s) => s.updateIdea)
  const addIdeas = useIdeasStore((s) => s.addIdeas)
  const isAdmin = useAIConfigStore((s) => s.isAdmin())

  const [showForm, setShowForm] = useState(false)
  const [showWorkflow, setShowWorkflow] = useState(false)

  useEffect(() => {
    void fetchIdeas()
  }, [fetchIdeas, filter.category, filter.status])

  async function handleCreate(data: Omit<ProjectIdea, 'id' | 'meta'>) {
    await createIdea(data)
    setShowForm(false)
  }

  function handleStatusChange(id: string, status: ProjectIdea['status']) {
    void updateIdea(id, { status })
  }

  function handleWorkflowComplete(newIdeas: ProjectIdea[]) {
    addIdeas(newIdeas)
    void refreshIdeas()
  }

  const freshnessLabel = meta.updatedAt
    ? new Date(meta.updatedAt).toLocaleString()
    : 'Not synced yet'

  return (
    <PageContainer className="space-y-6 md:space-y-8">
      <section className="rounded-[2rem] border border-stone-200 bg-gradient-to-br from-white via-stone-50 to-stone-100/80 px-6 py-8 shadow-sm md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
          Curated Collection
        </p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              Project Ideas
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
              Projects worth revisiting, ranking, and moving forward.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Last updated: {freshnessLabel}</Badge>
            <Badge variant="secondary">{meta.count} items</Badge>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-stone-200 bg-stone-50/80 p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
              Manage the collection
            </p>
            <p className="text-sm leading-7 text-stone-600">
              Keep filters and workflow close, but visually secondary to the candidates
              themselves.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => void refreshIdeas()}
              disabled={refreshing}
              variant="outline"
              className={ideasControlBandButtonClassName}
            >
              {refreshing ? 'Refreshing...' : 'Refresh List'}
            </Button>
            <Button
              onClick={() => setShowWorkflow((value) => !value)}
              variant="outline"
              className={ideasControlBandButtonClassName}
            >
              {showWorkflow ? 'Hide Daily Update' : 'Run Daily Update'}
            </Button>
            <Button
              onClick={() => setShowForm((value) => !value)}
              variant="outline"
              className={ideasControlBandButtonClassName}
            >
              {showForm ? 'Cancel' : '+ Add Manually'}
            </Button>
          </div>
        </div>
        <div className="mt-5">
          <IdeaFilter filter={filter} onChange={setFilter} />
        </div>
      </section>

      {showWorkflow && (
        <section className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm">
          {isAdmin ? (
            <WorkflowProgress onComplete={handleWorkflowComplete} />
          ) : (
            <div className="space-y-4 rounded-[1.25rem] border border-amber-200 bg-amber-50/80 p-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                  Workflow Access
                </p>
                <h3 className="text-xl font-semibold tracking-tight text-amber-950">
                  Admin access is required to run discovery.
                </h3>
                <p className="text-sm leading-7 text-amber-900/80">
                  The daily update workflow is wired to the backend, but execution still requires an
                  admin session. Open Settings, log in, and come back to run it from here.
                </p>
              </div>
              <Link
                to="/settings"
                className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                Open Settings
              </Link>
            </div>
          )}
        </section>
      )}

      {showForm && (
        <Card className="rounded-[1.75rem] border border-stone-200 bg-white shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle>New Idea</CardTitle>
          </CardHeader>
          <CardContent>
            <IdeaForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-900">
          <AlertTitle>Connection Issue</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
          <p className="text-sm text-stone-400">Loading ideas...</p>
        </div>
      ) : ideas.length === 0 && !error ? (
        <div className="py-16 text-center">
          <div className="mb-3 text-4xl">💡</div>
          <p className="font-medium text-stone-400">No ideas yet.</p>
          <p className="mt-1 text-sm text-stone-400">
            Add manually, refresh the published list, or run discovery for new candidates.
          </p>
        </div>
      ) : (
        <section className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
              Candidate List
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
              Curated project candidates
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  )
}
