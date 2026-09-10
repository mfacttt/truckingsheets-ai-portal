export interface FleetStatusLoad {
  unitId: number
  sheetName: string
  loadId: string | null
  dispatcher: string | null
  pickup: string | null
  delivery: string | null
  loadRate: number | null
  trailerNumber: number | string | null
  trailerType: string | null
  week: number | null
  collectStatus: string
  miles: number | null
}

export type DayCellState = 'pickup' | 'transit' | 'delivery' | 'turn' | 'idle'

export interface DayCell {
  ymd: string
  state: DayCellState
  loadRate: number | null
  trailerNumber: number | string | null
  trailerType: string | null
  loadId: string | null
}

export interface UnitRow {
  unitId: number
  label: string
  loadCount: number
  days: DayCell[]
}

export interface DayColumn {
  ymd: string
  day: number
  dowLabel: string
  isWeekend: boolean
}
