import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { getAdminToken } from '@/lib/adminSession'
import { SiteAgentLauncher } from '@/features/site-agent/components/SiteAgentLauncher'
import { SiteAgentPanel } from '@/features/site-agent/components/SiteAgentPanel'
import {
  getSiteAgentPageContext,
  isSiteAgentEnabledRoute,
} from '@/features/site-agent/lib/pageContext'
import { useSiteAgentStore } from '@/features/site-agent/store/useSiteAgentStore'

export function RootLayout() {
  const location = useLocation()
  const syncRouteContext = useSiteAgentStore((state) => state.syncRouteContext)
  const syncAuthToken = useSiteAgentStore((state) => state.syncAuthToken)
  const siteAgentEnabled = isSiteAgentEnabledRoute(location.pathname)

  useEffect(() => {
    syncRouteContext(getSiteAgentPageContext(location.pathname))
    syncAuthToken(getAdminToken())
  }, [location.pathname, syncAuthToken, syncRouteContext])

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      {siteAgentEnabled ? (
        <>
          <SiteAgentLauncher />
          <SiteAgentPanel />
        </>
      ) : null}
    </>
  )
}
