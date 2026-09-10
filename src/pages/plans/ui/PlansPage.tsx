import { Redirect } from '@/shared/lib/router/router'
import { useSession } from '@/entities/session/model/session-context'
import { DashRail } from '@/widgets/dash-rail/ui/DashRail'
import { CheckIcon, TruckIcon } from '@/shared/ui/icons'
import './plans-page.css'

interface PlanItem {
  name: string
  fleet: string
  price: string
  cadence: string
  desc: string
  featured?: boolean
  current?: boolean
}

const PLANS: PlanItem[] = [
  {
    name: 'Starter',
    fleet: 'up to 10 trucks',
    price: '$29',
    cadence: '/ month',
    desc: 'General view, weekly ledger, per trailer type.',
  },
  {
    name: 'Fleet',
    fleet: 'up to 50 trucks',
    price: '$79',
    cadence: '/ month',
    desc: 'Everything in Starter, plus per-dispatcher analytics and Fleet status.',
    featured: true,
    current: true,
  },
  {
    name: 'Carrier',
    fleet: 'unlimited trucks',
    price: "Let's talk",
    cadence: '',
    desc: 'Custom rollups, multiple terminals, priority support.',
  },
]

export default function PlansPage() {
  const { user, restoring } = useSession()
  if (restoring) return null
  if (!user) return <Redirect to="/login" />

  const current = PLANS.find((p) => p.current)

  return (
    <DashRail contentKey="plans">
      <div className="plans-page-head">
        <h1>Plans</h1>
        <p>This is a preview — plan changes aren't wired up to billing yet.</p>
      </div>

      {current && (
        <div className="plans-current">
          <div>
            <div className="plans-current-label">Current plan</div>
            <div className="plans-current-name">{current.name}</div>
          </div>
          <div className="plans-current-note">
            {current.fleet}
            <br />
            {current.price}
            {current.cadence}
          </div>
        </div>
      )}

      <div className="plans-grid">
        {PLANS.map((p) => (
          <article className={`pplan${p.featured ? ' pplan-featured' : ''}`} key={p.name}>
            {p.featured && <span className="pplan-flag">Most popular</span>}
            <h3 className="pplan-name">{p.name}</h3>
            <div className="pplan-fleet">
              <TruckIcon /> {p.fleet}
            </div>
            <div className="pplan-price">
              <b>{p.price}</b>
              {p.cadence && <span>{p.cadence}</span>}
            </div>
            <p className="pplan-desc">{p.desc}</p>
            {p.current ? (
              <span className="pplan-current-badge">
                <CheckIcon /> Current plan
              </span>
            ) : (
              <button type="button" className="btn btn-quiet" disabled>
                Not available yet
              </button>
            )}
          </article>
        ))}
      </div>
    </DashRail>
  )
}
