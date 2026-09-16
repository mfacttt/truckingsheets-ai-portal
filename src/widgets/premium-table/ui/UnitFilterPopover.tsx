import { useRef } from 'react'
import { Checklist } from './Checklist'
import { PopoverLayer } from './PopoverLayer'

/** The row filter opens over the board from its own checkbox. Rendered in flow it
 *  landed below the whole table, far from the control that summoned it. */
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

  // Switching the filter on starts from everything ticked, so an empty set can
  // mean what it says — none — instead of doubling as "no filter yet".
  function setOn(next: boolean) {
    if (next && selected.size === 0) onChange(new Set(options))
    onToggle(next)
  }

  return (
    <div className="unit-filter" ref={ref}>
      <label className="dcheck">
        <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} />
        {label}
        {on && <span className="unit-filter-count">{selected.size}</span>}
      </label>
      <PopoverLayer
        open={on}
        anchor={ref}
        onClose={() => onToggle(false)}
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
