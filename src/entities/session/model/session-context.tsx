import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { DEMO_SESSION_STORAGE_KEY } from '@/shared/config/constants'

export interface DemoUser {
  email: string
  company: string
}

interface SessionValue {
  user: DemoUser | null
  signIn(user: DemoUser): void
  signOut(): void
}

const SessionContext = createContext<SessionValue>({
  user: null,
  signIn: () => undefined,
  signOut: () => undefined,
})

function readStoredUser(): DemoUser | null {
  try {
    const raw = localStorage.getItem(DEMO_SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<DemoUser>
    if (typeof parsed.email !== 'string') return null
    return { email: parsed.email, company: typeof parsed.company === 'string' ? parsed.company : '' }
  } catch {
    return null
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(() => readStoredUser())

  const signIn = useCallback((next: DemoUser) => {
    setUser(next)
    try {
      localStorage.setItem(DEMO_SESSION_STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* private browsing / storage disabled — session stays in-memory only */
    }
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
    try {
      localStorage.removeItem(DEMO_SESSION_STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  return (
    <SessionContext.Provider value={{ user, signIn, signOut }}>{children}</SessionContext.Provider>
  )
}

export function useSession(): SessionValue {
  return useContext(SessionContext)
}
