import { useCallback, useMemo, useState } from 'react'
import type { WeekRange } from './types'

export interface RangePreset {
  value: string
  label: string
  /** number of trailing weeks; undefined = full season */
  weeks?: number
}

export const RANGE_PRESETS: RangePreset[] = [
  { value: 'full', label: 'Full season' },
  { value: 'last1', label: 'Last week', weeks: 1 },
  { value: 'last2', label: 'Last 2 weeks', weeks: 2 },
  { value: 'last4', label: 'Last 4 weeks', weeks: 4 },
]

export function useWeekRange(min: number, max: number) {
  const [range, setRange] = useState<WeekRange>({ start: min, end: max })

  const applyPreset = useCallback(
    (value: string) => {
      if (value === 'full') {
        setRange({ start: min, end: max })
        return
      }
      const m = /^last(\d+)$/.exec(value)
      if (!m) return
      const n = Number(m[1])
      setRange({ start: Math.max(min, max - n + 1), end: max })
    },
    [min, max],
  )

  const apply = useCallback(
    (start: number, end: number) => {
      const s = Math.max(min, Math.min(start, end))
      const e = Math.min(max, Math.max(start, end))
      setRange({ start: s, end: e })
    },
    [min, max],
  )

  const reset = useCallback(() => {
    setRange({ start: min, end: max })
  }, [min, max])

  /** which preset (if any) the current range corresponds to */
  const activePreset = useMemo(() => {
    if (range.start === min && range.end === max) return 'full'
    if (range.end === max) {
      const span = range.end - range.start + 1
      const hit = RANGE_PRESETS.find((p) => p.weeks === span)
      if (hit) return hit.value
    }
    return 'custom'
  }, [range, min, max])

  return { range, activePreset, applyPreset, apply, reset }
}
