export type SiteAgentPageType =
  | 'home'
  | 'ideas'
  | 'daily-nuance'
  | 'skill-marketplace'
  | 'book-reader'
  | 'superhaojun'
  | 'settings'
  | 'generic'

export interface SiteAgentPageContext {
  route: string
  pageType: SiteAgentPageType
  pageLabel: string
  pageDescription: string
  panelTitle: string
  inlineCapabilityGroups: string[]
}

export interface SiteAgentPosition {
  x: number
  y: number
}

export type SiteAgentPanelState = 'closed' | 'open'
export type SiteAgentRequestState = 'idle' | 'streaming' | 'error'

export interface SiteAgentNavigationSuggestion {
  id: string
  route: string
  title: string
  reason: string
  sourceCapabilityId?: string
}

export interface SiteAgentWorkflowRunCard {
  id: string
  title: string
  status: string
  summary: string
  searched?: number
  analyzed?: number
  persisted?: number
  failed?: number
  route?: string
  sourceCapabilityId?: string
}

export interface SiteAgentToolActivity {
  toolCallId: string
  toolName: string
  status: 'running' | 'completed'
  summary?: string
}

export interface SiteAgentTextPart {
  type: 'text'
  text: string
}

export interface SiteAgentPageExplanation {
  route: string
  pageLabel: string
  summary: string
  inlineCapabilityGroups: string[]
}

export interface SiteAgentInlineResultItem {
  id: string
  title: string
  summary?: string
  metadata?: string[]
}

export interface SiteAgentInlineResult {
  id: string
  kind: 'ideas' | 'content'
  title: string
  summary: string
  snapshotDate?: string
  items: SiteAgentInlineResultItem[]
}

export interface SiteAgentPageExplanationPart {
  type: 'page_explanation'
  explanation: SiteAgentPageExplanation
}

export interface SiteAgentInlineResultPart {
  type: 'inline_result'
  result: SiteAgentInlineResult
}

export interface SiteAgentNavigationSuggestionPart {
  type: 'navigation_suggestion'
  suggestion: SiteAgentNavigationSuggestion
}

export interface SiteAgentWorkflowRunPart {
  type: 'workflow_run'
  run: SiteAgentWorkflowRunCard
}

export interface SiteAgentToolActivityPart {
  type: 'tool_activity'
  activity: SiteAgentToolActivity
}

export type SiteAgentMessagePart =
  | SiteAgentTextPart
  | SiteAgentPageExplanationPart
  | SiteAgentInlineResultPart
  | SiteAgentNavigationSuggestionPart
  | SiteAgentWorkflowRunPart
  | SiteAgentToolActivityPart

export interface SiteAgentMessage {
  id: string
  role: 'assistant' | 'user' | 'system'
  parts: SiteAgentMessagePart[]
  createdAt: number
}

export interface SiteAgentPendingRequest {
  id: string
  message: string
  startedAt: number
  state: SiteAgentRequestState
  errorMessage?: string
}

export interface SiteAgentQueryPayload {
  message: string
  route: string
  visibleEntityId?: string
  visibleEntitySlug?: string
}

export type SiteAgentStreamEvent =
  | { type: 'text_delta'; text: string }
  | { type: 'page_explanation'; explanation: SiteAgentPageExplanation }
  | { type: 'inline_result'; result: SiteAgentInlineResult }
  | { type: 'tool_activity'; activity: SiteAgentToolActivity }
  | { type: 'navigation_suggestion'; suggestion: SiteAgentNavigationSuggestion }
  | { type: 'workflow_run'; run: SiteAgentWorkflowRunCard }
  | { type: 'runtime_error'; errorType: string; message: string }
  | { type: 'request_complete' }
  | { type: 'raw'; payload: unknown }
