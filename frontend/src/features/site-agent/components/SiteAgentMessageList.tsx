import { Badge } from '@/components/ui/badge'
import type { SiteAgentMessage } from '@/features/site-agent/model/agent'
import { SiteAgentRunCard } from '@/features/site-agent/components/SiteAgentRunCard'

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
              : message.role === 'system'
                ? 'mr-8 rounded-2xl border border-dashed border-stone-200 bg-stone-50/80 px-4 py-3 text-sm text-stone-600'
                : 'mr-4 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 shadow-sm'
          }
        >
          <div className="space-y-2">
            {message.parts.map((part, index) => {
              if (part.type === 'text') {
                return <p key={`${message.id}-${index}`}>{part.text}</p>
              }

              if (part.type === 'page_explanation') {
                return (
                  <div
                    key={`${message.id}-${index}`}
                    className="rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3"
                  >
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-sky-700">
                      Current page
                    </p>
                    <p className="mt-1 font-medium text-stone-900">
                      On {part.explanation.pageLabel}
                    </p>
                    <p className="mt-2 text-sm text-stone-700">
                      {part.explanation.summary}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {part.explanation.inlineCapabilityGroups.map((group) => (
                        <Badge
                          key={group}
                          variant="outline"
                          className="border-sky-200 bg-white/80 text-sky-700"
                        >
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )
              }

              if (part.type === 'inline_result') {
                return (
                  <div
                    key={`${message.id}-${index}`}
                    className="rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-stone-900">{part.result.title}</p>
                        <p className="mt-1 text-sm text-stone-600">{part.result.summary}</p>
                      </div>
                      {part.result.snapshotDate ? (
                        <Badge
                          variant="outline"
                          className="border-stone-200 bg-white/80 text-stone-600"
                        >
                          {part.result.snapshotDate}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="mt-3 space-y-2">
                      {part.result.items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-stone-200/80 bg-white px-3 py-3"
                        >
                          <p className="font-medium text-stone-900">{item.title}</p>
                          {item.summary ? (
                            <p className="mt-1 text-sm text-stone-600">{item.summary}</p>
                          ) : null}
                          {item.metadata?.length ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {item.metadata.map((metadata) => (
                                <Badge
                                  key={metadata}
                                  variant="secondary"
                                  className="bg-stone-100 text-stone-700"
                                >
                                  {metadata}
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }

              if (part.type === 'navigation_suggestion') {
                return (
                  <div
                    key={`${message.id}-${index}`}
                    className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3"
                  >
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-amber-700">
                      Transition suggestion
                    </p>
                    <p className="mt-1 font-medium text-stone-900">
                      {part.suggestion.title}
                    </p>
                    <p className="mt-2 text-sm text-stone-700">{part.suggestion.reason}</p>
                  </div>
                )
              }

              if (part.type === 'workflow_run') {
                return <SiteAgentRunCard key={`${message.id}-${index}`} run={part.run} />
              }

              return (
                <div
                  key={`${message.id}-${index}`}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs uppercase tracking-[0.14em] text-stone-500"
                >
                  <span>Tool {part.activity.status}</span>
                  <span className="font-medium text-stone-700">{part.activity.toolName}</span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
