import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { siteRoutes } from '@/core/site/routes'
import { useIdeasStore } from '@/features/ideas/store/useIdeasStore'

export function IdeasPreview() {
  const ideas = useIdeasStore((s) => s.ideas)
  const loading = useIdeasStore((s) => s.loading)
  const error = useIdeasStore((s) => s.error)
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
    <Card className="rounded-lg border-zinc-200 shadow-sm" aria-busy={loading && topIdeas.length === 0}>
      <CardHeader className="space-y-3">
        <span className="inline-flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
          <Lightbulb className="size-5" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Ideas Preview
          </p>
          <CardTitle className="text-2xl font-semibold text-zinc-950">
            Build candidates with a reason to exist.
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && topIdeas.length === 0 ? (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-20 rounded-lg border border-zinc-100 bg-zinc-100 motion-safe:animate-pulse"
              />
            ))}
          </div>
        ) : topIdeas.length > 0 ? (
          topIdeas.map((idea, index) => (
            <Link
              key={idea.id}
              to={`${siteRoutes.ideas}/${idea.id}`}
              className="group flex min-h-20 items-center justify-between gap-4 rounded-lg border border-zinc-100 bg-zinc-50/70 px-4 py-3 transition duration-200 hover:border-blue-200 hover:bg-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-200"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                  Candidate {String(index + 1).padStart(2, '0')}
                </p>
                <p className="truncate font-medium text-zinc-950 transition-colors group-hover:text-blue-700">
                  {idea.title}
                </p>
                <p className="truncate text-sm text-zinc-600">{idea.tagline}</p>
              </div>
              <span className="rounded-full bg-zinc-950 px-2.5 py-1 text-xs font-semibold text-white">
                {idea.scores.overall}
              </span>
            </Link>
          ))
        ) : error ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-5 text-sm leading-6 text-amber-900">
            Ideas could not load here. Open the Ideas page to retry from the full surface.
          </p>
        ) : (
          <p className="rounded-lg border border-dashed border-zinc-200 px-4 py-5 text-sm text-zinc-600">
            The collection is still warming up. Open the Ideas page to inspect the full surface.
          </p>
        )}

        <Link
          to={siteRoutes.ideas}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-blue-700 transition hover:text-blue-800 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-200"
        >
          Open Ideas
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  )
}
