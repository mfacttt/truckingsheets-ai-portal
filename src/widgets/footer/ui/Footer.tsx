import { Link } from '@/shared/lib/router/router'
import { Logo } from '@/shared/ui/icons'
import { DISPATCH_SHEETS_URL } from '@/shared/config/constants'
import './footer.css'

const CONTACT_EMAIL = 'ceo@soleidispatch.com'

export function Footer() {
  return (
    <footer>
      <div className="wrap foot">
        <Link to="/" aria-label="Trucking Sheets AI home">
          <Logo />
        </Link>
        <nav className="foot-links" aria-label="Footer">
          <a href="/#how">How it works</a>
          <a href="/#pricing">Pricing</a>
          <a href={DISPATCH_SHEETS_URL} rel="noopener">
            Dispatch Sheets AI
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
        </nav>
        <div className="foot-sign">
          <span className="by">by</span>
          <span className="name">Solei LLC</span>
        </div>
        <p className="foot-copy">
          © 2026 Solei LLC. Trucking Sheets AI is a companion analytics tool for Google Sheets™.
          Google Sheets is a trademark of Google LLC. This is a demo environment — figures shown are
          sample fleet data.
        </p>
      </div>
    </footer>
  )
}
