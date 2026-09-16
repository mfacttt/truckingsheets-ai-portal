import { useRef, useState } from 'react'
import { PopoverLayer } from './PopoverLayer'

/** Count + expandable list, the compact cell the production board uses: a single
 *  entry reads as itself, several collapse to their count until you open them.
 *
 *  The list opens on a layer above the table rather than inside the cell: spelled
 *  out in place it widened the column enough to push the rest of the table under
 *  a scrollbar. */
export function CountExpandCell({ items, noun }: { items: (string | number)[]; noun: string }) {
  const [open, setOpen] = useState(false)
  const anchor = useRef<HTMLButtonElement>(null)

  if (items.length === 0) return <span>–</span>
  if (items.length === 1) return <span className="unit-count-single">{items[0]}</span>

  return (
    <div className="unit-count-cell">
      <button
        type="button"
        ref={anchor}
        className="unit-count-toggle"
        aria-expanded={open}
        aria-label={open ? `Hide ${noun}` : `Show ${noun}`}
        title={open ? `Hide ${noun}` : `Show ${noun}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="unit-count-n">{items.length}</span>
        <span className="unit-count-caret">{open ? '▲' : '▼'}</span>
      </button>
      <PopoverLayer
        open={open}
        anchor={anchor}
        onClose={() => setOpen(false)}
        align="right"
        className="unit-count-pop"
        label={noun}
      >
        <div className="unit-count-pop-head">
          {items.length} {noun}
        </div>
        <ul className="unit-count-pop-list">
          {items.map((it) => (
            <li key={String(it)}>{it}</li>
          ))}
        </ul>
      </PopoverLayer>
    </div>
  )
}
