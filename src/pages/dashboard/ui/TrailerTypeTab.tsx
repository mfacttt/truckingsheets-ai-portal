import { useMemo, useState } from 'react'
import {
  bubbleByFamily,
  bubbleByUnit,
  familyColor,
  familyShare,
  unitEconomics,
  weeklyLedger,
} from '@/entities/dashboard/lib/aggregate'
import type { Load } from '@/entities/dashboard/model/types'
import { FamilyShareTable } from '@/widgets/family-table/ui/FamilyShareTable'
import { UnitsEconomicsTable } from '@/widgets/family-table/ui/UnitsEconomicsTable'
import { FamilyWeeklyHistogram } from '@/widgets/family-weekly-histogram/ui/FamilyWeeklyHistogram'
import { UnitWeeklyHistogram } from '@/widgets/unit-weekly-histogram/ui/UnitWeeklyHistogram'
import { BubbleChart } from '@/widgets/bubble-chart/ui/BubbleChart'
import { DonutBar } from '@/widgets/donut-bar/ui/DonutBar'
import { Checklist } from '@/widgets/premium-table/ui/Checklist'
import { deskColor } from '@/entities/dashboard/lib/aggregate'
import { formatMoney } from '@/shared/lib/format/number'

type SubTab = 'overview' | 'units' | 'lines'

const SUB_TABS: { value: SubTab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'units', label: 'Units & economics' },
  { value: 'lines', label: 'Weekly lines' },
]

export function TrailerTypeTab({ loads }: { loads: Load[] }) {
  const [sub, setSub] = useState<SubTab>('overview')
  const [primary, setPrimary] = useState('All')
  const [unitSel, setUnitSel] = useState<Set<number>>(new Set())
  const [unitFilterOn, setUnitFilterOn] = useState(false)

  const families = familyShare(loads)
  const familyNames = families.map((f) => f.family)
  const ledger = weeklyLedger(loads)

  const scopedLoads = useMemo(
    () => (primary === 'All' ? loads : loads.filter((l) => l.family === primary)),
    [loads, primary],
  )

  const allUnits = useMemo(
    () => [...new Set(scopedLoads.map((l) => l.unitId))].sort((a, b) => a - b),
    [scopedLoads],
  )
  const unitScoped = useMemo(
    () => (unitFilterOn && unitSel.size > 0 ? scopedLoads.filter((l) => unitSel.has(l.unitId)) : scopedLoads),
    [scopedLoads, unitFilterOn, unitSel],
  )

  const units = unitEconomics(unitScoped, ledger.length)
  const famBubbles = useMemo(() => bubbleByFamily(loads, ledger.length), [loads, ledger.length])
  const unitBubbles = useMemo(() => bubbleByUnit(unitScoped, ledger.length), [unitScoped, ledger.length])

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
        <div className="dfield" style={{ marginLeft: 'auto' }}>
          <label>Primary selection</label>
          <select className="dselect" value={primary} onChange={(e) => setPrimary(e.target.value)} style={{ minWidth: 140 }}>
            <option value="All">All families</option>
            {familyNames.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="subtab-fade" key={sub}>
        {sub === 'overview' && (
          <>
            <FamilyShareTable rows={families} weekCount={ledger.length} />
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
            <FamilyWeeklyHistogram loads={scopedLoads} families={primary === 'All' ? familyNames : [primary]} />
          </>
        )}

        {sub === 'units' && (
          <>
            <div className="dcontrols" style={{ marginBottom: 16 }}>
              <label className="dcheck">
                <input type="checkbox" checked={unitFilterOn} onChange={(e) => setUnitFilterOn(e.target.checked)} />
                Filter by units
              </label>
              {unitFilterOn && (
                <Checklist label="Units" options={allUnits} selected={unitSel} onChange={setUnitSel} render={(u) => `Unit ${u}`} />
              )}
            </div>
            <UnitsEconomicsTable rows={units} />
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
            <UnitWeeklyHistogram loads={unitScoped} unitIds={units.map((u) => u.unitId)} />
          </>
        )}

        {sub === 'lines' && (
          <FamilyWeeklyHistogram loads={scopedLoads} families={primary === 'All' ? familyNames : [primary]} />
        )}
      </div>
    </>
  )
}
