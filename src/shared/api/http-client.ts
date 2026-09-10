import {
  API_PREFIX,
  CLIENT_APP,
  CLIENT_APP_HEADER,
  DEVICE_ID_HEADER,
  GATEWAY_BASE,
  REQUEST_TIMEOUT_MS,
  SESSION_EXPIRED_EVENT,
} from '@/shared/config/constants'
import { getDeviceId } from '@/shared/lib/device-id'
import { ApiError } from './api-error'
import { camelize } from './camelize'
import { getAuthBridge } from './auth-bridge'

const NETWORK_MESSAGES = {
  offline: 'No internet connection. Check your network and try again.',
  timeout: 'The server took too long to answer. Check your connection and try again.',
  unreachable: "Couldn't reach the server. This is usually a connection problem, so try again.",
} as const

type NetworkFailure = keyof typeof NETWORK_MESSAGES

function networkError(cause: unknown): ApiError {
  let kind: NetworkFailure = 'unreachable'
  if (typeof navigator !== 'undefined' && navigator.onLine === false) kind = 'offline'
  else if (cause instanceof DOMException && cause.name === 'TimeoutError') kind = 'timeout'
  return new ApiError(NETWORK_MESSAGES[kind], `Network.${kind}`, 0)
}

const RETRY_DELAY_MS = 600

const RECONNECT_WAIT_MS = 10000

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function waitForConnection(timeoutMs: number): Promise<boolean> {
  if (typeof navigator === 'undefined' || navigator.onLine !== false) return Promise.resolve(true)
  return new Promise((resolve) => {
    const finish = (online: boolean) => {
      window.removeEventListener('online', onOnline)
      clearTimeout(timer)
      resolve(online)
    }
    const onOnline = () => finish(true)
    const timer = setTimeout(() => finish(false), timeoutMs)
    window.addEventListener('online', onOnline)
  })
}

export async function fetchApi(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  headers.set(CLIENT_APP_HEADER, CLIENT_APP)
  headers.set(DEVICE_ID_HEADER, getDeviceId())

  const attempt = () =>
    fetch(`${GATEWAY_BASE}${API_PREFIX}${path}`, {
      ...init,
      headers,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

  try {
    return await attempt()
  } catch (cause) {
    const failure = networkError(cause)
    const isRead = (init.method ?? 'GET').toUpperCase() === 'GET'
    if (!isRead) throw failure

    if (failure.code === 'Network.offline') {
      if (!(await waitForConnection(RECONNECT_WAIT_MS))) throw failure
    } else {
      await sleep(RETRY_DELAY_MS)
    }

    try {
      return await attempt()
    } catch (retryCause) {
      throw networkError(retryCause)
    }
  }
}

export async function throwProblem(res: Response, fallback: string): Promise<never> {
  let message = fallback
  let code: string | null = null

  if (res.status === 429) {
    const retryAfter = Number(res.headers.get('Retry-After'))
    const wait = Number.isFinite(retryAfter) && retryAfter > 0 ? ` Try again in ${retryAfter}s.` : ' Try again shortly.'
    throw new ApiError(`Too many requests.${wait}`, 'RateLimited', res.status)
  }

  try {
    const problem: unknown = await res.json()
    if (problem !== null && typeof problem === 'object') {
      const detail = (problem as Record<string, unknown>).detail
      const title = (problem as Record<string, unknown>).title
      if (typeof detail === 'string' && detail) message = detail
      else if (typeof title === 'string' && title) message = title
      if (typeof title === 'string' && title) code = title
    }
  } catch {
    message = fallback
  }
  throw new ApiError(message, code, res.status)
}

export function jsonBody(body: unknown): Pick<RequestInit, 'headers' | 'body'> {
  return {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

async function fetchWithAuth(path: string, init: RequestInit): Promise<Response> {
  const bridge = getAuthBridge()
  const withToken = (token: string | null): RequestInit => {
    const headers = new Headers(init.headers)
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return { ...init, headers }
  }

  let res = await fetchApi(path, withToken(bridge?.getAccessToken() ?? null))

  if (res.status === 401 && bridge) {
    const refreshed = await bridge.refreshSession()
    if (refreshed) {
      res = await fetchApi(path, withToken(bridge.getAccessToken()))
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
    }
  }

  return res
}

export async function authedJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetchWithAuth(path, init)
  if (!res.ok) await throwProblem(res, `Request failed (${res.status}).`)
  getAuthBridge()?.storeTokensFromResponse(res)
  return camelize(await res.json()) as T
}

export async function authedCommand(path: string, init: RequestInit = {}): Promise<void> {
  const res = await fetchWithAuth(path, init)
  if (!res.ok) await throwProblem(res, `Request failed (${res.status}).`)
  getAuthBridge()?.storeTokensFromResponse(res)
}

export async function publicJson<T>(path: string): Promise<T> {
  const res = await fetchApi(path, { headers: { Accept: 'application/json' } })
  if (!res.ok) await throwProblem(res, `Request failed (${res.status}).`)
  return camelize(await res.json()) as T
}
