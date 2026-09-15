import { useEffect, useRef } from 'react'
import { Checklist } from './Checklist'

/** The unit picker opens over the board from its own checkbox. Rendered in flow it
 *  landed below the whole table, far from the control that summoned it. */
export function UnitFilterPopover({
  on,
  onToggle,
  options,
  selected,
  onChange,
}: {
  on: boolean
  onToggle(next: boolean): void
  options: number[]
  selected: Set<number>
  onChange(next: Set<number>): void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!on) return
    function onDocPointerDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) onToggle(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onToggle(false)
    }
    document.addEventListener('pointerdown', onDocPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDocPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [on, onToggle])

  const count = selected.size

  return (
    <div className="unit-filter" ref={ref}>
      <label className="dcheck">
        <input type="checkbox" checked={on} onChange={(e) => onToggle(e.target.checked)} />
        Filter by units
        {on && count > 0 && <span className="unit-filter-count">{count}</span>}
      </label>
      {on && (
        <div className="unit-filter-pop" role="group" aria-label="Units">
          <Checklist label="Units" options={options} selected={selected} onChange={onChange} render={(u) => `Unit ${u}`} />
        </div>
      )}
    </div>
  )
}
