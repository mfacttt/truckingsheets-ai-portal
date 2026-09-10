import { useEffect, useState, type ReactNode } from 'react'
import { Link, useRouter } from '@/shared/lib/router/router'
import {
  CardIcon,
  ChartIcon,
  CloseIcon,
  LayersIcon,
  LogoMark,
  MenuIcon,
  SparkleIcon,
  UsersIcon,
} from '@/shared/ui/icons'
import { ThemeToggle } from '@/features/theme-toggle/ui/ThemeToggle'
import { useSession } from '@/entities/session/model/session-context'
import './dash-rail.css'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
  soon?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Fleet Analytics', icon: <ChartIcon /> },
  { to: '/dashboard/ai', label: 'AI Analytics', icon: <SparkleIcon />, soon: true },
]

const ACCOUNT_ITEMS: NavItem[] = [
  { to: '/dashboard/team', label: 'Team', icon: <UsersIcon /> },
  { to: '/dashboard/plans', label: 'Plans', icon: <LayersIcon /> },
  { to: '/dashboard/billing', label: 'Billing', icon: <CardIcon /> },
]

function isActive(path: string, to: string): boolean {
  if (to === '/dashboard') return path === '/dashboard'
  return path === to || path.startsWith(`${to}/`)
}

function initials(email: string): string {
  return (email[0] ?? '?').toUpperCase() + (email[1] ?? '').toUpperCase()
}

export function DashRail({ contentKey, children }: { contentKey: string; children: ReactNode }) {
  const { path } = useRouter()
  const { user, signOut } = useSession()
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    setNavOpen(false)
  }, [contentKey])

  return (
    <div className={`rdash${navOpen ? ' is-nav-open' : ''}`}>
      <aside className="rdash-rail">
        <div className="rdash-rail-top">
          <Link className="rdash-brand" to="/dashboard" aria-label="Trucking Sheets AI dashboard" onClick={() => setNavOpen(false)}>
            <LogoMark size={28} />
            <span className="rdash-brand-txt">Trucking Sheets AI</span>
          </Link>
          <button
            className="rdash-rail-close"
            type="button"
            aria-label="Close menu"
            onClick={() => setNavOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="rdash-nav" aria-label="Dashboard">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rdash-nav-item${isActive(path, item.to) ? ' is-active' : ''}`}
            >
              {item.icon}
              {item.label}
              {item.soon && <span className="rdash-nav-soon">Soon</span>}
            </Link>
          ))}

          <div className="rdash-nav-gap" />
          <div className="rdash-nav-label">Account</div>
          {ACCOUNT_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rdash-nav-item${isActive(path, item.to) ? ' is-active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="rdash-body">
        <header className="rdash-bar">
          <button
            className="rdash-burger"
            type="button"
            aria-label="Open menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen(true)}
          >
            <MenuIcon />
          </button>
          <span className="rdash-bar-spacer" />
          <ThemeToggle />
          {user && (
            <>
              <span className="rdash-avatar" title={user.email}>
                {initials(user.email)}
              </span>
              <span className="rdash-email">{user.email}</span>
              <button className="btn btn-quiet btn-sm" type="button" onClick={() => void signOut()}>
                Sign out
              </button>
            </>
          )}
        </header>
        <main className="rdash-main" key={contentKey}>
          {children}
        </main>
      </div>

      {navOpen && <div className="rdash-scrim" onClick={() => setNavOpen(false)} aria-hidden="true" />}
    </div>
  )
}
