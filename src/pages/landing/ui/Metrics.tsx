interface MetricDef {
  code: string
  name: string
  value: string
  desc: string
}

const METRICS: MetricDef[] = [
  {
    code: 'RPM',
    name: 'Revenue per mile',
    value: '$3.3456',
    desc: 'Ratio of sums — total Σ gross ÷ total loaded miles for the window. Same definition everywhere.',
  },
  {
    code: 'AW',
    name: 'Fleet: avg / week',
    value: '$184,389',
    desc: 'Σ gross ÷ weeks in the filter. The fleet’s weekly run-rate, no truck divisor.',
  },
  {
    code: 'F1',
    name: 'Avg / week ÷ trucks',
    value: '$5,121.93',
    desc: 'Σ fleet gross ÷ (weeks × trucks). The per-truck weekly number for an investor headline.',
  },
  {
    code: 'Σ',
    name: 'Weekly ledger',
    value: '36 rows',
    desc: 'One row per week: gross, RPM, miles, loads, active units — sortable, leader-marked.',
  },
  {
    code: 'Mix',
    name: 'Trailer-family share',
    value: '32.6%',
    desc: 'Each family’s cut of Σ gross, plus its own RPM and load count. Reefer, Dry Van, Flatbed, RGM…',
  },
  {
    code: 'D1',
    name: 'Desk avg / wk ÷ trucks',
    value: 'ranked',
    desc: 'Fair dispatcher comparison when desk sizes differ — with a load-volume floor.',
  },
]

export function Metrics() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">The math, done for you</p>
          <h2>Metrics that would be a spreadsheet full of formulas</h2>
          <p>
            Every number is computed on each load from your sheet. There’s an in-app glossary
            explaining exactly how each one is defined.
          </p>
        </div>

        <div className="metrics">
          {METRICS.map((m) => (
            <article className="metric-tile" key={m.code}>
              <span className="metric-tile-code">{m.code}</span>
              <h3>{m.name}</h3>
              <div className="metric-val">{m.value}</div>
              <p>{m.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
