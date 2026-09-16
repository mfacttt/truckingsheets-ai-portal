import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'

/** Anchored panel rendered on the body. The dashboard cards clip their overflow,
 *  so a panel positioned inside one is cut off at the card's edge. */
export function PopoverLayer({
  open,
  anchor,
  onClose,
  align = 'left',
  className,
  children,
  label,
}: {
  open: boolean
  anchor: RefObject<HTMLElement | null>
  onClose(): void
  align?: 'left' | 'right'
  className: string
  children: ReactNode
  label: string
}) {
  const pop = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  useLayoutEffect(() => {
    if (!open) return setPos(null)
    function place() {
      const a = anchor.current?.getBoundingClientRect()
      if (!a) return
      const w = pop.current?.offsetWidth ?? 220
      const h = pop.current?.offsetHeight ?? 0
      const wanted = align === 'right' ? a.right - w : a.left
      const left = Math.min(Math.max(8, wanted), window.innerWidth - w - 8)
      const below = a.bottom + 6
      const top = below + h > window.innerHeight - 8 ? Math.max(8, a.top - h - 6) : below
      setPos({ top, left })
    }
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [open, align, anchor, children])

  useEffect(() => {
    if (!open) return
    function onDown(e: PointerEvent) {
      const t = e.target as Node
      if (!pop.current?.contains(t) && !anchor.current?.contains(t)) onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, anchor])

  if (!open) return null
  return createPortal(
    <div
      className={className}
      ref={pop}
      role="group"
      aria-label={label}
      style={pos ? { top: pos.top, left: pos.left } : { visibility: 'hidden' }}
    >
      {children}
    </div>,
    document.body,
  )
}
