import { Link } from '@/shared/lib/router/router'
import { CheckIcon } from '@/shared/ui/icons'
import { HeroPreview } from '@/widgets/hero-preview/ui/HeroPreview'

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="wrap-wide hero-in">
        <div>
          <span className="hero-badge">
            <span className="hero-badge-dot" aria-hidden="true" />
            Part of the <b>Solei&nbsp;LLC</b> dispatcher lineup
          </span>
          <h1>
            The loads are already
            <br />
            in your sheet.
            <br />
            <span className="lift">Now read them.</span>
          </h1>
          <p className="hero-sub">
            Trucking Sheets AI turns your dispatch sheet into a live fleet dashboard — weekly gross,
            RPM and revenue per truck, sliced by trailer type or dispatcher. No new columns, no
            data entry, no formulas to babysit.
          </p>
          <div className="hero-ctas">
            <Link className="btn btn-primary btn-big" to="/login">
              Try the live demo
            </Link>
            <a className="btn btn-quiet btn-big" href="#views">
              See the four views
            </a>
          </div>
          <div className="hero-trust">
            <span>
              <CheckIcon />
              Reads the sheet you already dispatch from
            </span>
            <span>
              <CheckIcon />
              Never writes to your data
            </span>
            <span>
              <CheckIcon />
              One account across the lineup
            </span>
          </div>
        </div>
        <HeroPreview />
      </div>
    </section>
  )
}
