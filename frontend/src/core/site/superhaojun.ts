import { siteRoutes } from '@/core/site/routes'

function trimTrailingSlashes(value: string) {
  return value.replace(/\/+$/, '')
}

export const superHaojunRouteMeta = {
  route: siteRoutes.superhaojun,
  label: 'SuperHaojun',
  summary: 'Jump from the public site into the polished standalone SuperHaojun WebUI.',
} as const

export function getStandaloneSuperHaojunWebUiUrl() {
  const configuredUrl = import.meta.env.VITE_SUPERHAOJUN_WEBUI_URL?.trim()
  if (configuredUrl) {
    return trimTrailingSlashes(configuredUrl)
  }

  return ''
}

export function hasStandaloneSuperHaojunWebUiUrl() {
  return getStandaloneSuperHaojunWebUiUrl().length > 0
}

export function redirectToStandaloneSuperHaojunWebUi() {
  const standaloneWebUiUrl = getStandaloneSuperHaojunWebUiUrl()
  if (!standaloneWebUiUrl || typeof window === 'undefined') {
    return
  }

  window.location.replace(standaloneWebUiUrl)
}
