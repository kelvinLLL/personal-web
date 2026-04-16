import { siteRoutes } from '@/core/site/routes'
import type { SiteAgentPageContext, SiteAgentPageType } from '@/features/site-agent/model/agent'

const PAGE_LABELS: Record<SiteAgentPageType, string> = {
  home: 'Home',
  ideas: 'Ideas',
  'daily-nuance': 'Daily Nuance',
  'skill-marketplace': 'Skill Marketplace',
  'book-reader': 'Book Reader',
  settings: 'Settings',
  generic: 'This Page',
}

export function normalizeSiteAgentRoute(pathname: string) {
  const trimmed = (pathname || '/').trim()
  if (!trimmed) {
    return '/'
  }
  if (trimmed === '/') {
    return '/'
  }
  return trimmed.startsWith('/') ? trimmed.replace(/\/+$/, '') || '/' : `/${trimmed.replace(/\/+$/, '')}`
}

export function getSiteAgentPageContext(pathname: string): SiteAgentPageContext {
  const route = normalizeSiteAgentRoute(pathname)
  const pageType = getSiteAgentPageType(route)
  const pageLabel = PAGE_LABELS[pageType]

  return {
    route,
    pageType,
    pageLabel,
    panelTitle: `Agent for ${pageLabel}`,
    inlineCapabilityGroups: getInlineCapabilityGroups(pageType),
  }
}

export function getSiteAgentPageType(route: string): SiteAgentPageType {
  if (route === siteRoutes.home) {
    return 'home'
  }
  if (route.startsWith(siteRoutes.ideas)) {
    return 'ideas'
  }
  if (route.startsWith(siteRoutes.dailyNuance)) {
    return 'daily-nuance'
  }
  if (route.startsWith(siteRoutes.skillMarketplace)) {
    return 'skill-marketplace'
  }
  if (route.startsWith(siteRoutes.bookReader) || route.startsWith(siteRoutes.legacyReader.replace(/\/+$/, ''))) {
    return 'book-reader'
  }
  if (route.startsWith(siteRoutes.settings)) {
    return 'settings'
  }
  return 'generic'
}

export function getInlineCapabilityGroups(pageType: SiteAgentPageType) {
  if (pageType === 'ideas') {
    return ['using-personal-web', 'ideas-read', 'ideas-workflow']
  }
  if (pageType === 'daily-nuance' || pageType === 'skill-marketplace') {
    return ['using-personal-web', 'content-read']
  }
  return ['using-personal-web']
}

export function isSiteAgentEnabledRoute(pathname: string) {
  return getSiteAgentPageType(normalizeSiteAgentRoute(pathname)) !== 'settings'
}
