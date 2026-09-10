import { ArrowDownIcon, CheckIcon } from '@/shared/ui/icons'

const SHEET_ROWS = [
  ['4103', '18', 'M. Rodriguez', 'Reefer', '$6,000', '1,686'],
  ['4111', '18', 'M. Harris', 'Dry Van', '$2,400', '2,121'],
  ['4126', '20', 'J. Jackson', 'Open Deck', '$1,000', '141'],
  ['4130', '21', 'TeamDispatch', 'RGM', '$2,450', '830'],
]

const OUT_BARS = [46, 60, 54, 71, 66, 82, 77, 95]

export function Flow() {
  return (
    <section className="section section-tint" id="how">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">How it works</p>
          <h2>From a row in your sheet to a chart you trust</h2>
          <p>
            Point it at the tab your loads live on. It maps the columns you already have and rolls
            every load up — the same math, every week, nothing to maintain.
          </p>
        </div>

        <div className="flow">
          <div className="flow-card">
            <div className="flow-card-bar">
              <CheckIcon />
              Your Google Sheet · Loads 2026
            </div>
            <table className="flow-sheet">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Wk</th>
                  <th>Dispatcher</th>
                  <th>Trailer</th>
                  <th>Rate</th>
                  <th>Miles</th>
                </tr>
              </thead>
              <tbody>
                {SHEET_ROWS.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (
                      <td key={j}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flow-arrow" aria-hidden="true">
            <ArrowDownIcon />
          </div>

          <div className="flow-card">
            <div className="flow-card-bar">
              <CheckIcon />
              Trucking Sheets AI · General
            </div>
            <div className="flow-out">
              <div className="flow-out-kpis">
                <div className="flow-out-kpi a">
                  <div className="l">Σ Gross</div>
                  <div className="v">$6.64M</div>
                </div>
                <div className="flow-out-kpi b">
                  <div className="l">RPM</div>
                  <div className="v">$3.35</div>
                </div>
                <div className="flow-out-kpi c">
                  <div className="l">Loads</div>
                  <div className="v">2,537</div>
                </div>
              </div>
              <div className="flow-out-bars" aria-hidden="true">
                {OUT_BARS.map((h, i) => (
                  <i key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
