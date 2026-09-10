export interface Load {
  unitId: number
  week: number
  dispatcher: string
  trailerType: string
  family: string
  teamS: string
  grossRate: number
  miles: number
}

export interface WeekRange {
  start: number
  end: number
}

export interface WeeklyLedgerRow {
  week: number
  gross: number
  miles: number
  rpm: number
  loads: number
  activeUnits: number
  avgGrossPerUnitWeek: number
  avgLoadRate: number
}

export interface FamilyShareRow {
  family: string
  gross: number
  miles: number
  loads: number
  rpm: number
  pctFleetGross: number
  units: number
  dispatchers: number
}

export interface DispatcherRow {
  desk: string
  gross: number
  miles: number
  loads: number
  rpm: number
  pctFleetGross: number
  /** AW — desk Σ gross ÷ ledger weeks in window (no truck divisor) */
  avgGrossPerWeek: number
  /** D1 — desk Σ gross ÷ (ledger weeks × trucks on that desk) */
  avgGrossPerWeekPerUnit: number
  avgLoadRate: number
  activeUnits: number
}

export type MomentumMetric = 'gross' | 'rpm' | 'miles' | 'loads' | 'avgLoadRate' | 'avgGrossPerUnit'

export const MOMENTUM_METRIC_LABELS: Record<MomentumMetric, string> = {
  gross: 'Σ gross',
  rpm: 'RPM ($/mi)',
  miles: 'Σ miles',
  loads: 'Loads',
  avgLoadRate: 'Avg load rate ($/load)',
  avgGrossPerUnit: 'Fleet: week gross ÷ trucks',
}
