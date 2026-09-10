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
import { DispatcherTable } from '@/widgets/dispatcher-table/ui/DispatcherTable'
import { DispatcherTrend } from '@/widgets/dispatcher-trend/ui/DispatcherTrend'
import { BubbleChart } from '@/widgets/bubble-chart/ui/BubbleChart'
import { DonutBar } from '@/widgets/donut-bar/ui/DonutBar'
import { RpmRankTables } from '@/widgets/rpm-rank-tables/ui/RpmRankTables'
import { DeskWeekModal } from '@/widgets/desk-week-modal/ui/DeskWeekModal'
import { Checklist } from '@/widgets/premium-table/ui/Checklist'
import { PremiumTable, type PremiumColumn } from '@/widgets/premium-table/ui/PremiumTable'
import { formatMoney, formatMiles, formatNumber, formatRpm } from '@/shared/lib/format/number'

const TOP_N_OPTIONS = [10, 15, 20, 0] as const

type SubTab = 'overview' | 'deskunits' | 'units'

const SUB_TABS: { value: SubTab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'deskunits', label: 'Dispatchers & units' },
  { value: 'units', label: 'Units' },
]

const DESK_UNIT_COLUMNS: PremiumColumn<DeskUnitRow>[] = [
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
    render: (r) => r.dispatchers.slice(0, 3).join(', ') + (r.dispatchers.length > 3 ? '…' : ''),
    sortable: false,
  },
]

export function DispatchersTab({ loads, onFormula }: { loads: Load[]; onFormula(code: string): void }) {
  const [sub, setSub] = useState<SubTab>('overview')
  const [topN, setTopN] = useState<number>(15)
  const [familyFilter, setFamilyFilter] = useState('All')
  const [deskSel, setDeskSel] = useState<Set<string>>(new Set())
  const [deskFilterOn, setDeskFilterOn] = useState(false)
  const [modalFamily, setModalFamily] = useState<string | null>(null)

  const ledger = weeklyLedger(loads)
  const weeks = ledger.length
  const families = familyShare(loads)
  const familyNames = families.map((f) => f.family)

  const scoped = useMemo(() => {
    let out = familyFilter === 'All' ? loads : loads.filter((l) => l.family === familyFilter)
    if (deskFilterOn && deskSel.size > 0) out = out.filter((l) => deskSel.has(l.dispatcher))
    return out
  }, [loads, familyFilter, deskFilterOn, deskSel])

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

  const dUnitRows = useMemo(() => deskUnitRows(scoped, weeks), [scoped, weeks])
  const unitRows = useMemo(() => unitEconomics(scoped, weeks), [scoped, weeks])
  const unitBubbles = useMemo(() => bubbleByUnit(scoped, weeks), [scoped, weeks])

  const donutData = rows.map((r, i) => ({
    name: r.desk,
    value: r.gross,
    color: deskColor(i),
    display: formatMoney(r.gross),
  }))

  const controls = (
    <>
      <div className="dfield">
        <label>Family</label>
        <select className="dselect" value={familyFilter} onChange={(e) => setFamilyFilter(e.target.value)} style={{ minWidth: 120 }}>
          <option value="All">All</option>
          {familyNames.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>
      <div className="dfield">
        <label>Top N</label>
        <select className="dselect" value={topN} onChange={(e) => setTopN(Number(e.target.value))} style={{ minWidth: 90 }}>
          {TOP_N_OPTIONS.map((n) => (
            <option key={n} value={n}>{n === 0 ? 'All' : n}</option>
          ))}
        </select>
      </div>
      <label className="dcheck">
        <input type="checkbox" checked={deskFilterOn} onChange={(e) => setDeskFilterOn(e.target.checked)} />
        Filter by dispatcher
      </label>
    </>
  )

  const familyControl = (
    <div className="dfield">
      <label>Family</label>
      <select className="dselect" value={familyFilter} onChange={(e) => setFamilyFilter(e.target.value)} style={{ minWidth: 120 }}>
        <option value="All">All</option>
        {familyNames.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
    </div>
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
      </div>

      {deskFilterOn && (
        <div className="dcontrols" style={{ marginBottom: 16 }}>
          <Checklist label="Dispatchers" options={allDeskNames} selected={deskSel} onChange={setDeskSel} />
        </div>
      )}

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

            <DispatcherTable rows={rows} extraControls={controls} onFormula={onFormula} />
            <DonutBar
              title="Desk Σ gross share"
              caption={`Top ${topN > 0 ? topN : 'all'} desks · donut + benchmark bar`}
              data={donutData}
            />
            <BubbleChart
              title="Dispatcher snapshot"
              points={deskBubbles}
              colorOf={(_n, i) => deskColor(i)}
              defaultX="loads"
              defaultY="gross"
              defaultZ="gross"
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
                <div className="kpi-value">{new Set(scoped.map((l) => l.unitId)).size}</div>
                <div className="kpi-under">distinct units in slice</div>
              </div>
              <div className="kpi-card kpi-navy">
                <div className="kpi-label">Avg units / dispatcher</div>
                <div className="kpi-value">
                  {allRows.length > 0
                    ? (allRows.reduce((s, r) => s + r.activeUnits, 0) / allRows.length).toFixed(1)
                    : '–'}
                </div>
                <div className="kpi-under">mean desk fleet size</div>
              </div>
              <div className="kpi-card kpi-cyan">
                <div className="kpi-label">Loads per unit</div>
                <div className="kpi-value">
                  {(() => {
                    const u = new Set(scoped.map((l) => l.unitId)).size
                    return u > 0 ? (scoped.length / u).toFixed(1) : '–'
                  })()}
                </div>
                <div className="kpi-under">Σ loads ÷ Σ units</div>
              </div>
              <div className="kpi-card kpi-slate">
                <div className="kpi-label">Gross per unit</div>
                <div className="kpi-value">
                  {(() => {
                    const u = new Set(scoped.map((l) => l.unitId)).size
                    const g = scoped.reduce((s, r) => s + r.grossRate, 0)
                    return u > 0 ? formatMoney(g / u) : '–'
                  })()}
                </div>
                <div className="kpi-under">Σ gross ÷ Σ units</div>
              </div>
            </div>

            <PremiumTable
              title="Dispatcher × unit table"
              caption="One row per dispatcher–unit pair · sortable · heat-shaded"
              rows={dUnitRows}
              columns={DESK_UNIT_COLUMNS}
              rowKey={(r) => `${r.desk}-${r.unitId}`}
              firstColLabel="Dispatcher · Unit"
              firstCol={(r) => `${r.desk} · U${r.unitId}`}
              defaultSort="gross"
              minWidth={920}
              extraControls={familyControl}
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
                <div className="kpi-value">{unitRows.length}</div>
                <div className="kpi-under">rows in this slice</div>
              </div>
              <div className="kpi-card kpi-navy">
                <div className="kpi-label">Avg desks / unit</div>
                <div className="kpi-value">
                  {unitRows.length > 0
                    ? (unitRows.reduce((s, r) => s + r.dispatchers.length, 0) / unitRows.length).toFixed(1)
                    : '–'}
                </div>
                <div className="kpi-under">mean dispatchers per truck</div>
              </div>
              <div className="kpi-card kpi-cyan">
                <div className="kpi-label">Loads per unit</div>
                <div className="kpi-value">
                  {unitRows.length > 0
                    ? (unitRows.reduce((s, r) => s + r.loads, 0) / unitRows.length).toFixed(1)
                    : '–'}
                </div>
                <div className="kpi-under">mean loads per truck</div>
              </div>
              <div className="kpi-card kpi-slate">
                <div className="kpi-label">Gross per unit</div>
                <div className="kpi-value">
                  {unitRows.length > 0
                    ? formatMoney(unitRows.reduce((s, r) => s + r.gross, 0) / unitRows.length)
                    : '–'}
                </div>
                <div className="kpi-under">mean Σ gross per truck</div>
              </div>
            </div>

            <p className="dash-subnav-hint" style={{ marginBottom: 12 }}>
              One row per unit · Σ across every dispatcher who worked that truck.
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
              extraControls={familyControl}
            />
            <BubbleChart
              title="Units snapshot"
              points={unitBubbles}
              colorOf={(_n, i) => deskColor(i)}
              defaultX="loads"
              defaultY="gross"
              defaultZ="gross"
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
