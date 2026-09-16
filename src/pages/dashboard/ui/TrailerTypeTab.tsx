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
import { formatMiles, formatMoney, formatRpm } from '@/shared/lib/format/number'

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
  const { keepsFamily, metric, topN, units: unitSel, unitsOn: unitFilterOn } = useDashFilters()

  const allFamilies = familyShare(loads)
  const familyNames = allFamilies.map((f) => f.family)
  const ledger = weeklyLedger(loads)
  const ledgerWeeks = ledger.length

  const scopedLoads = useMemo(() => loads.filter((l) => keepsFamily(l.family)), [loads, keepsFamily])

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
    () => (unitFilterOn ? scopedLoads.filter((l) => unitSel.has(l.unitId)) : scopedLoads),
    [scopedLoads, unitFilterOn, unitSel],
  )

  const allUnitRows = useMemo(() => {
    const rows = unitEconomics(unitScoped, ledgerWeeks)
    return [...rows].sort((a, b) => UNIT_METRIC_VALUE[metric](b) - UNIT_METRIC_VALUE[metric](a))
  }, [unitScoped, ledgerWeeks, metric])
  const units = topN > 0 ? allUnitRows.slice(0, topN) : allUnitRows
  const famBubbles = useMemo(() => bubbleByFamily(scopedLoads, ledger.length), [scopedLoads, ledger.length])
  const unitBubbles = useMemo(() => bubbleByUnit(unitScoped, ledger.length), [unitScoped, ledger.length])

  // The histogram keeps every family in its series list and lets its own picker
  // narrow them, so a family pick on the board does not leave it a lone column.
  const histogramFamilies = familyNames
  const histogramLoads = loads

  const donutData = families.map((f) => ({
    name: f.family,
    value: f.gross,
    color: familyColor(f.family),
    display: formatMoney(f.gross),
  }))

  // Each metric is its own slice set, so switching re-measures the mix rather
  // than re-scaling the same one.
  const mixMetrics = useMemo(
    () => [
      { value: 'gross', label: 'Gross', data: donutData },
      {
        value: 'rpm',
        label: 'RPM',
        data: families.map((f) => ({
          name: f.family,
          value: f.rpm,
          color: familyColor(f.family),
          display: formatRpm(f.rpm),
        })),
      },
      {
        value: 'miles',
        label: 'Miles',
        data: families.map((f) => ({
          name: f.family,
          value: f.miles,
          color: familyColor(f.family),
          display: formatMiles(f.miles),
        })),
      },
    ],
    [families, donutData],
  )

  const unitMixData = useMemo(
    () =>
      units.map((u, i) => ({
        name: `Unit ${u.unitId}`,
        value: u.gross,
        color: deskColor(i),
        display: formatMoney(u.gross),
      })),
    [units],
  )

  // Units only where units are the subject: the overview is about trailer types.
  const filterBar = <DashFilterBar families={familyNames} {...(sub === 'units' ? { unitOptions: allUnits } : {})} />

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
        {/* One filter row for the whole tab: it drives every card below, so
            repeating it in each card header only made it look per-card. */}
        <div className="dcontrols board-filters">{filterBar}</div>
      </div>

      <div className="subtab-fade" key={sub}>
        {sub === 'overview' && (
          <>
            <FamilyShareTable rows={families} weekCount={ledger.length} />
            <DonutBar
              title="Mix · Σ gross share by trailer family"
              caption="Donut + benchmark bar · pick one family to weigh it against the rest"
              data={donutData}
              metrics={mixMetrics}
              focusOptions={families.map((f) => f.family)}
            />
            <BubbleChart
              title="Trailer family snapshot"
              points={famBubbles}
              colorOf={(name) => familyColor(name)}
              defaultX="loads"
              defaultY="gross"
              defaultZ="avgLoadRate"
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
            />
            <DonutBar
              title="Unit mix · Σ gross share"
              caption="Donut + benchmark bar · the board's Top N sets how many units"
              data={unitMixData}
            />
            <BubbleChart
              title="Per-unit snapshot"
              points={unitBubbles}
              colorOf={(_n, i) => deskColor(i)}
              defaultX="loads"
              defaultY="gross"
              defaultZ="avgLoadRate"
            />
            <UnitWeeklyHistogram loads={unitScoped} unitIds={units.map((u) => u.unitId)} />
          </>
        )}
      </div>
    </>
  )
}
