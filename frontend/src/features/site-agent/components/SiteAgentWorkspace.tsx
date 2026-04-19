import { Activity } from 'lucide-react'
import { SiteAgentComposer } from '@/features/site-agent/components/SiteAgentComposer'
import { SiteAgentMessageList } from '@/features/site-agent/components/SiteAgentMessageList'
import { SiteAgentRunCard } from '@/features/site-agent/components/SiteAgentRunCard'
import { SiteAgentSuggestionList } from '@/features/site-agent/components/SiteAgentSuggestionList'
import type {
  SiteAgentMessage,
  SiteAgentNavigationSuggestion,
  SiteAgentPendingRequest,
  SiteAgentRequestState,
  SiteAgentWorkflowRunCard,
} from '@/features/site-agent/model/agent'

interface SiteAgentWorkspaceProps {
  activeRunCards: SiteAgentWorkflowRunCard[]
  className?: string
  messages: SiteAgentMessage[]
  onSelectSuggestion: (suggestion: SiteAgentNavigationSuggestion) => void
  onSubmit: (message: string) => Promise<void> | void
  pendingRequest: SiteAgentPendingRequest | null
  requestState: SiteAgentRequestState
  suggestedTransitions: SiteAgentNavigationSuggestion[]
}

export function SiteAgentWorkspace({
  activeRunCards,
  className = '',
  messages,
  onSelectSuggestion,
  onSubmit,
  pendingRequest,
  requestState,
  suggestedTransitions,
}: SiteAgentWorkspaceProps) {
  return (
    <div className={`min-h-0 space-y-4 ${className}`}>
      <SiteAgentMessageList messages={messages} />

      {pendingRequest ? (
        <div className="rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-sm text-stone-600">
          <div className="flex items-center gap-2 font-medium text-stone-900">
            <Activity className="size-4 animate-pulse" />
            Request {pendingRequest.state}
          </div>
          <p className="mt-2 text-sm text-stone-600">{pendingRequest.message}</p>
          {pendingRequest.errorMessage ? (
            <p className="mt-2 text-sm text-rose-600">{pendingRequest.errorMessage}</p>
          ) : null}
        </div>
      ) : null}

      <SiteAgentSuggestionList
        suggestions={suggestedTransitions}
        onSelectSuggestion={onSelectSuggestion}
      />

      {activeRunCards.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
            Workflow runs
          </p>
          <div className="space-y-2">
            {activeRunCards.map((run) => (
              <SiteAgentRunCard key={run.id} run={run} />
            ))}
          </div>
        </div>
      ) : null}

      <SiteAgentComposer
        disabled={requestState === 'streaming'}
        onSubmit={onSubmit}
      />
    </div>
  )
}
