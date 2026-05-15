export const siteRoutes = {
  home: '/',
  ideas: '/ideas',
  dailyNuance: '/daily-nuance',
  skillMarketplace: '/skill-marketplace',
  readingJournal: '/reading-journal',
  sharedReadingJournal: '/reading-journal/shared',
  bookReader: '/book-reader',
  legacyReader: '/book-reader-legacy/',
  strViewer: '/str-viewer/',
  superhaojun: '/superhaojun',
  settings: '/settings',
} as const

export function toChildPath(route: string) {
  return route.replace(/^\/+/, '').replace(/\/+$/, '')
}
