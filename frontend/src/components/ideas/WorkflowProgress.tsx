import { useState } from 'react'
import type { ProjectIdea } from '@/types/idea'
import { getAdminToken } from '@/lib/adminSession'
import { triggerWorkflow } from '@/lib/ideasApi'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface WorkflowProgressProps {
  onComplete: (ideas: ProjectIdea[]) => void
}

interface ProgressEvent {
  phase: string
  message: string
}

interface WorkflowStreamEvent {
  type: string
  message: string
  ideas?: ProjectIdea[]
  searched?: number
  shortlisted?: number
  analyzed?: number
  persisted?: number
  failed?: number
  run_id?: string
  model_key?: string
}

interface WorkflowSummary {
  status: 'done' | 'done_with_warnings'
  message: string
  searched: number
  shortlisted: number
  analyzed: number
  persisted: number
  failed: number
  runId?: string
  modelKey?: string
}

export function WorkflowProgress({ onComplete }: WorkflowProgressProps) {
  const [running, setRunning] = useState(false)
  const [direction, setDirection] = useState('')
  const [events, setEvents] = useState<ProgressEvent[]>([])
  const [error, setError] = useState('')
  const [summary, setSummary] = useState<WorkflowSummary | null>(null)

  async function startWorkflow() {
    setRunning(true)
    setEvents([])
    setError('')
    setSummary(null)

    try {
      const token = getAdminToken() || ''
      const response = await triggerWorkflow(direction, token)

      if (!response.ok) throw new Error(`Workflow failed: ${response.status}`)
      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6)) as WorkflowStreamEvent
            if (data.type === 'done' || data.type === 'done_with_warnings') {
              setSummary({
                status: data.type,
                message: data.message,
                searched: data.searched ?? 0,
                shortlisted: data.shortlisted ?? 0,
                analyzed: data.analyzed ?? 0,
                persisted: data.persisted ?? 0,
                failed: data.failed ?? 0,
                runId: data.run_id,
                modelKey: data.model_key,
              })
              onComplete(data.ideas ?? [])
            } else if (data.type === 'failed') {
              setError(data.message)
            } else {
              setEvents((prev) => [...prev, { phase: data.type, message: data.message }])
            }
          }
        }
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <Card className="border border-stone-200 bg-white shadow-sm">
      <CardHeader className="pb-0">
        <CardTitle>Discover New Ideas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {summary && (
          <Alert
            className={
              summary.status === 'done_with_warnings'
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : 'border-emerald-200 bg-emerald-50 text-emerald-900'
            }
          >
            <AlertTitle>
              {summary.status === 'done_with_warnings' ? 'Completed with warnings' : 'Discovery complete'}
            </AlertTitle>
            <AlertDescription className="text-current/80">
              {summary.message}
            </AlertDescription>
          </Alert>
        )}

        {!running ? (
          <div className="flex gap-3">
            <Input
              type="text"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              placeholder="Direction hint (optional): e.g. AI tools, dev efficiency..."
              className="flex-1"
            />
            <Button onClick={startWorkflow} disabled={running} className="shrink-0">
              Discover
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-stone-600">Running workflow...</span>
            </div>
          </div>
        )}

        {(running || events.length > 0) && (
          <div className="max-h-40 overflow-y-auto space-y-1 rounded-lg bg-stone-50 p-3 font-mono text-xs text-stone-500">
            {events.map((e, i) => (
              <div key={i}>
                <span className="text-sky-600">[{e.phase}]</span> {e.message}
              </div>
            ))}
          </div>
        )}

        {summary && (
          <>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Searched {summary.searched}</Badge>
              <Badge variant="outline">Shortlisted {summary.shortlisted}</Badge>
              <Badge variant="outline">Analyzed {summary.analyzed}</Badge>
              <Badge variant="secondary">Persisted {summary.persisted}</Badge>
              <Badge variant={summary.failed > 0 ? 'destructive' : 'outline'}>Failed {summary.failed}</Badge>
            </div>
            {(summary.runId || summary.modelKey) && (
              <p className="text-xs text-stone-500">
                {[summary.runId ? `Run ${summary.runId.slice(0, 8)}` : null, summary.modelKey ? `Model ${summary.modelKey}` : null]
                  .filter(Boolean)
                  .join(' • ')}
              </p>
            )}
          </>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Workflow failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
