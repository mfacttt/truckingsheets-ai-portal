import { useMemo, useState } from 'react'
import {
  bubbleByFamily,
  bubbleByUnit,
  deskColor,
  familyColor,
  familyShare,
  unitEconomics,
  weeklyLedger,
} from '@/entities/dashboard/lib/aggregate'
import type { Load } from '@/entities/dashboard/model/types'
import { useDashFilters, type DashMetric } from '@/entities/dashboard/model/dash-filters'
import type { UnitEconomicsRow } from '@/entities/dashboard/lib/aggregate'
import type { FamilyShareRow } from '@/entities/dashboard/model/types'
import { DashFilterBar } from '@/widgets/dash-filter-bar/ui/DashFilterBar'
import { FamilyShareTable } from '@/widgets/family-table/ui/FamilyShareTable'
import { UnitsEconomicsTable } from '@/widgets/family-table/ui/UnitsEconomicsTable'
import { FamilyWeeklyHistogram } from '@/widgets/family-weekly-histogram/ui/FamilyWeeklyHistogram'
import { UnitWeeklyHistogram } from '@/widgets/unit-weekly-histogram/ui/UnitWeeklyHistogram'
import { BubbleChart } from '@/widgets/bubble-chart/ui/BubbleChart'
import { DonutBar } from '@/widgets/donut-bar/ui/DonutBar'
import { Checklist } from '@/widgets/premium-table/ui/Checklist'
import { formatMoney } from '@/shared/lib/format/number'

/** The shared Metric drives the ranking of every table on the board, so the same
 *  pick means the same ordering whichever slice the reader is looking at. */
const UNIT_METRIC_VALUE: Record<DashMetric, (r: UnitEconomicsRow) => number> = {
  gross: (r) => r.gross,
  avgGrossWk: (r) => r.avgGrossPerWeekLedger,
  rpm: (r) => r.rpm,
  miles: (r) => r.miles,
  avgGrossWeekUnit: (r) => r.avgGrossPerHaulingWeek,
  avgLoadRate: (r) => r.avgLoadRate,
  loads: (r) => r.loads,
}

const FAMILY_METRIC_VALUE: Record<DashMetric, (r: FamilyShareRow, weeks: number) => number> = {
  gross: (r) => r.gross,
  avgGrossWk: (r, w) => (w > 0 ? r.gross / w : 0),
  rpm: (r) => r.rpm,
  miles: (r) => r.miles,
  avgGrossWeekUnit: (r, w) => (w > 0 && r.units > 0 ? r.gross / (w * r.units) : 0),
  avgLoadRate: (r) => (r.loads > 0 ? r.gross / r.loads : 0),
  loads: (r) => r.loads,
}

type SubTab = 'overview' | 'units'

const SUB_TABS: { value: SubTab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'units', label: 'Units & economics' },
]

export function TrailerTypeTab({ loads }: { loads: Load[] }) {
  const [sub, setSub] = useState<SubTab>('overview')
  const [unitSel, setUnitSel] = useState<Set<number>>(new Set())
  const [unitFilterOn, setUnitFilterOn] = useState(false)
  const { family, metric, topN } = useDashFilters()

  const allFamilies = familyShare(loads)
  const familyNames = allFamilies.map((f) => f.family)
  const ledger = weeklyLedger(loads)
  const ledgerWeeks = ledger.length

  const scopedLoads = useMemo(
    () => (family === 'All' ? loads : loads.filter((l) => l.family === family)),
    [loads, family],
  )

  // Tables and the donut follow the same Family pick as everything else on the board.
  const families = useMemo(() => {
    const rows = familyShare(scopedLoads)
    return [...rows].sort(
      (a, b) => FAMILY_METRIC_VALUE[metric](b, ledgerWeeks) - FAMILY_METRIC_VALUE[metric](a, ledgerWeeks),
    )
  }, [scopedLoads, metric, ledgerWeeks])

  const allUnits = useMemo(
    () => [...new Set(scopedLoads.map((l) => l.unitId))].sort((a, b) => a - b),
    [scopedLoads],
  )
  const unitScoped = useMemo(
    () => (unitFilterOn && unitSel.size > 0 ? scopedLoads.filter((l) => unitSel.has(l.unitId)) : scopedLoads),
    [scopedLoads, unitFilterOn, unitSel],
  )

  const allUnitRows = useMemo(() => {
    const rows = unitEconomics(unitScoped, ledgerWeeks)
    return [...rows].sort((a, b) => UNIT_METRIC_VALUE[metric](b) - UNIT_METRIC_VALUE[metric](a))
  }, [unitScoped, ledgerWeeks, metric])
  const units = topN > 0 ? allUnitRows.slice(0, topN) : allUnitRows
  const famBubbles = useMemo(() => bubbleByFamily(scopedLoads, ledger.length), [scopedLoads, ledger.length])
  const unitBubbles = useMemo(() => bubbleByUnit(unitScoped, ledger.length), [unitScoped, ledger.length])

  // Histograms stay readable on a single-family pick by keeping every family in the
  // series list — narrowing to one series is what made them show a lone column.
  const histogramFamilies = family === 'All' ? familyNames : [family]
  const histogramLoads = family === 'All' ? loads : scopedLoads

  const donutData = families.map((f) => ({
    name: f.family,
    value: f.gross,
    color: familyColor(f.family),
    display: formatMoney(f.gross),
  }))

  const unitMixData = useMemo(
    () =>
      units.slice(0, 12).map((u, i) => ({
        name: `Unit ${u.unitId}`,
        value: u.gross,
        color: deskColor(i),
        display: formatMoney(u.gross),
      })),
    [units],
  )

  const filterBar = <DashFilterBar families={familyNames} />

  return (
    <>
      <div className="dcard-inline-controls">
        <div className="seg-pill-row">
          {SUB_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`seg-pill${sub === t.value ? ' is-active' : ''}`}
              onClick={() => setSub(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="subtab-fade" key={sub}>
        {sub === 'overview' && (
          <>
            <FamilyShareTable rows={families} weekCount={ledger.length} extraControls={filterBar} />
            <DonutBar
              title="Mix · Σ gross share by trailer family"
              caption="Donut + benchmark bar · same window"
              data={donutData}
            />
            <BubbleChart
              title="Trailer family snapshot"
              points={famBubbles}
              colorOf={(name) => familyColor(name)}
              defaultX="loads"
              defaultY="gross"
              defaultZ="gross"
            />
            <FamilyWeeklyHistogram
              loads={histogramLoads}
              families={histogramFamilies}
              allFamilies={familyNames}
            />
          </>
        )}

        {sub === 'units' && (
          <>
            <UnitsEconomicsTable
              rows={units}
              extraControls={
                <>
                  {filterBar}
                  <label className="dcheck">
                    <input type="checkbox" checked={unitFilterOn} onChange={(e) => setUnitFilterOn(e.target.checked)} />
                    Filter by units
                  </label>
                </>
              }
            />
            {unitFilterOn && (
              <div className="dcontrols" style={{ marginBottom: 16 }}>
                <Checklist label="Units" options={allUnits} selected={unitSel} onChange={setUnitSel} render={(u) => `Unit ${u}`} />
              </div>
            )}
            <DonutBar
              title="Unit mix · Σ gross share"
              caption="Top 12 units · donut + benchmark bar"
              data={unitMixData}
            />
            <BubbleChart
              title="Per-unit snapshot"
              points={unitBubbles}
              colorOf={(_n, i) => deskColor(i)}
              defaultX="loads"
              defaultY="gross"
              defaultZ="gross"
            />
            <UnitWeeklyHistogram loads={unitScoped} unitIds={allUnitRows.map((u) => u.unitId)} />
          </>
        )}
      </div>
    </>
  )
}
