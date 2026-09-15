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
  family: string
  metric: DashMetric
  topN: number
  setFamily(v: string): void
  setMetric(v: DashMetric): void
  setTopN(v: number): void
}

const DashFiltersContext = createContext<DashFilters | null>(null)

/** One filter set shared by every table and chart on the dashboard, so changing it
 *  anywhere applies everywhere — the boards are meant to be read together. */
export function DashFiltersProvider({ children }: { children: ReactNode }) {
  const [family, setFamily] = useState('All')
  const [metric, setMetric] = useState<DashMetric>('gross')
  const [topN, setTopN] = useState<number>(15)

  const value = useMemo<DashFilters>(
    () => ({ family, metric, topN, setFamily, setMetric, setTopN }),
    [family, metric, topN],
  )
  return <DashFiltersContext.Provider value={value}>{children}</DashFiltersContext.Provider>
}

export function useDashFilters(): DashFilters {
  const ctx = useContext(DashFiltersContext)
  if (!ctx) throw new Error('useDashFilters must be used inside <DashFiltersProvider>')
  return ctx
}
