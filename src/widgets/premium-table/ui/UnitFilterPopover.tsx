import { useRef, useState } from 'react'
import { Checklist } from './Checklist'
import { PopoverLayer } from './PopoverLayer'

/** The row filter opens over the board from its own checkbox. Rendered in flow it
 *  landed below the whole table, far from the control that summoned it.
 *
 *  Whether the panel is open is tracked apart from whether the filter is on:
 *  sharing one flag meant clicking away closed the panel by switching the filter
 *  off, throwing away the selection with it. */
export function UnitFilterPopover<T extends string | number>({
  label,
  on,
  onToggle,
  options,
  selected,
  onChange,
  render,
}: {
  label: string
  on: boolean
  onToggle(next: boolean): void
  options: T[]
  selected: Set<T>
  onChange(next: Set<T>): void
  render?: (opt: T) => string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  // Switching the filter on starts from everything ticked, so an empty set can
  // mean what it says — none — instead of doubling as "no filter yet".
  function setOn(next: boolean) {
    if (next && selected.size === 0) onChange(new Set(options))
    onToggle(next)
    setOpen(next)
  }

  return (
    <div className="unit-filter" ref={ref}>
      <label className="dcheck">
        <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} />
        {label}
      </label>
      {on && (
        <button
          type="button"
          className="unit-filter-count"
          aria-expanded={open}
          title={open ? 'Hide the list' : 'Change which rows are kept'}
          onClick={() => setOpen((v) => !v)}
        >
          {selected.size}
          <span className="unit-count-caret">{open ? '▲' : '▼'}</span>
        </button>
      )}
      <PopoverLayer
        open={open && on}
        anchor={ref}
        onClose={() => setOpen(false)}
        className="unit-filter-pop"
        label={label}
      >
        <Checklist
          label={label}
          options={options}
          selected={selected}
          onChange={onChange}
          {...(render ? { render } : {})}
        />
      </PopoverLayer>
    </div>
  )
}
