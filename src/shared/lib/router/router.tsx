import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
  type AnchorHTMLAttributes,
} from 'react'

interface Location {
  path: string
  query: string
}

interface RouterValue extends Location {
  navigate(to: string, options?: { replace?: boolean }): void
}

const RouterContext = createContext<RouterValue>({
  path: '/',
  query: '',
  navigate: () => undefined,
})

function currentPath(): string {
  return typeof window === 'undefined' ? '/' : window.location.pathname
}

function currentQuery(): string {
  return typeof window === 'undefined' ? '' : window.location.search
}

export function Router({ children }: { children: ReactNode }) {
  const [loc, setLoc] = useState<Location>(() => ({ path: currentPath(), query: currentQuery() }))

  useEffect(() => {
    const onPop = () => setLoc({ path: currentPath(), query: currentQuery() })
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
  }, [loc.path, loc.query])

  const navigate = useCallback((to: string, options: { replace?: boolean } = {}) => {
    const url = new URL(to, window.location.origin)
    if (options.replace) window.history.replaceState(null, '', url)
    else window.history.pushState(null, '', url)
    setLoc({ path: url.pathname, query: url.search })
    if (!url.hash) window.scrollTo(0, 0)
  }, [])

  return (
    <RouterContext.Provider value={{ path: loc.path, query: loc.query, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter(): RouterValue {
  return useContext(RouterContext)
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }

export function Link({ to, children, ...rest }: LinkProps) {
  const { navigate } = useRouter()
  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return
    }
    e.preventDefault()
    navigate(to)
  }
  return (
    <a href={to} onClick={onClick} {...rest}>
      {children}
    </a>
  )
}

export function Redirect({ to }: { to: string }) {
  const { navigate } = useRouter()
  useEffect(() => {
    navigate(to, { replace: true })
  }, [navigate, to])
  return null
}
