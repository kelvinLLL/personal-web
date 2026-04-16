import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { getSiteAgentPageContext } from '@/features/site-agent/lib/pageContext'
import type {
  SiteAgentMessage,
  SiteAgentNavigationSuggestion,
  SiteAgentPageContext,
  SiteAgentPendingRequest,
  SiteAgentPosition,
  SiteAgentRequestState,
  SiteAgentStreamEvent,
  SiteAgentToolActivity,
  SiteAgentWorkflowRunCard,
} from '@/features/site-agent/model/agent'

interface SiteAgentStoreState {
  panelState: 'closed' | 'open'
  floatingPosition: SiteAgentPosition | null
  routeContext: SiteAgentPageContext
  authToken?: string
  messages: SiteAgentMessage[]
  requestState: SiteAgentRequestState
  pendingRequest: SiteAgentPendingRequest | null
  suggestedTransitions: SiteAgentNavigationSuggestion[]
  activeRunCards: SiteAgentWorkflowRunCard[]
  openPanel: () => void
  closePanel: () => void
  setFloatingPosition: (position: SiteAgentPosition) => void
  ensureFloatingPosition: (viewport?: { width: number; height: number }) => void
  syncRouteContext: (context: SiteAgentPageContext) => void
  syncAuthToken: (token?: string) => void
  startPendingRequest: (message: string) => void
  finishPendingRequest: () => void
  failPendingRequest: (message: string) => void
  appendAssistantText: (text: string) => void
  recordToolActivity: (activity: SiteAgentToolActivity) => void
  addSuggestion: (suggestion: SiteAgentNavigationSuggestion) => void
  upsertRunCard: (run: SiteAgentWorkflowRunCard) => void
  applyStreamEvent: (event: SiteAgentStreamEvent) => void
  resetState: () => void
}

const initialState = {
  panelState: 'closed' as const,
  floatingPosition: null as SiteAgentPosition | null,
  routeContext: getSiteAgentPageContext('/'),
  authToken: undefined as string | undefined,
  messages: [] as SiteAgentMessage[],
  requestState: 'idle' as SiteAgentRequestState,
  pendingRequest: null as SiteAgentPendingRequest | null,
  suggestedTransitions: [] as SiteAgentNavigationSuggestion[],
  activeRunCards: [] as SiteAgentWorkflowRunCard[],
}

let messageCounter = 0

function nextMessageId(prefix: string) {
  messageCounter += 1
  return `${prefix}-${messageCounter}`
}

function buildTextMessage(
  role: SiteAgentMessage['role'],
  text: string,
): SiteAgentMessage {
  return {
    id: nextMessageId(role),
    role,
    createdAt: Date.now(),
    parts: [{ type: 'text', text }],
  }
}

export const useSiteAgentStore = create<SiteAgentStoreState>()(
  devtools((set, get) => ({
    ...initialState,

    openPanel: () => set({ panelState: 'open' }),
    closePanel: () => set({ panelState: 'closed' }),

    setFloatingPosition: (position) => set({ floatingPosition: position }),

    ensureFloatingPosition: (viewport) =>
      set((state) => {
        if (state.floatingPosition) {
          return state
        }

        const width = viewport?.width ?? window.innerWidth
        const height = viewport?.height ?? window.innerHeight
        return {
          floatingPosition: {
            x: Math.max(16, width - 96),
            y: Math.max(96, height - 96),
          },
        }
      }),

    syncRouteContext: (context) => set({ routeContext: context }),
    syncAuthToken: (token) => set({ authToken: token }),

    startPendingRequest: (message) =>
      set((state) => ({
        panelState: 'open',
        requestState: 'streaming',
        pendingRequest: {
          id: nextMessageId('request'),
          message,
          startedAt: Date.now(),
          state: 'streaming',
        },
        suggestedTransitions: [],
        messages: [...state.messages, buildTextMessage('user', message)],
      })),

    finishPendingRequest: () =>
      set({
        requestState: 'idle',
        pendingRequest: null,
      }),

    failPendingRequest: (message) =>
      set((state) => ({
        requestState: 'error',
        pendingRequest: state.pendingRequest
          ? {
              ...state.pendingRequest,
              state: 'error',
              errorMessage: message,
            }
          : null,
        messages: [...state.messages, buildTextMessage('system', message)],
      })),

    appendAssistantText: (text) => {
      if (!text.trim()) {
        return
      }

      set((state) => {
        const messages = [...state.messages]
        const lastMessage = messages.at(-1)

        if (
          lastMessage &&
          lastMessage.role === 'assistant' &&
          lastMessage.parts.length > 0 &&
          lastMessage.parts.at(-1)?.type === 'text'
        ) {
          const lastPart = lastMessage.parts.at(-1)
          if (!lastPart || lastPart.type !== 'text') {
            return state
          }

          messages[messages.length - 1] = {
            ...lastMessage,
            parts: [
              ...lastMessage.parts.slice(0, -1),
              {
                type: 'text',
                text: `${lastPart.text}${text}`,
              },
            ],
          }
          return { messages }
        }

        messages.push({
          id: nextMessageId('assistant'),
          role: 'assistant',
          createdAt: Date.now(),
          parts: [{ type: 'text', text }],
        })
        return { messages }
      })
    },

    recordToolActivity: (activity) =>
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: nextMessageId('system'),
            role: 'system',
            createdAt: Date.now(),
            parts: [{ type: 'tool_activity', activity }],
          },
        ],
      })),

    addSuggestion: (suggestion) =>
      set((state) => {
        if (state.suggestedTransitions.some((item) => item.id === suggestion.id && item.route === suggestion.route)) {
          return state
        }

        return {
          suggestedTransitions: [...state.suggestedTransitions, suggestion],
          messages: [
            ...state.messages,
            {
              id: nextMessageId('assistant'),
              role: 'assistant',
              createdAt: Date.now(),
              parts: [{ type: 'navigation_suggestion', suggestion }],
            },
          ],
        }
      }),

    upsertRunCard: (run) =>
      set((state) => {
        const activeRunCards = state.activeRunCards.some((item) => item.id === run.id)
          ? state.activeRunCards.map((item) => (item.id === run.id ? run : item))
          : [...state.activeRunCards, run]

        return {
          activeRunCards,
          messages: [
            ...state.messages,
            {
              id: nextMessageId('assistant'),
              role: 'assistant',
              createdAt: Date.now(),
              parts: [{ type: 'workflow_run', run }],
            },
          ],
        }
      }),

    applyStreamEvent: (event) => {
      if (event.type === 'text_delta') {
        get().appendAssistantText(event.text)
        return
      }

      if (event.type === 'tool_activity') {
        get().recordToolActivity(event.activity)
        return
      }

      if (event.type === 'navigation_suggestion') {
        get().addSuggestion(event.suggestion)
        return
      }

      if (event.type === 'workflow_run') {
        get().upsertRunCard(event.run)
        return
      }

      if (event.type === 'runtime_error') {
        get().failPendingRequest(event.message)
        return
      }

      if (event.type === 'request_complete') {
        get().finishPendingRequest()
      }
    },

    resetState: () =>
      set({
        ...initialState,
        routeContext: getSiteAgentPageContext('/'),
      }),
  })),
)
