import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { SESSION_EXPIRED_EVENT } from '@/shared/config/constants'
import { getCurrentUser, logout, tryRestoreSession } from '../api/session-api'
import type { CurrentUser } from './types'

interface SessionValue {
  user: CurrentUser | null
  setUser(user: CurrentUser | null): void
  restoring: boolean
  sessionExpired: boolean
  signOut(): Promise<void>
}

const SessionContext = createContext<SessionValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<CurrentUser | null>(null)
  const [restoring, setRestoring] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)

  const setUser = useCallback((next: CurrentUser | null) => {
    setUserState(next)
    if (next) setSessionExpired(false)
  }, [])

  useEffect(() => {
    let alive = true
    void (async () => {
      const existing = getCurrentUser()
      if (existing) {
        if (alive) setUserState(existing)
      } else {
        const restored = await tryRestoreSession()
        if (alive && restored) setUserState(restored)
      }
      if (alive) setRestoring(false)
    })()

    const onExpired = () => {
      setUserState((current) => {
        if (current) setSessionExpired(true)
        return null
      })
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => {
      alive = false
      window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
    }
  }, [])

  const signOut = useCallback(async () => {
    await logout()
    setUserState(null)
    setSessionExpired(false)
  }, [])

  return (
    <SessionContext.Provider value={{ user, setUser, restoring, sessionExpired, signOut }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>')
  return ctx
}
