import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { SiteAgentWorkflowRunCard as SiteAgentWorkflowRunCardModel } from '@/features/site-agent/model/agent'

interface SiteAgentRunCardProps {
  run: SiteAgentWorkflowRunCardModel
}

export function SiteAgentRunCard({ run }: SiteAgentRunCardProps) {
  const metrics = [
    { label: 'Searched', value: run.searched },
    { label: 'Analyzed', value: run.analyzed },
    { label: 'Persisted', value: run.persisted },
    { label: 'Failed', value: run.failed },
  ].filter(
    (metric): metric is { label: string; value: number } =>
      typeof metric.value === 'number',
  )

  const statusClassName = getStatusClassName(run.status)

  return (
    <Card className="border border-stone-200/80 bg-white/90 shadow-sm" size="sm">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-medium text-stone-900">{run.title}</p>
            <p className="text-xs text-stone-500">{run.id}</p>
          </div>
          <Badge variant="outline" className={statusClassName}>
            {run.status}
          </Badge>
        </div>
        <p className="text-sm text-stone-600">{run.summary}</p>
        {metrics.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-stone-200 bg-stone-50/80 px-3 py-2"
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-500">
                  {metric.label}
                </p>
                <p className="mt-1 text-base font-semibold text-stone-900">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}
        {run.route ? (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-stone-100 text-stone-700">
              {run.route}
            </Badge>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function getStatusClassName(status: string) {
  const normalized = status.toLowerCase()

  if (normalized === 'completed' || normalized === 'done') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  }

  if (normalized === 'failed' || normalized === 'error') {
    return 'border-rose-200 bg-rose-50 text-rose-800'
  }

  return 'border-sky-200 bg-sky-50 text-sky-800'
}
