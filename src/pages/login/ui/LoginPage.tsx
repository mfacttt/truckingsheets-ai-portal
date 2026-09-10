import { Redirect, useRouter } from '@/shared/lib/router/router'
import { CheckIcon } from '@/shared/ui/icons'
import { useSession } from '@/entities/session/model/session-context'
import { getCurrentUser } from '@/entities/session/api/session-api'
import { AuthFlow } from '@/features/auth-flow/ui/AuthFlow'
import './auth.css'

const BENEFITS = [
  'Weekly gross, RPM and miles, straight from your sheet',
  'Break it down by trailer type or by dispatcher',
  'Any week range, with a weekly ledger to match',
]

export default function LoginPage() {
  const { user, restoring, setUser } = useSession()
  const { navigate } = useRouter()

  if (restoring) return null
  if (user) return <Redirect to="/dashboard" />

  function handleAuthenticated() {
    setUser(getCurrentUser())
    navigate('/dashboard')
  }

  return (
    <div className="page auth-page">
      <div className="wrap auth-grid">
        <aside className="auth-side" aria-hidden="true">
          <div className="auth-side-in">
            <span className="eyebrow">Trucking Sheets AI</span>
            <h1>Your loads, already a fleet dashboard.</h1>
            <p className="auth-side-sub">
              One Solei account works across Dispatch Sheets AI and Trucking Sheets AI.
            </p>
            <ul className="auth-benefits">
              {BENEFITS.map((b) => (
                <li key={b}>
                  <span className="auth-benefit-ic">
                    <CheckIcon />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="auth-box">
          <AuthFlow onAuthenticated={handleAuthenticated} />
        </div>
      </div>
    </div>
  )
}
