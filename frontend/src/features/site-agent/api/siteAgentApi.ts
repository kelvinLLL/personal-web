import { apiStreamRequest } from '@/lib/apiClient'
import { getSiteAgentPageContext } from '@/features/site-agent/lib/pageContext'
import type {
  SiteAgentInlineResult,
  SiteAgentNavigationSuggestion,
  SiteAgentPageExplanation,
  SiteAgentQueryPayload,
  SiteAgentStreamEvent,
  SiteAgentWorkflowRunCard,
} from '@/features/site-agent/model/agent'

interface StreamSiteAgentOptions {
  token?: string
  signal?: AbortSignal
  onEvent?: (event: SiteAgentStreamEvent) => void
}

export async function streamSiteAgentQuery(
  payload: SiteAgentQueryPayload,
  options: StreamSiteAgentOptions = {},
) {
  const response = await apiStreamRequest('/api/agent/query', {
    method: 'POST',
    body: JSON.stringify({
      message: payload.message,
      route: payload.route,
      visible_entity_id: payload.visibleEntityId,
      visible_entity_slug: payload.visibleEntitySlug,
    }),
    signal: options.signal,
    token: options.token,
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`API error ${response.status}: ${body}`)
  }

  if (!response.body) {
    throw new Error('Site agent stream did not return a readable body.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done })
    buffer = emitBufferedEvents(buffer, options.onEvent)

    if (done) {
      break
    }
  }

  const trailing = emitBufferedEvents(buffer, options.onEvent, { flush: true })
  if (trailing.trim()) {
    emitPayloadBlock(trailing, options.onEvent)
  }

  options.onEvent?.({ type: 'request_complete' })
}

function emitBufferedEvents(
  buffer: string,
  onEvent?: (event: SiteAgentStreamEvent) => void,
  options: { flush?: boolean } = {},
) {
  let remaining = buffer
  const separator = /\r?\n\r?\n/

  while (true) {
    const match = separator.exec(remaining)
    if (!match) {
      return options.flush ? remaining : remaining
    }

    const block = remaining.slice(0, match.index)
    remaining = remaining.slice(match.index + match[0].length)
    emitPayloadBlock(block, onEvent)
  }
}

function emitPayloadBlock(block: string, onEvent?: (event: SiteAgentStreamEvent) => void) {
  const data = block
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.replace(/^data:\s?/, ''))
    .join('\n')
    .trim()

  if (!data) {
    return
  }

  let payload: unknown
  try {
    payload = JSON.parse(data)
  } catch {
    onEvent?.({ type: 'raw', payload: data })
    return
  }

  for (const event of parseServerPayload(payload)) {
    onEvent?.(event)
  }
}

function parseServerPayload(payload: unknown): SiteAgentStreamEvent[] {
  if (!payload || typeof payload !== 'object') {
    return [{ type: 'raw', payload }]
  }

  const record = payload as Record<string, unknown>
  if (record.type === 'runtime_error') {
    return [
      {
        type: 'runtime_error',
        errorType: String(record.error_type ?? 'RuntimeError'),
        message: String(record.message ?? 'The site agent request failed.'),
      },
    ]
  }

  if (record.type !== 'runtime_event' || !record.event || typeof record.event !== 'object') {
    return [{ type: 'raw', payload }]
  }

  const event = record.event as Record<string, unknown>
  if (event.type === 'text_delta') {
    return [{ type: 'text_delta', text: String(event.text ?? '') }]
  }

  if (event.type === 'tool_call_start') {
    return [
      {
        type: 'tool_activity',
        activity: {
          toolCallId: String(event.tool_call_id ?? 'tool-call'),
          toolName: String(event.tool_name ?? 'tool'),
          status: 'running',
          summary: `Running ${String(event.tool_name ?? 'tool')}`,
        },
      },
    ]
  }

  if (event.type === 'tool_call_end') {
    const parsedResult = safeParseJson(event.result)
    const toolName = String(event.tool_name ?? 'tool')
    const toolCallId = String(event.tool_call_id ?? 'tool-call')
    const summary = describeToolResult(toolName, parsedResult)

    return [
      {
        type: 'tool_activity',
        activity: {
          toolCallId,
          toolName,
          status: 'completed',
          summary,
        },
      },
      ...parseCapabilityResult(parsedResult),
    ]
  }

  return [{ type: 'raw', payload }]
}

function parseCapabilityResult(result: unknown): SiteAgentStreamEvent[] {
  if (!result || typeof result !== 'object') {
    return []
  }

  const record = result as Record<string, unknown>
  const events: SiteAgentStreamEvent[] = []

  if (typeof record.message === 'string' && record.message.trim()) {
    events.push({ type: 'text_delta', text: record.message })
  }

  const explanation = resultToPageExplanation(record)
  if (explanation) {
    events.push({ type: 'page_explanation', explanation })
  }

  const inlineResult = resultToInlineResult(record)
  if (inlineResult) {
    events.push({ type: 'inline_result', result: inlineResult })
  }

  const suggestion = resultToSuggestion(record)
  if (suggestion) {
    events.push({ type: 'navigation_suggestion', suggestion })
  }

  const run = resultToRunCard(record)
  if (run) {
    events.push({ type: 'workflow_run', run })
  }

  return events
}

function resultToPageExplanation(record: Record<string, unknown>): SiteAgentPageExplanation | null {
  if (record.capability_id !== 'site.intro') {
    return null
  }

  const routeContext = getSiteAgentPageContext(
    typeof record.route === 'string' ? record.route : '/',
  )

  return {
    route: routeContext.route,
    pageLabel: routeContext.pageLabel,
    summary: routeContext.pageDescription,
    inlineCapabilityGroups: Array.isArray(record.inline_capability_groups)
      ? record.inline_capability_groups.filter((group): group is string => typeof group === 'string')
      : routeContext.inlineCapabilityGroups,
  }
}

function resultToInlineResult(record: Record<string, unknown>): SiteAgentInlineResult | null {
  const capabilityId =
    typeof record.capability_id === 'string' ? record.capability_id : undefined

  if (!capabilityId) {
    return null
  }

  if (capabilityId === 'ideas.list') {
    const ideas = Array.isArray(record.ideas) ? record.ideas : []
    return {
      id: capabilityId,
      kind: 'ideas',
      title: 'Idea matches',
      summary: `${ideas.length} read-only ideas surfaced inline.`,
      items: ideas.slice(0, 4).flatMap((idea, index) => {
        if (!idea || typeof idea !== 'object') {
          return []
        }

        const item = idea as Record<string, unknown>
        const metadata = [
          typeof item.status === 'string' ? item.status : null,
          typeof item.category === 'string' ? item.category : null,
        ].filter((value): value is string => Boolean(value))

        return [
          {
            id: typeof item.id === 'string' ? item.id : `idea-${index}`,
            title: typeof item.title === 'string' ? item.title : 'Idea',
            summary: typeof item.tagline === 'string' ? item.tagline : undefined,
            metadata,
          },
        ]
      }),
    }
  }

  if (capabilityId === 'ideas.get' && record.idea && typeof record.idea === 'object') {
    const idea = record.idea as Record<string, unknown>
    const metadata = [
      typeof idea.status === 'string' ? idea.status : null,
      typeof idea.category === 'string' ? idea.category : null,
    ].filter((value): value is string => Boolean(value))

    return {
      id: capabilityId,
      kind: 'ideas',
      title: 'Idea detail',
      summary: 'Read-only idea detail surfaced inline.',
      items: [
        {
          id: typeof idea.id === 'string' ? idea.id : capabilityId,
          title: typeof idea.title === 'string' ? idea.title : 'Idea',
          summary: typeof idea.tagline === 'string' ? idea.tagline : undefined,
          metadata,
        },
      ],
    }
  }

  if (capabilityId === 'content.skill_marketplace.catalog') {
    const entries = Array.isArray(record.entries) ? record.entries : []
    return {
      id: capabilityId,
      kind: 'content',
      title: 'Marketplace snapshot',
      summary:
        typeof record.count === 'number'
          ? `${record.count} catalog entries are available in this read-only snapshot.`
          : 'Catalog entries are available in this read-only snapshot.',
      snapshotDate:
        typeof record.snapshot_date === 'string' ? record.snapshot_date : undefined,
      items: entries.slice(0, 4).flatMap((entry, index) => {
        if (!entry || typeof entry !== 'object') {
          return []
        }

        const item = entry as Record<string, unknown>
        const metadata = [
          typeof item.artifact_type === 'string' ? item.artifact_type : null,
          typeof item.owner_type === 'string' ? item.owner_type : null,
        ].filter((value): value is string => Boolean(value))

        return [
          {
            id: typeof item.id === 'string' ? item.id : `entry-${index}`,
            title: typeof item.name === 'string' ? item.name : 'Catalog entry',
            summary: typeof item.summary === 'string' ? item.summary : undefined,
            metadata,
          },
        ]
      }),
    }
  }

  if (capabilityId === 'content.daily_nuance.latest' && record.domains && typeof record.domains === 'object') {
    const domainEntries = Object.entries(record.domains as Record<string, unknown>)
    return {
      id: capabilityId,
      kind: 'content',
      title: 'Daily Nuance snapshot',
      summary:
        typeof record.snapshot_date === 'string'
          ? `Snapshot from ${record.snapshot_date} is available inline.`
          : 'A shipped Daily Nuance snapshot is available inline.',
      snapshotDate:
        typeof record.snapshot_date === 'string' ? record.snapshot_date : undefined,
      items: domainEntries.slice(0, 4).flatMap(([domain, value]) => {
        if (!value || typeof value !== 'object') {
          return []
        }

        const domainRecord = value as Record<string, unknown>
        const newFancyCount = Array.isArray(domainRecord.new_fancy)
          ? domainRecord.new_fancy.length
          : 0
        const provenRisingCount = Array.isArray(domainRecord.proven_rising)
          ? domainRecord.proven_rising.length
          : 0

        return [
          {
            id: domain,
            title: domain,
            summary: `${newFancyCount} new fancy, ${provenRisingCount} proven rising`,
            metadata: ['daily-nuance', 'snapshot'],
          },
        ]
      }),
    }
  }

  return null
}

function resultToSuggestion(record: Record<string, unknown>): SiteAgentNavigationSuggestion | null {
  const rawRoute =
    (typeof record.route === 'string' && record.route) ||
    (record.next_action &&
    typeof record.next_action === 'object' &&
    typeof (record.next_action as Record<string, unknown>).route === 'string'
      ? String((record.next_action as Record<string, unknown>).route)
      : '')

  if (!rawRoute) {
    return null
  }

  const routeContext = getSiteAgentPageContext(rawRoute)
  return {
    id: String(record.capability_id ?? routeContext.route),
    route: routeContext.route,
    title:
      (typeof record.title === 'string' && record.title) ||
      (record.next_action &&
      typeof record.next_action === 'object' &&
      typeof (record.next_action as Record<string, unknown>).title === 'string'
        ? String((record.next_action as Record<string, unknown>).title)
        : routeContext.pageLabel),
    reason:
      (typeof record.reason === 'string' && record.reason) ||
      (typeof record.message === 'string' && record.message) ||
      `Continue in ${routeContext.pageLabel}.`,
    sourceCapabilityId:
      typeof record.capability_id === 'string' ? record.capability_id : undefined,
  }
}

function resultToRunCard(record: Record<string, unknown>): SiteAgentWorkflowRunCard | null {
  if (!record.run || typeof record.run !== 'object') {
    return null
  }

  const run = record.run as Record<string, unknown>
  const id =
    (typeof run.id === 'string' && run.id) ||
    (typeof run.run_id === 'string' && run.run_id) ||
    (typeof record.capability_id === 'string' ? `${record.capability_id}-run` : 'workflow-run')

  return {
    id,
    title:
      (typeof run.title === 'string' && run.title) ||
      (typeof run.name === 'string' && run.name) ||
      'Workflow run',
    status: typeof run.status === 'string' ? run.status : 'pending',
    summary:
      (typeof run.summary === 'string' && run.summary) ||
      (typeof record.message === 'string' && record.message) ||
      'Workflow status is available.',
    searched:
      typeof run.searched === 'number'
        ? run.searched
        : typeof record.searched === 'number'
          ? record.searched
          : undefined,
    analyzed:
      typeof run.analyzed === 'number'
        ? run.analyzed
        : typeof record.analyzed === 'number'
          ? record.analyzed
          : undefined,
    persisted:
      typeof run.persisted === 'number'
        ? run.persisted
        : typeof record.persisted === 'number'
          ? record.persisted
          : undefined,
    failed:
      typeof run.failed === 'number'
        ? run.failed
        : typeof record.failed === 'number'
          ? record.failed
          : undefined,
    route: typeof record.route === 'string' ? record.route : undefined,
    sourceCapabilityId:
      typeof record.capability_id === 'string' ? record.capability_id : undefined,
  }
}

function describeToolResult(toolName: string, result: unknown) {
  if (result && typeof result === 'object' && typeof (result as Record<string, unknown>).capability_id === 'string') {
    return String((result as Record<string, unknown>).capability_id)
  }
  return toolName
}

function safeParseJson(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}
