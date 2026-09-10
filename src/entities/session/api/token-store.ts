import {
  ACCESS_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from '@/shared/config/constants'
import { decodeJwtPayload } from '../model/jwt'

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    return
  }
}

function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    return
  }
}

export function getAccessToken(): string | null {
  return readStorage(ACCESS_TOKEN_STORAGE_KEY)
}

export function getRefreshToken(): string | null {
  return readStorage(REFRESH_TOKEN_STORAGE_KEY)
}

function sessionIdFrom(accessToken: string): string | null {
  const sessionId = decodeJwtPayload(accessToken)?.sessionId
  return typeof sessionId === 'string' ? sessionId : null
}

function isFresherOrEqual(incomingAccessToken: string): boolean {
  const current = getAccessToken()
  if (!current) return true
  const incoming = sessionIdFrom(incomingAccessToken)
  const stored = sessionIdFrom(current)
  if (incoming === null || stored === null) return true
  return incoming >= stored
}

export function storeTokensFromResponse(res: Response): void {
  const access = res.headers.get('Authorization')
  const refresh = res.headers.get('X-Refresh-Token')

  if (access) {
    const bare = access.replace(/^Bearer\s+/i, '')
    if (!isFresherOrEqual(bare)) return
    writeStorage(ACCESS_TOKEN_STORAGE_KEY, bare)
    if (refresh) writeStorage(REFRESH_TOKEN_STORAGE_KEY, refresh)
    return
  }

  if (refresh) writeStorage(REFRESH_TOKEN_STORAGE_KEY, refresh)
}

export function clearTokens(): void {
  removeStorage(ACCESS_TOKEN_STORAGE_KEY)
  removeStorage(REFRESH_TOKEN_STORAGE_KEY)
}
