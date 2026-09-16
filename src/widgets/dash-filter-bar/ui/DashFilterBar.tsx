import { DASH_METRICS, TOP_N_OPTIONS, useDashFilters, type DashMetric } from '@/entities/dashboard/model/dash-filters'
import { UnitFilterButton } from './UnitFilterButton'

/** The shared Family / Metric / Top N row. Rendered inside a card header so the
 *  same controls sit next to whichever table or chart the reader is looking at. */
export function DashFilterBar({
  families,
  showTopN = true,
  showMetric = true,
  unitOptions,
}: {
  families: string[]
  showTopN?: boolean
  showMetric?: boolean
  unitOptions?: number[]
}) {
  const { family, metric, topN, setFamily, setMetric, setTopN } = useDashFilters()

  return (
    <>
      <div className="dfield">
        <label>Family</label>
        <select className="dselect" value={family} onChange={(e) => setFamily(e.target.value)} style={{ minWidth: 130 }}>
          <option value="All">All families</option>
          {families.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {showMetric && (
        <div className="dfield">
          <label>Metric</label>
          <select
            className="dselect"
            value={metric}
            onChange={(e) => setMetric(e.target.value as DashMetric)}
            style={{ minWidth: 150 }}
          >
            {DASH_METRICS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      )}

      {showTopN && (
        <div className="dfield">
          <label>Top N</label>
          <select className="dselect" value={topN} onChange={(e) => setTopN(Number(e.target.value))} style={{ minWidth: 90 }}>
            {TOP_N_OPTIONS.map((n) => (
              <option key={n} value={n}>{n === 0 ? 'All' : n}</option>
            ))}
          </select>
        </div>
      )}

      {unitOptions && unitOptions.length > 0 && <UnitFilterButton options={unitOptions} />}
    </>
  )
}
