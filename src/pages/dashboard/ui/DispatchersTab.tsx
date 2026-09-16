import { useMemo, useState } from 'react'
import {
  bubbleByDesk,
  bubbleByUnit,
  deskColor,
  deskRpmRanked,
  deskUnitRows,
  dispatcherRows,
  familyShare,
  median,
  unitEconomics,
  weeklyLedger,
} from '@/entities/dashboard/lib/aggregate'
import type { DeskUnitRow, UnitEconomicsRow } from '@/entities/dashboard/lib/aggregate'
import type { Load } from '@/entities/dashboard/model/types'
import { useDashFilters, type DashMetric } from '@/entities/dashboard/model/dash-filters'
import { DashFilterBar } from '@/widgets/dash-filter-bar/ui/DashFilterBar'
import { DispatcherTable } from '@/widgets/dispatcher-table/ui/DispatcherTable'
import { DispatcherTrend } from '@/widgets/dispatcher-trend/ui/DispatcherTrend'
import { BubbleChart } from '@/widgets/bubble-chart/ui/BubbleChart'
import { DonutBar } from '@/widgets/donut-bar/ui/DonutBar'
import { RpmRankTables } from '@/widgets/rpm-rank-tables/ui/RpmRankTables'
import { DeskWeekModal } from '@/widgets/desk-week-modal/ui/DeskWeekModal'
import { CountExpandCell } from '@/widgets/premium-table/ui/CountExpandCell'
import { PremiumTable, type PremiumColumn } from '@/widgets/premium-table/ui/PremiumTable'
import { formatMoney, formatMiles, formatNumber, formatRpm } from '@/shared/lib/format/number'

const DESK_UNIT_METRIC_VALUE: Record<DashMetric, (r: DeskUnitRow) => number> = {
  gross: (r) => r.gross,
  avgGrossWk: (r) => r.avgGrossPerWeek,
  rpm: (r) => r.rpm,
  miles: (r) => r.miles,
  avgGrossWeekUnit: (r) => (r.unitCount > 0 ? r.avgGrossPerWeek / r.unitCount : 0),
  avgLoadRate: (r) => r.avgLoadRate,
  loads: (r) => r.loads,
}

type SubTab = 'overview' | 'deskunits' | 'units'

const SUB_TABS: { value: SubTab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'deskunits', label: 'Dispatchers & units' },
  { value: 'units', label: 'Units' },
]

const DESK_UNIT_COLUMNS: PremiumColumn<DeskUnitRow>[] = [
  { key: 'desk', label: 'Dispatcher', render: (r) => r.desk, sortable: false },
  { key: 'gross', label: 'Σ gross', value: (r) => r.gross, render: (r) => formatMoney(r.gross), heat: true, leader: true },
  { key: 'rpm', label: 'RPM', value: (r) => r.rpm, render: (r) => formatRpm(r.rpm), heat: true, leader: true },
  { key: 'miles', label: 'Σ mi', value: (r) => r.miles, render: (r) => formatMiles(r.miles), heat: true },
  { key: 'avgWk', label: 'AVG/WK', value: (r) => r.avgGrossPerWeek, render: (r) => formatMoney(r.avgGrossPerWeek), heat: true },
  {
    key: 'haulWk',
    label: 'Gross ÷ hauling wks',
    value: (r) => r.avgGrossPerHaulingWeek,
    render: (r) => formatMoney(r.avgGrossPerHaulingWeek),
    heat: true,
  },
  { key: 'avgLoadRate', label: 'Avg load rate', value: (r) => r.avgLoadRate, render: (r) => formatMoney(r.avgLoadRate), heat: true },
  { key: 'loads', label: 'Loads', value: (r) => r.loads, render: (r) => formatNumber(r.loads), heat: true, leader: true },
  { key: 'loadsPerUnit', label: 'Loads / unit', value: (r) => r.loadsPerUnit, render: (r) => r.loadsPerUnit.toFixed(1), heat: true },
  { key: 'grossPerUnit', label: 'Gross / unit', value: (r) => r.grossPerUnit, render: (r) => formatMoney(r.grossPerUnit), heat: true },
  { key: 'unitCount', label: 'Active units', value: (r) => r.unitCount, render: (r) => r.unitCount, heat: true },
  { key: 'weeks', label: 'Weeks · active', value: (r) => r.weeksActive, render: (r) => r.weeksActive, sortable: false },
]

const UNIT_COLUMNS: PremiumColumn<UnitEconomicsRow>[] = [
  { key: 'gross', label: 'Σ gross', value: (r) => r.gross, render: (r) => formatMoney(r.gross), heat: true, leader: true },
  { key: 'rpm', label: 'RPM', value: (r) => r.rpm, render: (r) => formatRpm(r.rpm), heat: true, leader: true },
  { key: 'miles', label: 'Σ mi', value: (r) => r.miles, render: (r) => formatMiles(r.miles), heat: true },
  {
    key: 'avgWk',
    label: 'AVG/WK',
    value: (r) => r.avgGrossPerWeekLedger,
    render: (r) => formatMoney(r.avgGrossPerWeekLedger),
    heat: true,
  },
  { key: 'avgLoadRate', label: 'Avg load rate', value: (r) => r.avgLoadRate, render: (r) => formatMoney(r.avgLoadRate), heat: true },
  { key: 'loads', label: 'Loads', value: (r) => r.loads, render: (r) => formatNumber(r.loads), heat: true, leader: true },
  { key: 'weeks', label: 'Weeks · active', value: (r) => r.weeksActive, render: (r) => r.weeksActive, sortable: false },
  {
    key: 'desks',
    label: 'Dispatchers',
    value: (r) => r.dispatchers.length,
    render: (r) => <CountExpandCell items={[...r.dispatchers].sort()} noun="dispatchers" />,
  },
]

export function DispatchersTab({ loads, onFormula }: { loads: Load[]; onFormula(code: string): void }) {
  const [sub, setSub] = useState<SubTab>('overview')
  const [modalFamily, setModalFamily] = useState<string | null>(null)
  const { keepsFamily, keepsDesk, metric, topN, units: unitSel, unitsOn: unitFilterOn } = useDashFilters()

  const ledger = weeklyLedger(loads)
  const weeks = ledger.length
  const families = familyShare(loads)
  const familyNames = families.map((f) => f.family)

  const scoped = useMemo(() => {
    let out = loads.filter((l) => keepsFamily(l.family))
    return out.filter((l) => keepsDesk(l.dispatcher))
  }, [loads, keepsFamily, keepsDesk])

  const allRows = dispatcherRows(scoped, weeks)
  const rows = topN > 0 ? allRows.slice(0, topN) : allRows
  const allDeskNames = useMemo(() => dispatcherRows(loads, weeks).map((r) => r.desk), [loads, weeks])

  const grossValues = allRows.map((r) => r.gross)
  const top = allRows[0]
  const med = median(grossValues)
  const spread = grossValues.length > 0 ? Math.max(...grossValues) - Math.min(...grossValues) : 0

  const topDeskNames = useMemo(() => rows.slice(0, 8).map((r) => r.desk), [rows])
  const deskBubbles = useMemo(
    () => bubbleByDesk(scoped, weeks).slice(0, topN > 0 ? topN : 30),
    [scoped, weeks, topN],
  )
  const { best, worst } = useMemo(() => deskRpmRanked(scoped), [scoped])

  const allUnitIds = useMemo(() => [...new Set(loads.map((l) => l.unitId))].sort((a, b) => a - b), [loads])
  const deskUnitScoped = useMemo(
    () => (unitFilterOn ? scoped.filter((l) => unitSel.has(l.unitId)) : scoped),
    [scoped, unitFilterOn, unitSel],
  )
  const dUnitRows = useMemo(() => {
    const all = deskUnitRows(deskUnitScoped, weeks)
    const ranked = [...all].sort((a, b) => DESK_UNIT_METRIC_VALUE[metric](b) - DESK_UNIT_METRIC_VALUE[metric](a))
    return topN > 0 ? ranked.slice(0, topN) : ranked
  }, [deskUnitScoped, weeks, metric, topN])
  const allUnitRows = useMemo(() => unitEconomics(deskUnitScoped, weeks), [deskUnitScoped, weeks])
  const unitRows = topN > 0 ? allUnitRows.slice(0, topN) : allUnitRows
  const unitBubbles = useMemo(() => bubbleByUnit(deskUnitScoped, weeks), [deskUnitScoped, weeks])

  const donutData = rows.map((r, i) => ({
    name: r.desk,
    value: r.gross,
    color: deskColor(i),
    display: formatMoney(r.gross),
  }))

  // Units only where units are the subject: the overview is about desks.
  const filterBar = (
    <DashFilterBar
      families={familyNames}
      deskOptions={allDeskNames}
      {...(sub === 'overview' ? {} : { unitOptions: allUnitIds })}
    />
  )
  // Metric and Top N rank a table's rows, so they ride in that table's header.
  const rankControls = <DashFilterBar families={familyNames} showFamily={false} showMetric showTopN />

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
            <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="kpi-card kpi-slate">
                <div className="kpi-label">Top dispatcher result</div>
                <div className="kpi-value">{top ? formatMoney(top.gross) : '–'}</div>
                <div className="kpi-under">{top?.desk ?? '—'}</div>
              </div>
              <div className="kpi-card kpi-navy">
                <div className="kpi-label">Median dispatcher result</div>
                <div className="kpi-value">{formatMoney(med)}</div>
                <div className="kpi-under">Σ gross, median across desks</div>
              </div>
              <div className="kpi-card kpi-cyan">
                <div className="kpi-label">Best-worst result gap</div>
                <div className="kpi-value">{formatMoney(spread)}</div>
                <div className="kpi-under">Top desk minus lowest desk</div>
              </div>
            </div>

            <DispatcherTable rows={rows} extraControls={rankControls} onFormula={onFormula} />
            <DonutBar
              title="Desk Σ gross share"
              caption={`Top ${topN > 0 ? topN : 'all'} desks · donut + benchmark bar`}
              data={donutData}
            />
            <DispatcherTrend loads={scoped} desks={topDeskNames} />
            <RpmRankTables best={best} worst={worst} />

            <div className="dcard">
              <div className="dcard-head">
                <div className="dcard-title">
                  <h2>Per-family weekly desk trends</h2>
                  <p>Open a family to see one line per desk, with desk toggles</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {familyNames.slice(0, 6).map((f) => (
                  <button key={f} type="button" className="seg-pill" onClick={() => setModalFamily(f)}>
                    {f} weekly lines
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {sub === 'deskunits' && (
          <>
            <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div className="kpi-card kpi-slate">
                <div className="kpi-label">Active units</div>
                <div className="kpi-value">{new Set(deskUnitScoped.map((l) => l.unitId)).size}</div>
                <div className="kpi-under">distinct units in slice</div>
              </div>
              <div className="kpi-card kpi-navy">
                <div className="kpi-label">Avg units / dispatcher</div>
                <div className="kpi-value">
                  {dUnitRows.length > 0
                    ? (dUnitRows.reduce((s, r) => s + r.unitCount, 0) / dUnitRows.length).toFixed(1)
                    : '–'}
                </div>
                <div className="kpi-under">mean desk fleet size</div>
              </div>
              <div className="kpi-card kpi-cyan">
                <div className="kpi-label">Loads per unit</div>
                <div className="kpi-value">
                  {(() => {
                    const u = new Set(deskUnitScoped.map((l) => l.unitId)).size
                    return u > 0 ? (deskUnitScoped.length / u).toFixed(1) : '–'
                  })()}
                </div>
                <div className="kpi-under">Σ loads ÷ Σ units</div>
              </div>
              <div className="kpi-card kpi-slate">
                <div className="kpi-label">Gross per unit</div>
                <div className="kpi-value">
                  {(() => {
                    const u = new Set(deskUnitScoped.map((l) => l.unitId)).size
                    const g = deskUnitScoped.reduce((s, r) => s + r.grossRate, 0)
                    return u > 0 ? formatMoney(g / u) : '–'
                  })()}
                </div>
                <div className="kpi-under">Σ gross ÷ Σ units</div>
              </div>
            </div>

            <PremiumTable
              title="Dispatchers & units"
              caption="One row per dispatcher · expand Unit to see the unit numbers behind it"
              rows={dUnitRows}
              columns={DESK_UNIT_COLUMNS}
              rowKey={(r) => r.desk}
              firstColLabel="Unit"
              firstCol={(r) => <CountExpandCell items={r.units} noun="unit numbers" />}
              defaultSort="gross"
              minWidth={1020}
              extraControls={rankControls}
            />
            <BubbleChart
              title="Desk × units"
              points={deskBubbles}
              colorOf={(_n, i) => deskColor(i)}
              defaultX="loads"
              defaultY="avgGrossWeek"
              defaultZ="gross"
            />
          </>
        )}

        {sub === 'units' && (
          <>
            <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div className="kpi-card kpi-slate">
                <div className="kpi-label">Active units</div>
                <div className="kpi-value">{allUnitRows.length}</div>
                <div className="kpi-under">rows in this slice</div>
              </div>
              <div className="kpi-card kpi-navy">
                <div className="kpi-label">Avg desks / unit</div>
                <div className="kpi-value">
                  {allUnitRows.length > 0
                    ? (allUnitRows.reduce((s, r) => s + r.dispatchers.length, 0) / allUnitRows.length).toFixed(1)
                    : '–'}
                </div>
                <div className="kpi-under">mean dispatchers per truck</div>
              </div>
              <div className="kpi-card kpi-cyan">
                <div className="kpi-label">Loads per unit</div>
                <div className="kpi-value">
                  {allUnitRows.length > 0
                    ? (allUnitRows.reduce((s, r) => s + r.loads, 0) / allUnitRows.length).toFixed(1)
                    : '–'}
                </div>
                <div className="kpi-under">mean loads per truck</div>
              </div>
              <div className="kpi-card kpi-slate">
                <div className="kpi-label">Gross per unit</div>
                <div className="kpi-value">
                  {allUnitRows.length > 0
                    ? formatMoney(allUnitRows.reduce((s, r) => s + r.gross, 0) / allUnitRows.length)
                    : '–'}
                </div>
                <div className="kpi-under">mean Σ gross per truck</div>
              </div>
            </div>

            <p className="dash-subnav-hint" style={{ marginBottom: 12 }}>
              One row per unit · the Dispatcher count shows who ran that truck in this window.
            </p>
            <PremiumTable
              title="Units table"
              caption="One row per fleet unit · sortable · heat-shaded"
              rows={unitRows}
              columns={UNIT_COLUMNS}
              rowKey={(r) => String(r.unitId)}
              firstColLabel="Unit"
              firstCol={(r) => `Unit ${r.unitId}`}
              defaultSort="gross"
              minWidth={920}
              extraControls={rankControls}
            />
            <BubbleChart
              title="Units snapshot"
              points={unitBubbles}
              colorOf={(_n, i) => deskColor(i)}
              defaultX="loads"
              defaultY="gross"
              defaultZ="avgLoadRate"
            />
          </>
        )}
      </div>

      {modalFamily && (
        <DeskWeekModal
          family={modalFamily}
          loads={loads.filter((l) => l.family === modalFamily)}
          desks={dispatcherRows(loads.filter((l) => l.family === modalFamily), weeks)
            .map((r) => r.desk)
            .slice(0, 12)}
          onClose={() => setModalFamily(null)}
        />
      )}
    </>
  )
}
