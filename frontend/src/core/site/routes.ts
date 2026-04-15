export const siteRoutes = {
  home: '/',
  ideas: '/ideas',
  dailyNuance: '/daily-nuance',
  skillMarketplace: '/skill-marketplace',
  bookReader: '/book-reader',
  legacyReader: '/book-reader-legacy/',
  settings: '/settings',
} as const

export function toChildPath(route: string) {
  return route.replace(/^\/+/, '').replace(/\/+$/, '')
}
