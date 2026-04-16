import { ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { SiteAgentNavigationSuggestion } from '@/features/site-agent/model/agent'

interface SiteAgentSuggestionListProps {
  suggestions: SiteAgentNavigationSuggestion[]
  onSelectSuggestion: (suggestion: SiteAgentNavigationSuggestion) => void
}

export function SiteAgentSuggestionList({
  suggestions,
  onSelectSuggestion,
}: SiteAgentSuggestionListProps) {
  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">Suggested next pages</p>
      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <Card
            key={`${suggestion.id}-${suggestion.route}`}
            className="border border-stone-200/80 bg-stone-50/90 shadow-sm"
            size="sm"
          >
            <CardContent className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="font-medium text-stone-900">{suggestion.title}</p>
                <p className="text-sm text-stone-600">{suggestion.reason}</p>
                <Badge variant="outline" className="border-stone-200 bg-white/80 text-stone-600">
                  {suggestion.route}
                </Badge>
              </div>
              <Button
                aria-label={`Open ${suggestion.title}`}
                className="border-stone-200 bg-white text-stone-700 hover:border-sky-300 hover:bg-white hover:text-sky-700"
                size="sm"
                type="button"
                variant="outline"
                onClick={() => onSelectSuggestion(suggestion)}
              >
                Open {suggestion.title}
                <ArrowUpRight className="size-3" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
