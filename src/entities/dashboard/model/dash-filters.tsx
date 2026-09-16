import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type DashMetric = 'gross' | 'avgGrossWk' | 'rpm' | 'miles' | 'avgGrossWeekUnit' | 'avgLoadRate' | 'loads'

export const DASH_METRICS: { value: DashMetric; label: string }[] = [
  { value: 'gross', label: 'Gross' },
  { value: 'avgGrossWk', label: 'Avg $/wk' },
  { value: 'rpm', label: 'RPM' },
  { value: 'miles', label: 'Miles' },
  { value: 'avgGrossWeekUnit', label: 'Avg $/wk · unit' },
  { value: 'avgLoadRate', label: 'Avg load rate' },
  { value: 'loads', label: 'Loads' },
]

export const TOP_N_OPTIONS = [10, 15, 20, 0] as const

interface DashFilters {
  /** Empty means every family — the boards open on the whole fleet. */
  families: Set<string>
  metric: DashMetric
  topN: number
  units: Set<number>
  unitsOn: boolean
  setFamilies(v: Set<string>): void
  setMetric(v: DashMetric): void
  setTopN(v: number): void
  setUnits(v: Set<number>): void
  setUnitsOn(v: boolean): void
  /** True when the row's family is among the picked ones. */
  keepsFamily(family: string): boolean
}

const DashFiltersContext = createContext<DashFilters | null>(null)

/** One filter set shared by every table and chart on the dashboard, so changing it
 *  anywhere applies everywhere — the boards are meant to be read together. */
export function DashFiltersProvider({ children }: { children: ReactNode }) {
  const [families, setFamilies] = useState<Set<string>>(new Set())
  const [metric, setMetric] = useState<DashMetric>('gross')
  const [topN, setTopN] = useState<number>(15)
  // The unit pick belongs here rather than in a tab: the same trucks are meant to
  // be followed from the trailer boards through to the dispatcher ones.
  const [units, setUnits] = useState<Set<number>>(new Set())
  const [unitsOn, setUnitsOn] = useState(false)

  const value = useMemo<DashFilters>(
    () => ({
      families,
      metric,
      topN,
      units,
      unitsOn,
      setFamilies,
      setMetric,
      setTopN,
      setUnits,
      setUnitsOn,
      keepsFamily: (f: string) => families.size === 0 || families.has(f),
    }),
    [families, metric, topN, units, unitsOn],
  )
  return <DashFiltersContext.Provider value={value}>{children}</DashFiltersContext.Provider>
}

export function useDashFilters(): DashFilters {
  const ctx = useContext(DashFiltersContext)
  if (!ctx) throw new Error('useDashFilters must be used inside <DashFiltersProvider>')
  return ctx
}
