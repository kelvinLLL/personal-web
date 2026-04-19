import { siteRoutes } from '@/core/site/routes'
import type { SiteAgentPageContext, SiteAgentPageType } from '@/features/site-agent/model/agent'

const PAGE_META: Record<SiteAgentPageType, { label: string; description: string }> = {
  home: {
    label: 'Home',
    description:
      'Use inline mode here for quick orientation, then follow a visible transition when a deeper surface is the better fit.',
  },
  ideas: {
    label: 'Ideas',
    description:
      'Use inline mode here for read-only idea summaries and workflow status, then jump into Ideas when you need the larger working surface.',
  },
  'daily-nuance': {
    label: 'Daily Nuance',
    description:
      'Use inline mode here for snapshot summaries and quick answers from the shipped daily reading surface.',
  },
  'skill-marketplace': {
    label: 'Skill Marketplace',
    description:
      'Use inline mode here for lightweight marketplace browsing before moving into the full catalog when you want deeper exploration.',
  },
  'book-reader': {
    label: 'Book Reader',
    description:
      'Use inline mode here for page-aware reading help, but keep longer reading tasks inside the dedicated reader surface.',
  },
  superhaojun: {
    label: 'SuperHaojun',
    description:
      'Use this larger surface to inspect the integrated runtime story, continue chatting inline, and jump into the fuller standalone WebUI when it is available.',
  },
  settings: {
    label: 'Settings',
    description: 'Settings stays outside the floating site-agent surface.',
  },
  generic: {
    label: 'This Page',
    description:
      'Use inline mode for quick page-aware guidance, then take an explicit transition when the task needs a larger workspace.',
  },
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
  const pageMeta = PAGE_META[pageType]

  return {
    route,
    pageType,
    pageLabel: pageMeta.label,
    pageDescription: pageMeta.description,
    panelTitle: `Agent for ${pageMeta.label}`,
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
  if (route.startsWith(siteRoutes.superhaojun)) {
    return 'superhaojun'
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
  if (pageType === 'superhaojun') {
    return ['using-personal-web', 'ideas-read', 'ideas-workflow', 'content-read']
  }
  return ['using-personal-web']
}

export function isSiteAgentEnabledRoute(pathname: string) {
  return getSiteAgentPageType(normalizeSiteAgentRoute(pathname)) !== 'settings'
}
