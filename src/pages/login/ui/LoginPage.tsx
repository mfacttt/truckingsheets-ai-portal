import { useState, type FormEvent } from 'react'
import { Redirect, useRouter } from '@/shared/lib/router/router'
import { CheckIcon, FleetSheetsGlyph } from '@/shared/ui/icons'
import { useSession } from '@/entities/session/model/session-context'
import './auth.css'

const BENEFITS = [
  'Weekly gross, RPM and miles, straight from your sheet',
  'Break it down by trailer type or by dispatcher',
  'Any week range, with a weekly ledger to match',
]

export default function LoginPage() {
  const { user, signIn } = useSession()
  const { navigate } = useRouter()
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Redirect to="/dashboard" />

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    signIn({ email: email.trim(), company: company.trim() })
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
              No setup. See exactly what the Fleet Analytics dashboard looks like on real data
              patterns, before you connect your own sheet.
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
          <div style={{ width: '100%' }}>
            <div className="auth-box-head">
              <span className="auth-box-ic">
                <FleetSheetsGlyph />
              </span>
              <h2>Enter the demo</h2>
              <p>No password, no card — this unlocks the sample Fleet Analytics dashboard.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="email">Work email</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourfleet.com"
                />
              </div>
              <div className="field">
                <label htmlFor="company">Company (optional)</label>
                <input
                  id="company"
                  type="text"
                  autoComplete="organization"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Your trucking company"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-big" disabled={submitting}>
                Enter demo dashboard
              </button>
              <p className="auth-fineprint">
                Demo data only — this is not connected to a real Google Sheet.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
