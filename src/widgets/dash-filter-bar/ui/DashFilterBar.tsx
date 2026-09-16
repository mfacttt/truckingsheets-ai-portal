import { DASH_METRICS, TOP_N_OPTIONS, useDashFilters, type DashMetric } from '@/entities/dashboard/model/dash-filters'
import { deskColor, familyColor } from '@/entities/dashboard/lib/aggregate'
import { MultiFilterButton } from './MultiFilterButton'

/** The shared filter row. What it narrows — families, desks, units — is the same
 *  for every card, so it sits once above them; Metric and Top N rank a table's
 *  rows and stay in that table's header, where the rows they order are. */
export function DashFilterBar({
  families,
  showTopN = false,
  showMetric = false,
  showFamily = true,
  unitOptions,
  deskOptions,
}: {
  families: string[]
  showTopN?: boolean
  showMetric?: boolean
  showFamily?: boolean
  unitOptions?: number[]
  deskOptions?: string[]
}) {
  const {
    families: pickedFamilies,
    metric,
    topN,
    units,
    unitsOn,
    desks,
    setFamilies,
    setMetric,
    setTopN,
    setUnits,
    setUnitsOn,
    setDesks,
  } = useDashFilters()

  return (
    <>
      {showFamily && (
        <MultiFilterButton
          label="Family"
          options={families}
          picked={pickedFamilies}
          onChange={setFamilies}
          colorOf={(f) => familyColor(f)}
          allLabel="All families"
        />
      )}

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

      {deskOptions && deskOptions.length > 0 && (
        <MultiFilterButton<string>
          label="Dispatchers"
          options={deskOptions}
          picked={desks}
          onChange={setDesks}
          colorOf={(_d, i) => deskColor(i)}
          allLabel="All dispatchers"
        />
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
