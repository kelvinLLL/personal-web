import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import type { ProjectIdea } from '@/types/idea'

const categoryColors: Record<string, string> = {
  toy: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
  tool: 'border-sky-200 bg-sky-50 text-sky-700',
  feature: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  learning: 'border-amber-200 bg-amber-50 text-amber-700',
}

const statusColors: Record<string, string> = {
  pending: 'border-stone-200 bg-stone-100 text-stone-600',
  in_progress: 'border-sky-200 bg-sky-50 text-sky-700',
  done: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  skipped: 'border-stone-200 bg-stone-100 text-stone-400',
}

const effortColors: Record<string, string> = {
  S: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  M: 'border-amber-200 bg-amber-50 text-amber-700',
  L: 'border-rose-200 bg-rose-50 text-rose-700',
}

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50/80 px-3 py-2">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-stone-900">{value}</dd>
    </div>
  )
}

interface IdeaCardProps {
  idea: ProjectIdea
  onStatusChange?: (id: string, status: ProjectIdea['status']) => void
}

export function IdeaCard({ idea, onStatusChange }: IdeaCardProps) {
  return (
    <Card className="h-full rounded-[1.5rem] border border-stone-200 bg-white py-0 shadow-sm transition-colors duration-200 hover:border-stone-300 hover:bg-stone-50/40">
      <CardContent className="px-5 py-5">
        <Link to={`/ideas/${idea.id}`} className="block space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className={categoryColors[idea.category]}>
                  {idea.category}
                </Badge>
                <Badge variant="outline" className={effortColors[idea.detail.effort]}>
                  {idea.detail.effort}
                </Badge>
                <Badge variant="outline" className={statusColors[idea.status]}>
                  {idea.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold text-stone-900 transition-colors group-hover:text-sky-700">
                  {idea.title}
                </h3>
                <p className="text-sm leading-6 text-stone-500">{idea.tagline}</p>
              </div>
            </div>

            <div className="shrink-0 rounded-2xl bg-stone-900 px-3 py-2 text-right text-white shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-300">
                Overall
              </p>
              <p className="mt-1 text-2xl font-semibold">{idea.scores.overall}</p>
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-stone-200 bg-stone-50/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
              Why it matters
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-600">{idea.detail.why_worth_doing}</p>
          </div>

          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <ScorePill label="Value" value={idea.scores.value} />
            <ScorePill label="Learn" value={idea.scores.learnability} />
            <ScorePill label="Fun" value={idea.scores.fun} />
            <ScorePill label="Feasible" value={idea.scores.feasibility} />
          </dl>
        </Link>
      </CardContent>

      {onStatusChange && idea.status === 'pending' && (
        <CardFooter className="gap-2 border-t border-stone-100 bg-stone-50/80 px-5 py-4" role="group" aria-label="Status actions">
          <button
            type="button"
            onClick={() => onStatusChange(idea.id, 'in_progress')}
            className="text-xs px-3 py-1 rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            Start
          </button>
          <button
            type="button"
            onClick={() => onStatusChange(idea.id, 'skipped')}
            className="text-xs px-3 py-1 rounded-md bg-stone-50 text-stone-500 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500"
          >
            Skip
          </button>
        </CardFooter>
      )}
    </Card>
  )
}
