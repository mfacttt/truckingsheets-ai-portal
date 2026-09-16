import { useRef, useState } from 'react'
import { useDashFilters } from '@/entities/dashboard/model/dash-filters'
import { deskColor } from '@/entities/dashboard/lib/aggregate'
import { PopoverLayer } from '@/widgets/premium-table/ui/PopoverLayer'

/** The board-wide unit filter. It lives beside Family / Metric / Top N because it
 *  is one pick shared by every tab, not a per-table checkbox. */
export function UnitFilterButton({ options }: { options: number[] }) {
  const { units, unitsOn, setUnits, setUnitsOn } = useDashFilters()
  const [open, setOpen] = useState(false)
  const anchor = useRef<HTMLDivElement>(null)

  const active = unitsOn && units.size > 0 && units.size < options.length

  function openPanel() {
    // First open starts from the whole fleet ticked, so clearing the list can
    // mean none rather than doubling as "not filtered yet".
    if (units.size === 0) setUnits(new Set(options))
    if (!unitsOn) setUnitsOn(true)
    setOpen((v) => !v)
  }

  function toggle(unit: number) {
    const next = new Set(units)
    if (next.has(unit)) next.delete(unit)
    else next.add(unit)
    setUnits(next)
    setUnitsOn(true)
  }

  return (
    <div className="dfield unit-filter-field" ref={anchor}>
      <label>Units</label>
      <button
        type="button"
        className={`dselect unit-filter-btn${active ? ' is-active' : ''}`}
        aria-expanded={open}
        onClick={openPanel}
        title="Choose which trucks every table and chart counts"
      >
        <FunnelIcon />
        {active ? `${units.size} of ${options.length}` : 'All units'}
        <span className="unit-count-caret">{open ? '▲' : '▼'}</span>
      </button>

      <PopoverLayer open={open} anchor={anchor} onClose={() => setOpen(false)} className="unit-filter-pop" label="Units">
        <div className="unit-filter-pop-head">
          <span>Units on every board</span>
          <span className="unit-filter-pop-actions">
            <button type="button" className="linklike" onClick={() => { setUnits(new Set(options)); setUnitsOn(false) }}>
              All
            </button>
            <button type="button" className="linklike" onClick={() => { setUnits(new Set()); setUnitsOn(true) }}>
              None
            </button>
          </span>
        </div>
        <div className="bubble-pick-list">
          {options.map((u, i) => (
            <label key={u}>
              <input type="checkbox" checked={!unitsOn || units.has(u)} onChange={() => toggle(u)} />
              <i style={{ background: deskColor(i) }} />
              Unit {u}
            </label>
          ))}
        </div>
      </PopoverLayer>
    </div>
  )
}

function FunnelIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M1.5 2.5h13l-5 6v5l-3-1.6V8.5z" strokeLinejoin="round" />
    </svg>
  )
}
