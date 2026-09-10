import { Link } from '@/shared/lib/router/router'
import { TruckIcon } from '@/shared/ui/icons'

interface PlanItem {
  name: string
  fleet: string
  price: string
  cadence: string
  desc: string
  featured?: boolean
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
  },
  {
    name: 'Carrier',
    fleet: 'unlimited trucks',
    price: "Let's talk",
    cadence: '',
    desc: 'Custom rollups, multiple terminals, priority support.',
  },
]

export function Pricing() {
  return (
    <section className="section" id="pricing">
      <div className="wrap">
        <div className="section-head center">
          <p className="eyebrow">Pricing</p>
          <h2>Simple, per-fleet pricing</h2>
          <p>One account across the whole Solei LLC lineup — Dispatch Sheets AI included.</p>
        </div>

        <div className="plans">
          {PLANS.map((p) => (
            <article className={`plan${p.featured ? ' plan-featured' : ''}`} key={p.name}>
              {p.featured && <span className="plan-flag">Most popular</span>}
              <div className="plan-top">
                <h3>{p.name}</h3>
                <span className="plan-fleet">
                  <TruckIcon />
                  {p.fleet}
                </span>
              </div>
              <div className="plan-price">
                <b className="num">{p.price}</b>
                {p.cadence && <span>{p.cadence}</span>}
              </div>
              <p className="plan-desc">{p.desc}</p>
              <Link className={`btn ${p.featured ? 'btn-primary' : 'btn-quiet'}`} to="/login">
                Try the demo
              </Link>
            </article>
          ))}
        </div>

        <p className="plans-note">Demo access is free — no card required to explore the dashboard.</p>
      </div>
    </section>
  )
}
