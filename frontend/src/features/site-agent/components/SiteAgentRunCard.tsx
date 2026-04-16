import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { SiteAgentWorkflowRunCard as SiteAgentWorkflowRunCardModel } from '@/features/site-agent/model/agent'

interface SiteAgentRunCardProps {
  run: SiteAgentWorkflowRunCardModel
}

export function SiteAgentRunCard({ run }: SiteAgentRunCardProps) {
  return (
    <Card className="border border-stone-200/80 bg-white/90 shadow-sm" size="sm">
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-medium text-stone-900">{run.title}</p>
            <p className="text-xs text-stone-500">{run.id}</p>
          </div>
          <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-800">
            {run.status}
          </Badge>
        </div>
        <p className="text-sm text-stone-600">{run.summary}</p>
      </CardContent>
    </Card>
  )
}
