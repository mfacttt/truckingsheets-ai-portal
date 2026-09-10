import type { CurrentUser, UserRole } from './types'

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const segment = token.split('.')[1]
    if (!segment) return null
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
    const parsed: unknown = JSON.parse(decodeURIComponent(escape(atob(base64))))
    return parsed !== null && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export function userFromToken(token: string): CurrentUser | null {
  const payload = decodeJwtPayload(token)
  if (!payload) return null
  const userId = payload.userId
  const email = payload.email
  const role = payload.role
  if (typeof userId !== 'string' || typeof email !== 'string' || typeof role !== 'string') {
    return null
  }
  return { userId, email, role: role as UserRole }
}
