const LEGACY_READER_ROUTE = '/book-reader-legacy/'
const DEFAULT_DEV_ORIGIN = 'http://127.0.0.1:4322'

function trimTrailingSlashes(value: string) {
  return value.replace(/\/+$/, '')
}

export function getLegacyReaderHref() {
  const configuredOrigin = import.meta.env.VITE_BOOK_READER_URL
  if (typeof configuredOrigin === 'string' && configuredOrigin.length > 0) {
    return `${trimTrailingSlashes(configuredOrigin)}${LEGACY_READER_ROUTE}`
  }

  if (import.meta.env.DEV) {
    return `${DEFAULT_DEV_ORIGIN}${LEGACY_READER_ROUTE}`
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
