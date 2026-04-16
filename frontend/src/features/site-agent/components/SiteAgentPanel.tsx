import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, Sparkles, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { streamSiteAgentQuery } from '@/features/site-agent/api/siteAgentApi'
import { SiteAgentComposer } from '@/features/site-agent/components/SiteAgentComposer'
import { SiteAgentMessageList } from '@/features/site-agent/components/SiteAgentMessageList'
import { SiteAgentRunCard } from '@/features/site-agent/components/SiteAgentRunCard'
import { SiteAgentSuggestionList } from '@/features/site-agent/components/SiteAgentSuggestionList'
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

function isAbortError(error: unknown) {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

export function SiteAgentPanel() {
  const panelState = useSiteAgentStore((state) => state.panelState)
  const closePanel = useSiteAgentStore((state) => state.closePanel)
  const floatingPosition = useSiteAgentStore((state) => state.floatingPosition)
  const routeContext = useSiteAgentStore((state) => state.routeContext)
  const authToken = useSiteAgentStore((state) => state.authToken)
  const messages = useSiteAgentStore((state) => state.messages)
  const requestState = useSiteAgentStore((state) => state.requestState)
  const pendingRequest = useSiteAgentStore((state) => state.pendingRequest)
  const suggestedTransitions = useSiteAgentStore((state) => state.suggestedTransitions)
  const activeRunCards = useSiteAgentStore((state) => state.activeRunCards)
  const startPendingRequest = useSiteAgentStore((state) => state.startPendingRequest)
  const finishPendingRequest = useSiteAgentStore((state) => state.finishPendingRequest)
  const failPendingRequest = useSiteAgentStore((state) => state.failPendingRequest)
  const applyStreamEvent = useSiteAgentStore((state) => state.applyStreamEvent)
  const [viewportSize, setViewportSize] = useState(getViewportSize)
  const activeRequestRef = useRef<{
    controller: AbortController
    requestId: number
  } | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    function handleResize() {
      setViewportSize(getViewportSize())
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  function cancelActiveRequest() {
    const activeRequest = activeRequestRef.current
    if (!activeRequest) {
      return
    }

    activeRequest.controller.abort()
    activeRequestRef.current = null
    useSiteAgentStore.getState().finishPendingRequest()
  }

  useEffect(() => {
    if (panelState !== 'open') {
      cancelActiveRequest()
    }
  }, [panelState])

  useEffect(
    () => () => {
      cancelActiveRequest()
    },
    [],
  )

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

  async function handleSubmit(message: string) {
    const existingRequest = activeRequestRef.current
    if (existingRequest) {
      existingRequest.controller.abort()
    }

    requestIdRef.current += 1
    const requestId = requestIdRef.current
    const controller = new AbortController()
    activeRequestRef.current = { controller, requestId }
    startPendingRequest(message)

    function isCurrentRequest() {
      return (
        activeRequestRef.current?.requestId === requestId &&
        activeRequestRef.current?.controller === controller &&
        !controller.signal.aborted
      )
    }

    try {
      await streamSiteAgentQuery(
        {
          message,
          route: routeContext.route,
        },
        {
          token: authToken,
          signal: controller.signal,
          onEvent: (event) => {
            if (!isCurrentRequest()) {
              return
            }

            applyStreamEvent(event)
          },
        },
      )
    } catch (error) {
      if (!isCurrentRequest()) {
        return
      }

      activeRequestRef.current = null

      if (controller.signal.aborted || isAbortError(error)) {
        finishPendingRequest()
        return
      }

      failPendingRequest(
        error instanceof Error ? error.message : 'The site agent request failed.',
      )
      return
    }

    if (!isCurrentRequest()) {
      return
    }

    activeRequestRef.current = null
    useSiteAgentStore.getState().finishPendingRequest()
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

      <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto">
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

        <SiteAgentSuggestionList suggestions={suggestedTransitions} />

        {activeRunCards.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">Workflow runs</p>
            <div className="space-y-2">
              {activeRunCards.map((run) => (
                <SiteAgentRunCard key={run.id} run={run} />
              ))}
            </div>
          </div>
        ) : null}

        <SiteAgentComposer
          disabled={requestState === 'streaming'}
          onSubmit={handleSubmit}
        />
      </CardContent>
    </Card>
  )
}
