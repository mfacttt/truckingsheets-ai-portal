import { useRef, useState } from 'react'
import { Link, useRouter } from '@/shared/lib/router/router'
import { useOutsideClick } from '@/shared/lib/hooks/use-outside-click'
import { ChevronDownIcon, GridIcon, Logo, SignOutIcon } from '@/shared/ui/icons'
import { useSession } from '@/entities/session/model/session-context'
import { ThemeToggle } from '@/features/theme-toggle/ui/ThemeToggle'
import './header.css'

function UserMenu() {
  const { user, signOut } = useSession()
  const { navigate } = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useOutsideClick(ref, open, () => setOpen(false))

  if (!user) return null

  function handleSignOut() {
    setOpen(false)
    signOut()
    navigate('/')
  }

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className="user-chip"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="user-avatar" aria-hidden="true">
          {(user.email || '?')[0]?.toUpperCase()}
        </span>
        <span className="user-chip-mail">{user.email}</span>
        <ChevronDownIcon />
      </button>
      {open && (
        <div className="user-pop" role="menu">
          <div className="user-pop-head">
            <span className="user-pop-mail">{user.email}</span>
            <span className="user-pop-role">Demo access</span>
          </div>
          <Link role="menuitem" to="/dashboard" onClick={() => setOpen(false)}>
            <GridIcon /> Fleet dashboard
          </Link>
          <button role="menuitem" type="button" onClick={handleSignOut}>
            <SignOutIcon /> Exit demo
          </button>
        </div>
      )}
    </div>
  )
}

const LANDING_NAV = [
  { to: '/#how', label: 'How it works' },
  { to: '/#features', label: 'Features' },
  { to: '/#pricing', label: 'Pricing' },
  { to: '/#products', label: 'Products' },
  { to: '/#faq', label: 'FAQ' },
]

export function Header() {
  const { user } = useSession()
  const { path } = useRouter()
  const onLanding = path === '/'

  return (
    <header className="top">
      <div className="wrap top-in">
        <Link to="/" aria-label="Trucking Sheets AI home">
          <Logo />
        </Link>
        {onLanding && (
          <nav className="top-nav" aria-label="Main">
            {LANDING_NAV.map((item) => (
              <a key={item.to} href={item.to}>
                {item.label}
              </a>
            ))}
          </nav>
        )}
        <div className={`top-cta${onLanding ? '' : ' top-cta-solo'}`}>
          <ThemeToggle />
          {user ? (
            <UserMenu />
          ) : (
            <Link className="btn btn-primary" to="/login">
              Try the demo
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
