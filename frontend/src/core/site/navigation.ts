import { siteRoutes } from '@/core/site/routes'
import { superHaojunRouteMeta } from '@/core/site/superhaojun'

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
    label: 'Skill Marketplace',
    to: siteRoutes.skillMarketplace,
    summary: 'Browse personal skills and curated community tools.',
  },
  {
    label: 'Reading Journal',
    to: siteRoutes.readingJournal,
    summary: 'Private book notes with invitation-only comments.',
  },
  {
    label: 'Book Reader',
    to: siteRoutes.bookReader,
    summary: 'Open the canonical legacy reading experience.',
  },
  {
    label: 'String Viewer',
    href: siteRoutes.strViewer,
    appBoundary: 'external',
    summary: 'Decode escaped strings and inspect readable prompt text.',
  },
  {
    label: superHaojunRouteMeta.label,
    to: superHaojunRouteMeta.route,
    summary: superHaojunRouteMeta.summary,
  },
]

export const homepageFeatureCards: SiteNavigationItem[] = primaryNavigation.slice(1)
