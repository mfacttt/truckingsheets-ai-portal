import { useMemo, useState } from 'react'
import {
  buildFleetStatusRows,
  dispatchersInData,
  maxAvailableYmd,
  trailerFamily,
  trailerRingColor,
  trailerTypesInData,
  unitIdsInData,
} from '@/entities/dashboard/lib/fleet-status'
import type { DayCell, FleetStatusLoad } from '@/entities/dashboard/model/fleet-status-types'
import { AlertIcon } from '@/shared/ui/icons'
import { Checklist } from '@/widgets/premium-table/ui/Checklist'
import { formatMoney, formatMoneyCompact, formatNumber } from '@/shared/lib/format/number'
import './fleet-status-grid.css'

const WINDOW_OPTIONS = [7, 14, 30] as const

type CellMode = 'status' | 'rate' | 'trailer' | 'type'
const CELL_MODES: { id: CellMode; label: string }[] = [
  { id: 'status', label: 'Status bubbles' },
  { id: 'rate', label: 'Load rate' },
  { id: 'trailer', label: 'Trailer #' },
  { id: 'type', label: 'Trailer type' },
]

const STATE_LABEL: Record<string, string> = {
  pickup: 'Pickup',
  transit: 'In transit',
  delivery: 'Delivery',
  turn: 'Deliver + new pickup',
  idle: 'Idle',
}

function cellTitle(cell: DayCell): string {
  const base = `${STATE_LABEL[cell.state] ?? cell.state} · ${cell.ymd}`
  if (cell.state === 'idle') return base
  const parts = [base]
  if (cell.loadRate != null) parts.push(formatMoney(cell.loadRate))
  if (cell.trailerType) parts.push(cell.trailerType)
  if (cell.trailerNumber != null) parts.push(`#${cell.trailerNumber}`)
  return parts.join(' · ')
}

function cellCaption(cell: DayCell, mode: CellMode): string {
  if (mode === 'status' || cell.state === 'idle') return ''
  if (mode === 'rate') return cell.loadRate != null ? formatMoneyCompact(cell.loadRate).replace('$', '') : ''
  if (mode === 'trailer') return cell.trailerNumber != null ? String(cell.trailerNumber).slice(-4) : ''
  if (mode === 'type') return cell.trailerType ? trailerFamily(cell.trailerType).slice(0, 3) : ''
  return ''
}

export function FleetStatusGrid({ loads }: { loads: FleetStatusLoad[] }) {
  const defaultEnd = useMemo(() => maxAvailableYmd(loads), [loads])
  const [days, setDays] = useState<(typeof WINDOW_OPTIONS)[number]>(14)
  const [endYmd, setEndYmd] = useState(defaultEnd)
  const [trailerType, setTrailerType] = useState('All')
  const [hideInactive, setHideInactive] = useState(false)
  const [cellMode, setCellMode] = useState<CellMode>('status')
  const [showRings, setShowRings] = useState(false)
  const [unitSel, setUnitSel] = useState<Set<number>>(new Set())
  const [deskSel, setDeskSel] = useState<Set<string>>(new Set())
  const [deskFilterOn, setDeskFilterOn] = useState(false)
  const [unitFilterOn, setUnitFilterOn] = useState(false)

  const trailerTypes = useMemo(() => trailerTypesInData(loads), [loads])
  const allUnits = useMemo(() => unitIdsInData(loads), [loads])
  const allDesks = useMemo(() => dispatchersInData(loads), [loads])

  const { units, dayColumns, loadedRow, pickupRateRow } = useMemo(
    () =>
      buildFleetStatusRows(loads, days, endYmd, {
        trailerTypeFilter: trailerType,
        hideInactive,
        units: unitFilterOn ? unitSel : null,
        dispatchers: deskFilterOn ? deskSel : null,
      }),
    [loads, days, endYmd, trailerType, hideInactive, unitFilterOn, unitSel, deskFilterOn, deskSel],
  )

  const loadsInWindow = units.reduce((s, u) => s + u.loadCount, 0)
  const emptyUnits = units.filter((u) => u.loadCount === 0).length
  const ringFamilies = showRings
    ? [...new Set(units.flatMap((u) => u.days.filter((d) => d.trailerType).map((d) => trailerFamily(d.trailerType))))]
    : []

  return (
    <div className="dcard">
      <div className="dcard-head">
        <div className="dcard-title">
          <h2>Fleet status</h2>
          <p>One row per truck · pickup / in-transit / delivery / idle, day by day</p>
        </div>
      </div>

      <div className="fs-toolbar">
        <div className="dfield">
          <label htmlFor="fs-days">Window</label>
          <select id="fs-days" className="dselect" value={days} onChange={(e) => setDays(Number(e.target.value) as 7 | 14 | 30)} style={{ minWidth: 100 }}>
            {WINDOW_OPTIONS.map((d) => (
              <option key={d} value={d}>{d} days</option>
            ))}
          </select>
        </div>
        <div className="dfield">
          <label htmlFor="fs-end">End date</label>
          <input id="fs-end" type="date" value={endYmd} onChange={(e) => setEndYmd(e.target.value)} />
        </div>
        <div className="dfield">
          <label htmlFor="fs-type">Trailer type</label>
          <select id="fs-type" className="dselect" value={trailerType} onChange={(e) => setTrailerType(e.target.value)} style={{ minWidth: 120 }}>
            <option value="All">All</option>
            {trailerTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="dfield">
          <label htmlFor="fs-cell">Cell detail</label>
          <select id="fs-cell" className="dselect" value={cellMode} onChange={(e) => setCellMode(e.target.value as CellMode)} style={{ minWidth: 130 }}>
            {CELL_MODES.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>
        <label className="dcheck">
          <input type="checkbox" checked={showRings} onChange={(e) => setShowRings(e.target.checked)} />
          Trailer-type ring
        </label>
        <label className="dcheck">
          <input type="checkbox" checked={hideInactive} onChange={(e) => setHideInactive(e.target.checked)} />
          Hide units with no loads
        </label>
        <label className="dcheck">
          <input type="checkbox" checked={unitFilterOn} onChange={(e) => setUnitFilterOn(e.target.checked)} />
          Filter by unit
        </label>
        <label className="dcheck">
          <input type="checkbox" checked={deskFilterOn} onChange={(e) => setDeskFilterOn(e.target.checked)} />
          Filter by dispatcher
        </label>
      </div>

      {(unitFilterOn || deskFilterOn) && (
        <div className="dcontrols" style={{ marginBottom: 14 }}>
          {unitFilterOn && (
            <Checklist
              label="Units"
              options={allUnits}
              selected={unitSel}
              onChange={setUnitSel}
              render={(u) => `Unit ${u}`}
            />
          )}
          {deskFilterOn && (
            <Checklist label="Dispatchers" options={allDesks} selected={deskSel} onChange={setDeskSel} />
          )}
        </div>
      )}

      {emptyUnits >= 3 && (
        <div className="fs-warn">
          <AlertIcon />
          {emptyUnits} units have no loads in this window. Widen the date range or clear filters if
          those trucks should appear.
        </div>
      )}

      {showRings && ringFamilies.length > 0 && (
        <div className="fs-ring-legend">
          {ringFamilies.map((f) => (
            <span key={f} style={{ color: trailerRingColor(f) }}>
              <i /> {f}
            </span>
          ))}
        </div>
      )}

      <p className="fs-meta">
        {dayColumns[0]?.ymd} → {dayColumns[dayColumns.length - 1]?.ymd} · {units.length} units shown ·{' '}
        {formatNumber(loadsInWindow)} loads in window
        {unitFilterOn && ' · unit filter on'}
        {deskFilterOn && ' · dispatcher filter on'}
      </p>

      {units.length === 0 ? (
        <div className="fs-empty">No units match the current filters.</div>
      ) : (
        <div className="fs-grid-wrap">
          <table className="fs-grid">
            <thead>
              <tr>
                <th>Unit</th>
                {dayColumns.map((col) => (
                  <th key={col.ymd} className={col.isWeekend ? 'is-weekend' : ''}>
                    {col.dowLabel}
                    <br />
                    {col.day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {units.map((u) => (
                <tr key={u.unitId}>
                  <th scope="row">{u.label}</th>
                  {u.days.map((cell) => (
                    <td key={cell.ymd}>
                      <span
                        className={`fs-bubble st-${cell.state}${showRings && cell.trailerType ? ' has-ring' : ''}`}
                        style={
                          showRings && cell.trailerType
                            ? ({ ['--ring' as string]: trailerRingColor(cell.trailerType) } as React.CSSProperties)
                            : undefined
                        }
                        title={cellTitle(cell)}
                      >
                        <span className="fs-cap">{cellCaption(cell, cellMode)}</span>
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot className="fs-foot">
              <tr className="loaded">
                <th scope="row">Loaded</th>
                {loadedRow.map((v, i) => (
                  <td key={i}>{v}</td>
                ))}
              </tr>
              <tr className="rate">
                <th scope="row">Σ load rate</th>
                {pickupRateRow.map((v, i) => (
                  <td key={i}>{v > 0 ? formatMoney(v) : '—'}</td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="fs-legend">
        <span><i style={{ background: 'var(--bubble-pickup)' }} /> Pickup (load rate on this day)</span>
        <span><i style={{ background: 'var(--bubble-transit)' }} /> In transit</span>
        <span><i style={{ background: 'var(--bubble-delivery)' }} /> Delivery day</span>
        <span><i style={{ background: 'var(--bubble-idle)', opacity: 0.4 }} /> Empty / idle</span>
      </div>
    </div>
  )
}
