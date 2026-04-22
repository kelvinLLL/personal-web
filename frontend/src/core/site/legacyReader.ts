import { siteRoutes } from '@/core/site/routes'

const LEGACY_READER_ROUTE = siteRoutes.legacyReader

function trimTrailingSlashes(value: string) {
  return value.replace(/\/+$/, '')
}

export function getLegacyReaderHref() {
  if (import.meta.env.DEV) {
    return siteRoutes.legacyReader
  }

  const configuredOrigin = import.meta.env.VITE_BOOK_READER_URL
  if (typeof configuredOrigin === 'string' && configuredOrigin.length > 0) {
    return `${trimTrailingSlashes(configuredOrigin)}${LEGACY_READER_ROUTE}`
  }

  return LEGACY_READER_ROUTE
}

export function isLegacyReaderExternalApp() {
  return true
}

export function redirectToLegacyReader() {
  if (typeof window === 'undefined') {
    return
  }

  window.location.replace(getLegacyReaderHref())
}
