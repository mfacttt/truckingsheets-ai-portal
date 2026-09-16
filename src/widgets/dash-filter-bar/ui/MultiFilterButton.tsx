import { useRef, useState } from 'react'
import { PopoverLayer } from '@/widgets/premium-table/ui/PopoverLayer'

/** A board filter that takes several values at once. An empty pick means every
 *  option, so the boards open on the whole fleet rather than on nothing. */
export function MultiFilterButton<T extends string | number>({
  label,
  options,
  picked,
  onChange,
  colorOf,
  render,
  allLabel,
}: {
  label: string
  options: T[]
  picked: Set<T>
  onChange(next: Set<T>): void
  colorOf?: (opt: T, index: number) => string
  render?: (opt: T) => string
  allLabel: string
}) {
  const [open, setOpen] = useState(false)
  const anchor = useRef<HTMLDivElement>(null)

  const all = picked.size === 0 || picked.size === options.length
  const checked = (opt: T) => picked.size === 0 || picked.has(opt)

  function toggle(opt: T) {
    // Starting from "all" the first tick means "only this one", which is what
    // clicking a single row in an unfiltered list is asking for.
    const base = picked.size === 0 ? new Set(options) : new Set(picked)
    if (base.has(opt)) base.delete(opt)
    else base.add(opt)
    onChange(base.size === options.length ? new Set() : base)
  }

  return (
    <div className="dfield unit-filter-field" ref={anchor}>
      <label>{label}</label>
      <button
        type="button"
        className={`dselect unit-filter-btn${all ? '' : ' is-active'}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <FunnelIcon />
        {all ? allLabel : `${picked.size} of ${options.length}`}
        <span className="unit-count-caret">{open ? '▲' : '▼'}</span>
      </button>

      <PopoverLayer open={open} anchor={anchor} onClose={() => setOpen(false)} className="unit-filter-pop" label={label}>
        <div className="unit-filter-pop-head">
          <span>{label}</span>
          <span className="unit-filter-pop-actions">
            <button type="button" className="linklike" onClick={() => onChange(new Set())}>
              All
            </button>
            <button type="button" className="linklike" onClick={() => onChange(new Set([options[0]!]))}>
              Only top
            </button>
          </span>
        </div>
        <div className="bubble-pick-list">
          {options.map((opt, i) => (
            <label key={String(opt)}>
              <input type="checkbox" checked={checked(opt)} onChange={() => toggle(opt)} />
              {colorOf && <i style={{ background: colorOf(opt, i) }} />}
              {render ? render(opt) : String(opt)}
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
