import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/** Count + expandable list, the compact cell the production board uses: a single
 *  entry reads as itself, several collapse to their count until you open them.
 *
 *  The list opens in a portal rather than inside the cell: laid out in the cell it
 *  widened the column enough to push the rest of the table under a scrollbar, and
 *  the table's own overflow would clip a popover positioned within it. */
export function CountExpandCell({ items, noun }: { items: (string | number)[]; noun: string }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const anchor = useRef<HTMLButtonElement>(null)
  const pop = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!open) return setPos(null)
    function place() {
      const a = anchor.current?.getBoundingClientRect()
      if (!a) return
      const width = pop.current?.offsetWidth ?? 240
      const height = pop.current?.offsetHeight ?? 0
      const left = Math.min(Math.max(8, a.left), window.innerWidth - width - 8)
      const below = a.bottom + 6
      const top = below + height > window.innerHeight - 8 ? Math.max(8, a.top - height - 6) : below
      setPos({ top, left })
    }
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [open, items.length])

  useEffect(() => {
    if (!open) return
    function onDown(e: PointerEvent) {
      const t = e.target as Node
      if (!pop.current?.contains(t) && !anchor.current?.contains(t)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

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
      {open &&
        createPortal(
          <div
            className="unit-count-pop"
            ref={pop}
            role="group"
            aria-label={noun}
            style={pos ? { top: pos.top, left: pos.left } : { visibility: 'hidden' }}
          >
            <div className="unit-count-pop-head">
              {items.length} {noun}
            </div>
            <ul className="unit-count-pop-list">
              {items.map((it) => (
                <li key={String(it)}>{it}</li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  )
}
