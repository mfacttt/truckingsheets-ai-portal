import { useState } from 'react'

/** Count + expandable list, the compact cell the production board uses: a single
 *  entry reads as itself, several collapse to their count until you open them. */
export function CountExpandCell({ items, noun }: { items: (string | number)[]; noun: string }) {
  const [open, setOpen] = useState(false)
  if (items.length === 0) return <span>–</span>
  if (items.length === 1) return <span className="unit-count-single">{items[0]}</span>
  return (
    <div className="unit-count-cell">
      <div className="unit-count-head">
        <button
          type="button"
          className="unit-count-toggle"
          aria-expanded={open}
          aria-label={open ? `Hide ${noun}` : `Show ${noun}`}
          title={open ? `Hide ${noun}` : `Show ${noun}`}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '▼' : '▶'}
        </button>
        <span className="unit-count-n" title={`${items.length} ${noun}`}>
          {items.length}
        </span>
      </div>
      {open && <div className="unit-count-list">{items.join(', ')}</div>}
    </div>
  )
}
