import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import type { SiteAgentNavigationSuggestion } from '@/features/site-agent/model/agent'

interface SiteAgentSuggestionListProps {
  suggestions: SiteAgentNavigationSuggestion[]
}

export function SiteAgentSuggestionList({ suggestions }: SiteAgentSuggestionListProps) {
  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">Suggested next pages</p>
      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <Card key={`${suggestion.id}-${suggestion.route}`} className="border border-stone-200/80 bg-stone-50/90 shadow-sm" size="sm">
            <CardContent className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="font-medium text-stone-900">{suggestion.title}</p>
                <p className="text-sm text-stone-600">{suggestion.reason}</p>
              </div>
              <Link
                className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-2 py-1 text-xs font-medium text-stone-700 transition hover:border-sky-300 hover:text-sky-700"
                to={suggestion.route}
              >
                Open
                <ArrowUpRight className="size-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
