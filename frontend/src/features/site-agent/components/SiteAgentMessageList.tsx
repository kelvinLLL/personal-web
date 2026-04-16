import type { SiteAgentMessage } from '@/features/site-agent/model/agent'

interface SiteAgentMessageListProps {
  messages: SiteAgentMessage[]
}

export function SiteAgentMessageList({ messages }: SiteAgentMessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/80 px-4 py-5 text-sm text-stone-600">
        Ask the site agent about the current page, or use it to jump to a better surface.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className={
            message.role === 'user'
              ? 'ml-8 rounded-2xl bg-stone-900 px-4 py-3 text-sm text-white'
              : 'mr-4 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 shadow-sm'
          }
        >
          <div className="space-y-2">
            {message.parts.map((part, index) => {
              if (part.type === 'text') {
                return <p key={`${message.id}-${index}`}>{part.text}</p>
              }

              if (part.type === 'navigation_suggestion') {
                return (
                  <p key={`${message.id}-${index}`} className="text-stone-600">
                    Suggested page: <span className="font-medium text-stone-900">{part.suggestion.title}</span>
                  </p>
                )
              }

              if (part.type === 'workflow_run') {
                return (
                  <p key={`${message.id}-${index}`} className="text-stone-600">
                    Workflow run: <span className="font-medium text-stone-900">{part.run.title}</span>
                  </p>
                )
              }

              return (
                <p key={`${message.id}-${index}`} className="text-xs uppercase tracking-[0.14em] text-stone-500">
                  Tool {part.activity.status}: {part.activity.toolName}
                </p>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
