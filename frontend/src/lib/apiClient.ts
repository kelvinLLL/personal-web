export function sanitizeBackendUrl(
  configuredUrl: string | undefined,
  isDev: boolean,
) {
  const trimmedUrl = configuredUrl?.trim() || ''
  if (!trimmedUrl) {
    return ''
  }

  if (isDev) {
    return trimmedUrl
  }

  try {
    const parsed = new URL(trimmedUrl)
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return ''
    }
  } catch {
    return trimmedUrl
  }

  return trimmedUrl
}

const BACKEND_URL = sanitizeBackendUrl(import.meta.env.VITE_BACKEND_URL, import.meta.env.DEV)

interface RequestOptions extends RequestInit {
  token?: string
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, headers: customHeaders, ...fetchOptions } = options

  const headers: Record<string, string> = {
    ...customHeaders as Record<string, string>,
  }

  if (fetchOptions.body !== undefined && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`API error ${response.status}: ${body}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const contentLength = response.headers.get('Content-Length')
  if (contentLength === '0') {
    return undefined as T
  }

  const contentType = response.headers.get('Content-Type') || ''
  if (!contentType.includes('application/json')) {
    return undefined as T
  }

  return response.json()
}

export function apiStreamRequest(
  path: string,
  options: RequestOptions = {},
): Promise<Response> {
  const { token, headers: customHeaders, ...fetchOptions } = options

  const headers: Record<string, string> = {
    ...customHeaders as Record<string, string>,
  }

  if (fetchOptions.body !== undefined && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(`${BACKEND_URL}${path}`, {
    ...fetchOptions,
    headers,
  })
}
