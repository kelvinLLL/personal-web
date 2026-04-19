import { useEffect, useMemo, useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { SiteAgentWorkspace } from '@/features/site-agent/components/SiteAgentWorkspace'
import { useSiteAgentConversation } from '@/features/site-agent/hooks/useSiteAgentConversation'
import { useSiteAgentStore } from '@/features/site-agent/store/useSiteAgentStore'

const PANEL_MARGIN = 16
const PANEL_MAX_WIDTH = 22 * 16
const PANEL_MAX_HEIGHT = 34 * 16
const PANEL_ANCHOR_OFFSET_X = 72
const PANEL_ANCHOR_GAP_Y = 24
const SERVER_VIEWPORT = { width: 1280, height: 800 }

function getViewportSize() {
  if (typeof window === 'undefined') {
    return SERVER_VIEWPORT
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

export function SiteAgentPanel() {
  const navigate = useNavigate()
  const panelState = useSiteAgentStore((state) => state.panelState)
  const closePanel = useSiteAgentStore((state) => state.closePanel)
  const floatingPosition = useSiteAgentStore((state) => state.floatingPosition)
  const [viewportSize, setViewportSize] = useState(getViewportSize)
  const {
    activeRunCards,
    cancelActiveRequest,
    handleSubmit,
    messages,
    pendingRequest,
    requestState,
    routeContext,
    suggestedTransitions,
  } = useSiteAgentConversation()

  useEffect(() => {
    function handleResize() {
      setViewportSize(getViewportSize())
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  useEffect(() => {
    if (panelState !== 'open') {
      cancelActiveRequest()
    }
  }, [cancelActiveRequest, panelState])

  const panelStyle = useMemo(() => {
    if (!floatingPosition) {
      return undefined
    }

    const panelWidth = Math.min(PANEL_MAX_WIDTH, Math.max(0, viewportSize.width - PANEL_MARGIN * 2))
    const panelHeight = Math.min(PANEL_MAX_HEIGHT, Math.max(0, viewportSize.height - PANEL_MARGIN * 2))
    const left = clamp(
      floatingPosition.x - panelWidth + PANEL_ANCHOR_OFFSET_X,
      PANEL_MARGIN,
      Math.max(PANEL_MARGIN, viewportSize.width - panelWidth - PANEL_MARGIN),
    )
    const top = clamp(
      floatingPosition.y - panelHeight - PANEL_ANCHOR_GAP_Y,
      PANEL_MARGIN,
      Math.max(PANEL_MARGIN, viewportSize.height - panelHeight - PANEL_MARGIN),
    )

    return {
      left: `${left}px`,
      top: `${top}px`,
      maxHeight: `${panelHeight}px`,
    }
  }, [floatingPosition, viewportSize.height, viewportSize.width])

  if (panelState !== 'open') {
    return null
  }

  return (
    <Card
      aria-label="Site agent"
      className="fixed z-50 w-[min(22rem,calc(100vw-2rem))] max-h-[min(34rem,calc(100vh-2rem))] border border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,244,245,0.98))] shadow-2xl shadow-stone-900/10 backdrop-blur"
      role="dialog"
      style={panelStyle}
    >
      <CardHeader className="border-b border-stone-200/80 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
              <Sparkles className="size-3.5" />
              Floating site agent
            </div>
            <h2 className="font-heading text-base leading-snug font-medium text-stone-900">
              {routeContext.panelTitle}
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-stone-200 bg-white/80 text-stone-700">
                {routeContext.route}
              </Badge>
              <Badge variant="secondary" className="bg-stone-900 text-white">
                {routeContext.pageLabel}
              </Badge>
            </div>
          </div>
          <Button
            aria-label="Close site agent"
            size="icon-sm"
            type="button"
            variant="ghost"
            onClick={() => {
              cancelActiveRequest()
              closePanel()
            }}
          >
            <X className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-y-auto">
        <SiteAgentWorkspace
          activeRunCards={activeRunCards}
          messages={messages}
          onSelectSuggestion={(suggestion) => {
            navigate(suggestion.route)
          }}
          onSubmit={handleSubmit}
          pendingRequest={pendingRequest}
          requestState={requestState}
          suggestedTransitions={suggestedTransitions}
        />
      </CardContent>
    </Card>
  )
}
