import { siteRoutes } from '@/core/site/routes'

const DEV_WEBUI_URL = 'http://127.0.0.1:8765'

export const superHaojunRouteMeta = {
  route: siteRoutes.superhaojun,
  label: 'SuperHaojun',
  summary: 'Inspect the integrated runtime surface and continue into the richer harness UI when available.',
} as const

export function getStandaloneSuperHaojunWebUiUrl() {
  const configuredUrl = import.meta.env.VITE_SUPERHAOJUN_WEBUI_URL?.trim()
  if (configuredUrl) {
    return configuredUrl
  }

  if (import.meta.env.DEV) {
    return DEV_WEBUI_URL
  }

  return ''
}

export function hasStandaloneSuperHaojunWebUiUrl() {
  return getStandaloneSuperHaojunWebUiUrl().length > 0
}
