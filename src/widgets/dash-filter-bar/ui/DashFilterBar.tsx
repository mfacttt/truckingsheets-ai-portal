import { DASH_METRICS, TOP_N_OPTIONS, useDashFilters, type DashMetric } from '@/entities/dashboard/model/dash-filters'
import { deskColor, familyColor } from '@/entities/dashboard/lib/aggregate'
import { MultiFilterButton } from './MultiFilterButton'

/** The shared Family / Metric / Top N / Units row. It drives every card on the
 *  tab, so it is rendered once above them rather than in each card header. */
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
  const {
    families: pickedFamilies,
    metric,
    topN,
    units,
    unitsOn,
    setFamilies,
    setMetric,
    setTopN,
    setUnits,
    setUnitsOn,
  } = useDashFilters()

  return (
    <>
      <MultiFilterButton
        label="Family"
        options={families}
        picked={pickedFamilies}
        onChange={setFamilies}
        colorOf={(f) => familyColor(f)}
        allLabel="All families"
      />

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

      {unitOptions && unitOptions.length > 0 && (
        <MultiFilterButton<number>
          label="Units"
          options={unitOptions}
          picked={unitsOn ? units : new Set<number>()}
          onChange={(next) => {
            setUnits(next)
            setUnitsOn(next.size > 0)
          }}
          colorOf={(_u, i) => deskColor(i)}
          render={(u) => `Unit ${u}`}
          allLabel="All units"
        />
      )}
    </>
  )
}
