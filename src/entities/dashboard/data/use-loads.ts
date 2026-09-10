import { useMemo } from 'react'
import rawLoads from './loads.json'
import type { Load } from '../model/types'

export function useLoads(): Load[] {
  return useMemo(() => rawLoads as Load[], [])
}

export function weekBounds(loads: Load[]): { min: number; max: number } {
  let min = Infinity
  let max = -Infinity
  for (const l of loads) {
    if (l.week < min) min = l.week
    if (l.week > max) max = l.week
  }
  if (!Number.isFinite(min)) return { min: 1, max: 1 }
  return { min, max }
}
