import { useRef, useState } from 'react'
import { PopoverLayer } from './PopoverLayer'

/** The dropdown that chooses which series a chart draws. The colour swatches make
 *  it the chart's key as well, so nothing has to be spelled out beside the plot. */
export function SeriesPicker<T extends string | number>({
  label = 'Show',
  options,
  hidden,
  onChange,
  colorOf,
  render,
  noun,
}: {
  label?: string
  options: T[]
  hidden: Set<T>
  onChange(next: Set<T>): void
  colorOf(option: T, index: number): string
  render?: (option: T) => string
  noun: string
}) {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  const shown = options.filter((o) => !hidden.has(o))

  function toggle(opt: T) {
    const next = new Set(hidden)
    if (next.has(opt)) next.delete(opt)
    else next.add(opt)
    onChange(next)
  }

  return (
    <div className="dfield bubble-pick" ref={box}>
      <label>{label}</label>
      <button type="button" className="dselect bubble-pick-btn" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {shown.length === options.length ? `All ${options.length} ${noun}` : `${shown.length} of ${options.length} ${noun}`}
        <span className="bubble-pick-caret">{open ? '▲' : '▼'}</span>
      </button>
      <PopoverLayer
        open={open}
        anchor={box}
        onClose={() => setOpen(false)}
        align="right"
        className="bubble-pick-pop"
        label={noun}
      >
        <div className="dchecklist-head">
          <button type="button" className="linklike" onClick={() => onChange(new Set())}>
            All
          </button>
          <button type="button" className="linklike" onClick={() => onChange(new Set(options))}>
            None
          </button>
        </div>
        <div className="bubble-pick-list">
          {options.map((opt, i) => (
            <label key={String(opt)}>
              <input type="checkbox" checked={!hidden.has(opt)} onChange={() => toggle(opt)} />
              <i style={{ background: colorOf(opt, i) }} />
              {render ? render(opt) : String(opt)}
            </label>
          ))}
        </div>
      </PopoverLayer>
    </div>
  )
}
