import { useEffect } from 'react'
import { ArrowUpRight, PanelRightOpen, Sparkles } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import {
  getStandaloneSuperHaojunWebUiUrl,
  redirectToStandaloneSuperHaojunWebUi,
} from '@/core/site/superhaojun'
import { useSiteAgentStore } from '@/features/site-agent/store/useSiteAgentStore'

export function SuperHaojunPage() {
  const openPanel = useSiteAgentStore((state) => state.openPanel)
  const standaloneWebUiUrl = getStandaloneSuperHaojunWebUiUrl()

  useEffect(() => {
    if (standaloneWebUiUrl) {
      redirectToStandaloneSuperHaojunWebUi()
    }
  }, [standaloneWebUiUrl])

  return (
    <PageContainer>
      <div className="space-y-6 py-10 md:space-y-8 md:py-14">
        <section className="rounded-3xl border border-stone-200 bg-gradient-to-br from-white via-stone-50 to-sky-50/70 p-6 md:p-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            <Sparkles className="size-3.5" />
            Runtime Surface
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
            Opening SuperHaojun WebUI.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-600 md:text-base">
            The public site now hands this route off to the polished standalone WebUI running on
            the runtime host. If automatic navigation is blocked, use the button below to continue
            manually.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
              Canonical runtime
            </span>
            <span className="rounded-full border border-sky-200 bg-sky-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-sky-900">
              Auto-forwarding
            </span>
          </div>
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-semibold text-stone-900">SuperHaojun WebUI</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 md:text-base">
            Use the standalone WebUI for the full runtime-native experience: messages, context,
            tools, skills, approvals, and the rest of the observability surface all live there now.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {standaloneWebUiUrl ? (
              <a
                href={standaloneWebUiUrl}
                data-app-boundary="external"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                <ArrowUpRight className="size-4" />
                Continue to SuperHaojun WebUI
              </a>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  openPanel()
                }}
              >
                <PanelRightOpen className="mr-2 size-4" />
                Open floating shell instead
              </Button>
            )}
            <p className="text-xs text-stone-500 md:text-sm">
              {standaloneWebUiUrl
                ? 'This button jumps to the runtime host you configured for this environment.'
                : 'Standalone WebUI is not configured here yet, so the floating shell remains the fallback.'}
            </p>
          </div>
        </section>
      </div>
    </PageContainer>
  )
}

export default SuperHaojunPage
