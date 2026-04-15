import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { siteRoutes } from '@/core/site/routes'
import { useIdeasStore } from '@/features/ideas/store/useIdeasStore'

export function IdeasPreview() {
  const ideas = useIdeasStore((s) => s.ideas)
  const fetchIdeas = useIdeasStore((s) => s.fetchIdeas)

  useEffect(() => {
    if (ideas.length === 0) {
      void fetchIdeas()
    }
  }, [fetchIdeas, ideas.length])

  const topIdeas = ideas
    .filter((idea) => idea.status === 'pending')
    .sort((a, b) => b.scores.overall - a.scores.overall)
    .slice(0, 3)

  return (
    <Card className="rounded-[1.75rem] border-stone-200 shadow-sm">
      <CardHeader className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
          Editorial Preview
        </p>
        <CardTitle className="text-2xl font-semibold tracking-tight text-stone-900">
          Ideas worth revisiting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topIdeas.length > 0 ? (
          topIdeas.map((idea, index) => (
            <Link
              key={idea.id}
              to={`${siteRoutes.ideas}/${idea.id}`}
              className="flex items-center justify-between rounded-2xl border border-stone-100 bg-stone-50/70 px-4 py-3 transition hover:border-stone-200 hover:bg-white"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
                  Candidate {String(index + 1).padStart(2, '0')}
                </p>
                <p className="truncate font-medium text-stone-900">{idea.title}</p>
                <p className="truncate text-sm text-stone-500">{idea.tagline}</p>
              </div>
              <span className="rounded-full bg-stone-900 px-2.5 py-1 text-xs font-semibold text-white">
                {idea.scores.overall}
              </span>
            </Link>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-stone-200 px-4 py-5 text-sm text-stone-500">
            The collection is still warming up. Open the Ideas page to inspect the full surface.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
