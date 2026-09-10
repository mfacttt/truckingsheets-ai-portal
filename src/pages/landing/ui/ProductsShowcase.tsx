import { DispatchSheetsGlyph, FleetSheetsGlyph, CheckIcon } from '@/shared/ui/icons'
import { DISPATCH_SHEETS_URL } from '@/shared/config/constants'

export function ProductsShowcase() {
  return (
    <section className="section section-tint" id="products">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">Products</p>
          <h2>The Solei LLC lineup</h2>
          <p>Tools we build for dispatchers. One account works across all of them.</p>
        </div>

        <div className="prod-grid">
          <article className="prod-card rv">
            <div className="prod-top">
              <span className="prod-ic prod-ic-warm" aria-hidden="true">
                <DispatchSheetsGlyph />
              </span>
              <span className="prod-num num" aria-hidden="true">
                01
              </span>
            </div>
            <h3>Dispatch Sheets AI</h3>
            <p className="prod-tag" style={{ color: 'var(--sun-deep)' }}>
              AI rate con parser for Google Sheets
            </p>
            <p className="prod-blurb">
              Reads any broker's rate confirmation, PDF or scan, and writes a verified row into
              your own Google Sheet, every field mapped to your columns.
            </p>
            <ul className="plan-includes">
              <li>
                <CheckIcon />
                Works with any broker's format
              </li>
              <li>
                <CheckIcon />
                Your spreadsheet, your columns
              </li>
            </ul>
            <div className="prod-actions">
              <a className="btn btn-quiet" href={DISPATCH_SHEETS_URL} rel="noopener">
                Visit Dispatch Sheets AI
              </a>
              <span className="pill pill-good">Live</span>
            </div>
          </article>

          <article className="prod-card rv">
            <div className="prod-top">
              <span className="prod-ic" aria-hidden="true">
                <FleetSheetsGlyph />
              </span>
              <span className="prod-num num" aria-hidden="true">
                02
              </span>
            </div>
            <h3>Trucking Sheets AI</h3>
            <p className="prod-tag">Fleet analytics from your dispatch sheet</p>
            <p className="prod-blurb">
              Turns the loads already in your Google Sheet into a fleet dashboard: weekly gross,
              RPM and revenue per truck, sliced by trailer type or dispatcher.
            </p>
            <ul className="plan-includes">
              <li>
                <CheckIcon />
                Weekly gross, RPM, miles and loads
              </li>
              <li>
                <CheckIcon />
                Any week range, with a weekly ledger to match
              </li>
            </ul>
            <div className="prod-actions">
              <span className="pill pill-good">Live — you're looking at it</span>
            </div>
          </article>

          <article className="prod-card prod-card-ghost rv" aria-hidden="true">
            <div className="prod-top">
              <span className="prod-ic prod-ic-ghost">?</span>
              <span className="prod-num num">03</span>
            </div>
            <h3>More on the road</h3>
            <p className="prod-tag">The lineup keeps growing</p>
            <p className="prod-blurb">
              New dispatcher tools land here first, and every account picks them up automatically.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
