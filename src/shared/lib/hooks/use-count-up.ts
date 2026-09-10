import { useEffect, useRef, useState } from 'react'

const DEFAULT_DURATION_MS = 700

export function useCountUp(target: number, durationMs: number = DEFAULT_DURATION_MS): number {
  const [value, setValue] = useState(target)
  const from = useRef(0)

  useEffect(() => {
    if (
      !Number.isFinite(target) ||
      (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches)
    ) {
      setValue(target)
      return undefined
    }
    const start = performance.now()
    const base = from.current
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - (1 - t) ** 3
      setValue(base + (target - base) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
      else from.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])

  return value
}
