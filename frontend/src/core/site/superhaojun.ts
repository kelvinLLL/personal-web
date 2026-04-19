import { siteRoutes } from '@/core/site/routes'

const DEV_WEBUI_URL = 'http://127.0.0.1:8765'

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

  if (import.meta.env.DEV) {
    return DEV_WEBUI_URL
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
