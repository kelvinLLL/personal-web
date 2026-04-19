import { useCallback, useEffect, useRef } from 'react'
import { streamSiteAgentQuery } from '@/features/site-agent/api/siteAgentApi'
import { useSiteAgentStore } from '@/features/site-agent/store/useSiteAgentStore'

function isAbortError(error: unknown) {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

export function useSiteAgentConversation() {
  const routeContext = useSiteAgentStore((state) => state.routeContext)
  const authToken = useSiteAgentStore((state) => state.authToken)
  const requestState = useSiteAgentStore((state) => state.requestState)
  const pendingRequest = useSiteAgentStore((state) => state.pendingRequest)
  const messages = useSiteAgentStore((state) => state.messages)
  const suggestedTransitions = useSiteAgentStore((state) => state.suggestedTransitions)
  const activeRunCards = useSiteAgentStore((state) => state.activeRunCards)
  const startPendingRequest = useSiteAgentStore((state) => state.startPendingRequest)
  const finishPendingRequest = useSiteAgentStore((state) => state.finishPendingRequest)
  const failPendingRequest = useSiteAgentStore((state) => state.failPendingRequest)
  const applyStreamEvent = useSiteAgentStore((state) => state.applyStreamEvent)
  const activeRequestRef = useRef<{
    controller: AbortController
    requestId: number
  } | null>(null)
  const requestIdRef = useRef(0)

  const cancelActiveRequest = useCallback(() => {
    const activeRequest = activeRequestRef.current
    if (!activeRequest) {
      return
    }

    activeRequest.controller.abort()
    activeRequestRef.current = null
    useSiteAgentStore.getState().finishPendingRequest()
  }, [])

  const handleSubmit = useCallback(
    async (message: string) => {
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
      finishPendingRequest()
    },
    [
      applyStreamEvent,
      authToken,
      failPendingRequest,
      finishPendingRequest,
      routeContext.route,
      startPendingRequest,
    ],
  )

  useEffect(
    () => () => {
      cancelActiveRequest()
    },
    [cancelActiveRequest],
  )

  return {
    activeRunCards,
    cancelActiveRequest,
    handleSubmit,
    messages,
    pendingRequest,
    requestState,
    routeContext,
    suggestedTransitions,
  }
}
