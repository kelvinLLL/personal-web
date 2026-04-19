import { ArrowUpRight, PanelRightOpen, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getStandaloneSuperHaojunWebUiUrl } from '@/core/site/superhaojun'
import { SiteAgentWorkspace } from '@/features/site-agent/components/SiteAgentWorkspace'
import { useSiteAgentConversation } from '@/features/site-agent/hooks/useSiteAgentConversation'
import { useSiteAgentStore } from '@/features/site-agent/store/useSiteAgentStore'

export function SuperHaojunPage() {
  const navigate = useNavigate()
  const openPanel = useSiteAgentStore((state) => state.openPanel)
  const {
    activeRunCards,
    handleSubmit,
    messages,
    pendingRequest,
    requestState,
    routeContext,
    suggestedTransitions,
  } = useSiteAgentConversation()
  const standaloneWebUiUrl = getStandaloneSuperHaojunWebUiUrl()

  return (
    <PageContainer className="space-y-8 md:space-y-10">
      <section className="rounded-3xl border border-stone-200 bg-gradient-to-br from-white via-stone-50 to-sky-50/70 p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              <Sparkles className="size-3.5" />
              Integrated Agent Runtime
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
                SuperHaojun now has a visible larger surface.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-stone-600 md:text-base">
                The floating shell is still the lightweight entry on normal pages. This route is
                the public place to inspect what the integrated agent can currently do, continue a
                richer conversation inline, and jump into the fuller standalone WebUI when you are
                running it.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-stone-200 bg-white/80 text-stone-700">
                {routeContext.route}
              </Badge>
              <Badge variant="secondary" className="bg-stone-900 text-white">
                {routeContext.pageLabel}
              </Badge>
              {routeContext.inlineCapabilityGroups.map((group) => (
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

          <div className="flex flex-col gap-3 sm:min-w-64">
            <Button
              className="justify-center"
              type="button"
              onClick={() => {
                openPanel()
              }}
            >
              <PanelRightOpen className="mr-2 size-4" />
              Open floating shell
            </Button>

            {standaloneWebUiUrl ? (
              <a
                className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-900 transition hover:bg-stone-50"
                href={standaloneWebUiUrl}
                rel="noreferrer"
                target="_blank"
              >
                <ArrowUpRight className="size-4" />
                Open standalone WebUI
              </a>
            ) : (
              <div className="rounded-2xl border border-dashed border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-500">
                Standalone WebUI is not configured for this environment yet.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr,0.9fr]">
        <Card className="border border-stone-200 bg-white shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle>Agent thread</CardTitle>
            <p className="text-sm leading-6 text-stone-500">
              This page keeps the conversation inline instead of hiding it behind the draggable
              shell. Navigation suggestions and workflow cards still work the same way.
            </p>
          </CardHeader>
          <CardContent>
            <SiteAgentWorkspace
              activeRunCards={activeRunCards}
              className="min-h-[24rem]"
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

        <div className="space-y-4">
          <Card className="border border-stone-200 bg-white shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle>Current boundary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-stone-600">
              <p>
                The integrated website agent currently exposes site-owned capabilities such as intro,
                navigation, ideas reads, workflow guidance, and content snapshots.
              </p>
              <p>
                It does not yet expose general-purpose file editing or shell tools on the public web
                surface. That future operator slice is still separately gated.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-stone-200 bg-white shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle>How to use this surface</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-stone-600">
              <p>
                Ask about the current page or about the site in general and keep working inline here.
              </p>
              <p>
                When a task is better handled elsewhere, the agent will still emit explicit route
                recommendations that you can click through.
              </p>
              <p>
                If you are running standalone `superhaojun-web`, use the external button above to
                inspect the richer runtime-native UI.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </PageContainer>
  )
}

export default SuperHaojunPage
