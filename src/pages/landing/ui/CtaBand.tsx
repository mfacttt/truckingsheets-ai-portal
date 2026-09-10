import { Link } from '@/shared/lib/router/router'

export function CtaBand() {
  return (
    <section className="section cta-section">
      <div className="wrap">
        <div className="cta-band rv">
          <h2>See your fleet the way the dashboard sees it</h2>
          <p>
            No signup friction, no card. Open the demo and explore a full sample fleet — every tab,
            chart and filter, exactly as it’ll look on your own sheet.
          </p>
          <Link className="btn btn-primary btn-big" to="/login">
            Try the live demo
          </Link>
          <span className="fine">Sample fleet data · Nothing touches your account until you connect it</span>
        </div>
      </div>
    </section>
  )
}
