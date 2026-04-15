import { siteRoutes } from '@/core/site/routes'

export interface SiteNavigationItem {
  label: string
  summary: string
  to?: string
  href?: string
  appBoundary?: 'external'
}

export const primaryNavigation: SiteNavigationItem[] = [
  {
    label: 'Home',
    to: siteRoutes.home,
    summary: 'Unified entrypoint for the site.',
  },
  {
    label: 'Ideas',
    to: siteRoutes.ideas,
    summary: 'Build-worthy projects and operator workflows.',
  },
  {
    label: 'Daily Nuance',
    to: siteRoutes.dailyNuance,
    summary: 'Interesting signals, ranked by novelty and momentum.',
  },
  {
    label: 'Skill Marketplace',
    to: siteRoutes.skillMarketplace,
    summary: 'Browse personal skills and curated community tools.',
  },
  {
    label: 'Book Reader',
    to: siteRoutes.bookReader,
    summary: 'Open the canonical legacy reading experience.',
  },
]

export const homepageFeatureCards: SiteNavigationItem[] = primaryNavigation.slice(1)
